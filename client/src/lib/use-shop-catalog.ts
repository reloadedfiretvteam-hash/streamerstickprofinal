import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api";
import { dollarsFromCatalog, packageImage } from "@/lib/package-art";
import { HD_ID, K4_ID, resolveDeviceSku } from "@/lib/device-skus";

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  availability?: string;
};

export type CatalogStatus = "loading" | "ready" | "error";

function stockLabel(value?: string) {
  const raw = String(value || "").toLowerCase();
  if (raw === "in_stock" || raw === "in stock") return "In stock";
  if (raw === "out_of_stock" || raw === "out of stock") return "Out of stock";
  if (!raw) return "Not listed in catalog";
  return "Check availability";
}

export function useShopCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [status, setStatus] = useState<CatalogStatus>("loading");

  const load = () => {
    setStatus("loading");
    apiCall("/api/products")
      .then((res) => res.json())
      .then((result) => {
        const rows = Array.isArray(result?.data) ? result.data : [];
        setProducts(
          rows
            .filter(
              (p: any) =>
                String(p.category || "").toLowerCase() !== "promotion" &&
                !String(p.id || "").startsWith("iptv-promo-") &&
                p.id !== "promo-hardware-200",
            )
            .map((p: any) => ({
              id: String(p.id),
              name: String(p.name || p.id),
              price: dollarsFromCatalog(p.price),
              image: packageImage(p.id, p.imageUrl),
              description: String(p.description || ""),
              category: String(p.category || ""),
              availability: p.availability || p.stock_status,
            })),
        );
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    load();
  }, []);

  const byId = (id: string) => products.find((p) => p.id === resolveDeviceSku(id));
  const hd = byId(HD_ID);
  const k4 = byId(K4_ID);

  return {
    products,
    status,
    retry: load,
    byId,
    hd,
    k4,
    money: (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`),
    stockLabel,
  };
}
