import type { SupabaseClient } from "@supabase/supabase-js";
import { isHiddenPromoProduct } from "../../shared/promo-banners";

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  category: string;
  brand: string;
  availability: "in_stock" | "out_of_stock";
};

const SITE = "https://streamstickpro.com";

export function isGoogleDeviceProduct(product: { id?: string; name?: string; category?: string }): boolean {
  const id = String(product.id || "").toLowerCase();
  const name = String(product.name || "").toLowerCase();
  const category = String(product.category || "").toLowerCase();
  if (id.includes("firestick") || name.includes("fire stick")) return false;
  return /onn|google/.test(id) || /onn|google tv/.test(name) || category === "devices";
}

function absoluteImage(url?: string | null): string {
  const value = String(url || "").trim();
  if (!value) return `${SITE}/images/onn-4k-google-tv.jpg`;
  if (value.startsWith("http")) return value;
  return `${SITE}${value.startsWith("/") ? value : `/${value}`}`;
}

function toCents(price: unknown): number {
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n >= 1000 ? Math.round(n) : Math.round(n * 100);
}

export async function loadShopProducts(client: SupabaseClient): Promise<ShopProduct[]> {
  const { data, error } = await client
    .from("real_products")
    .select("id,name,description,price,image_url,category")
    .order("name");
  if (error || !data) return [];
  return data.filter((row) => !isHiddenPromoProduct({ id: row.id, category: row.category })).map((row) => ({
    id: String(row.id),
    name: String(row.name || row.id),
    description: String(row.description || row.name || ""),
    priceCents: toCents(row.price),
    imageUrl: absoluteImage(row.image_url),
    category: String(row.category || ""),
    brand: /onn/i.test(String(row.name || row.id)) ? "ONN" : "StreamStickPro",
    availability: "in_stock" as const,
  }));
}

export function googleDevices(products: ShopProduct[]): ShopProduct[] {
  return products.filter(isGoogleDeviceProduct);
}

export function asCmsDevice(product: ShopProduct) {
  return {
    sku: product.id,
    real_product_id: product.id,
    public_title: product.name,
    brand: product.brand,
    condition: "new",
    category: "google-tv",
    short_description: product.description,
    full_description: product.description,
    public_display_price_cents: product.priceCents,
    primary_image_url: product.imageUrl,
    image_alt: product.name,
    availability: product.availability,
    status: "published",
    seo_title: `${product.name} | StreamStickPro`,
    seo_description: product.description.slice(0, 155),
  };
}

export function productJsonLd(product: ShopProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE}/devices/${encodeURIComponent(product.id)}#product`,
    name: product.name,
    description: product.description,
    sku: product.id,
    mpn: product.id,
    brand: { "@type": "Brand", name: product.brand },
    image: [product.imageUrl],
    url: `${SITE}/devices/${encodeURIComponent(product.id)}`,
    offers: {
      "@type": "Offer",
      url: `${SITE}/devices/${encodeURIComponent(product.id)}`,
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "StreamStickPro", url: SITE },
      eligibleRegion: [
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "Canada" },
      ],
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10),
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 7, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };
}

export function itemListJsonLd(products: ShopProduct[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ONN Google TV Devices",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE}/devices/${encodeURIComponent(product.id)}`,
      item: productJsonLd(product),
    })),
  };
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function merchantRssXml(products: ShopProduct[]): string {
  const items = products
    .map((product) => {
      const link = `${SITE}/devices/${encodeURIComponent(product.id)}`;
      return `    <item>
      <title>${xmlEscape(product.name)}</title>
      <link>${xmlEscape(link)}</link>
      <description>${xmlEscape(product.description)}</description>
      <g:id>${xmlEscape(product.id)}</g:id>
      <g:title>${xmlEscape(product.name)}</g:title>
      <g:description>${xmlEscape(product.description)}</g:description>
      <g:link>${xmlEscape(link)}</g:link>
      <g:image_link>${xmlEscape(product.imageUrl)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${(product.priceCents / 100).toFixed(2)} USD</g:price>
      <g:condition>new</g:condition>
      <g:brand>${xmlEscape(product.brand)}</g:brand>
      <g:identifier_exists>false</g:identifier_exists>
      <g:mpn>${xmlEscape(product.id)}</g:mpn>
      <g:google_product_category>Electronics &gt; Communications &gt; Television Accessories</g:google_product_category>
      <g:product_type>Electronics &gt; Streaming Devices &gt; Google TV</g:product_type>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>StreamStickPro Google TV Devices</title>
    <link>${SITE}/devices</link>
    <description>Google HD and 4K packages with live prices for Google, Bing, and Merchant Center.</description>
${items}
  </channel>
</rss>`;
}
