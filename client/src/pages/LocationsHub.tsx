import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { PillarLayout } from "@/components/PillarLayout";
import { setPageMeta, truncateMetaDescription, truncateTitle } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const SITE_URL = "https://streamstickpro.com";

type HubCountry = { code: string; count: number };
type HubPageType = { pageType: string; count: number };
type HubRegion = { region: string; count: number; sample: { url: string; title?: string }[] };
type HubCity = { url: string; title?: string };

const COUNTRY_LABEL: Record<string, string> = { usa: "USA", ca: "Canada", uk: "United Kingdom" };
const PAGE_TYPE_LABEL: Record<string, string> = {
  iptv: "IPTV",
  jailbreak: "Jailbroken Fire Stick",
  unlocked: "Unlocked Fire Stick",
  google: "Google TV",
  onn: "ONN Google TV",
};

function titleCase(s: string): string {
  return (s || "")
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function LocationsHub() {
  const [loc] = useLocation();

  const params = useMemo(() => {
    const url = new URL(loc, SITE_URL);
    const sp = url.searchParams;
    return {
      country: (sp.get("country") || "").toLowerCase(),
      pageType: (sp.get("pageType") || "").toLowerCase(),
      region: (sp.get("region") || "").toLowerCase(),
    };
  }, [loc]);

  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<HubCountry[]>([]);
  const [pageTypes, setPageTypes] = useState<HubPageType[]>([]);
  const [regions, setRegions] = useState<HubRegion[]>([]);
  const [cities, setCities] = useState<HubCity[]>([]);

  useEffect(() => {
    const labelCountry = COUNTRY_LABEL[params.country] || (params.country ? params.country.toUpperCase() : "USA, Canada, UK");
    const labelType = PAGE_TYPE_LABEL[params.pageType] || (params.pageType ? titleCase(params.pageType) : "");
    const labelRegion = params.region ? params.region.toUpperCase() : "";
    const title = truncateTitle(
      params.country
        ? params.pageType
          ? params.region
            ? `${labelType} Guides in ${labelCountry} (${labelRegion})`
            : `${labelType} Guides in ${labelCountry}`
          : `Streaming Guides in ${labelCountry}`
        : "Streaming Guides by Location (USA, Canada, UK)"
    );
    const description = truncateMetaDescription(
      params.country
        ? params.pageType
          ? `Browse ${labelType} guides by region and city in ${labelCountry}.`
          : `Browse IPTV, Fire Stick, and Google TV guides by region and city in ${labelCountry}.`
        : "Browse IPTV, Fire Stick, and Google TV guides by location. Find setup tips, device options, and 36-hour subscription trial info."
    );

    setPageMeta({
      title,
      description,
      path: `/locations${loc.includes("?") ? loc.slice(loc.indexOf("?")) : ""}`,
      ogImage: `${SITE_URL}/opengraph.jpg`,
      type: "website",
    });
  }, [loc, params.country, params.pageType, params.region]);

  useEffect(() => {
    setLoading(true);
    setCountries([]);
    setPageTypes([]);
    setRegions([]);
    setCities([]);

    const q = new URLSearchParams();
    if (params.country) q.set("country", params.country);
    if (params.pageType) q.set("pageType", params.pageType);
    if (params.region) q.set("region", params.region);
    const url = `/api/locations/hub${q.toString() ? `?${q.toString()}` : ""}`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("hub fetch failed"))))
      .then((data) => {
        if (Array.isArray(data?.countries)) setCountries(data.countries);
        if (Array.isArray(data?.pageTypes)) setPageTypes(data.pageTypes);
        if (Array.isArray(data?.regions)) setRegions(data.regions);
        if (Array.isArray(data?.cities)) setCities(data.cities);
      })
      .catch(() => {
        // keep empty state
      })
      .finally(() => setLoading(false));
  }, [params.country, params.pageType, params.region]);

  const breadcrumbs = useMemo(() => {
    const items = [{ label: "Home", href: "/" }, { label: "Locations", href: "/locations" }];
    if (params.country) items.push({ label: COUNTRY_LABEL[params.country] || params.country.toUpperCase(), href: `/locations?country=${encodeURIComponent(params.country)}` });
    if (params.country && params.pageType) items.push({ label: PAGE_TYPE_LABEL[params.pageType] || titleCase(params.pageType), href: `/locations?country=${encodeURIComponent(params.country)}&pageType=${encodeURIComponent(params.pageType)}` });
    if (params.country && params.pageType && params.region) items.push({ label: params.region.toUpperCase(), href: `/locations?country=${encodeURIComponent(params.country)}&pageType=${encodeURIComponent(params.pageType)}&region=${encodeURIComponent(params.region)}` });
    return items;
  }, [params.country, params.pageType, params.region]);

  const heading = (() => {
    if (!params.country) return "Locations (USA, Canada, UK)";
    const c = COUNTRY_LABEL[params.country] || params.country.toUpperCase();
    if (!params.pageType) return `Locations in ${c}`;
    const t = PAGE_TYPE_LABEL[params.pageType] || titleCase(params.pageType);
    if (!params.region) return `${t} Guides in ${c}`;
    return `${t} Guides in ${c} (${params.region.toUpperCase()})`;
  })();

  const description = (() => {
    if (!params.country) return "Browse streaming guides by country, category, region, and city. This hub creates clean internal links so search engines discover every location page.";
    if (params.country && !params.pageType) return "Pick a category to drill down into regions and cities.";
    if (params.country && params.pageType && !params.region) return "Pick a region, then choose a city guide.";
    return "Choose a city guide below.";
  })();

  return (
    <PillarLayout title={heading} description={description} breadcrumbs={breadcrumbs}>
      {loading && (
        <div className="flex items-center gap-3 text-gray-300">
          <Spinner className="w-5 h-5 text-orange-500" /> Loading location hubs…
        </div>
      )}

      {!loading && !params.country && countries.length > 0 && (
        <section className="not-prose">
          <h2 className="text-2xl font-bold text-white mb-3">Choose a country</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {countries.slice(0, 6).map((c) => (
              <Link key={c.code} href={`/locations?country=${encodeURIComponent(c.code)}`}>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer">
                  <div className="text-lg font-bold">{COUNTRY_LABEL[c.code] || c.code.toUpperCase()}</div>
                  <div className="text-sm text-gray-300">{c.count.toLocaleString()} pages</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && params.country && !params.pageType && pageTypes.length > 0 && (
        <section className="not-prose">
          <h2 className="text-2xl font-bold text-white mb-3">Choose a guide type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pageTypes.slice(0, 12).map((t) => (
              <Link key={t.pageType} href={`/locations?country=${encodeURIComponent(params.country)}&pageType=${encodeURIComponent(t.pageType)}`}>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer">
                  <div className="text-lg font-bold">{PAGE_TYPE_LABEL[t.pageType] || titleCase(t.pageType)}</div>
                  <div className="text-sm text-gray-300">{t.count.toLocaleString()} pages</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && params.country && params.pageType && !params.region && regions.length > 0 && (
        <section className="not-prose">
          <h2 className="text-2xl font-bold text-white mb-3">Choose a region</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {regions.slice(0, 40).map((r) => (
              <div key={r.region} className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold">{r.region.toUpperCase()}</div>
                    <div className="text-sm text-gray-300">{r.count.toLocaleString()} pages</div>
                  </div>
                  <Link href={`/locations?country=${encodeURIComponent(params.country)}&pageType=${encodeURIComponent(params.pageType)}&region=${encodeURIComponent(r.region)}`}>
                    <Button className="bg-orange-500 hover:bg-orange-600">View cities</Button>
                  </Link>
                </div>
                {r.sample?.length > 0 && (
                  <ul className="mt-3 text-sm text-gray-300 list-disc list-inside space-y-1">
                    {r.sample.slice(0, 3).map((s) => (
                      <li key={s.url}>
                        <Link className="text-orange-300 hover:underline" href={s.url}>
                          {s.title || s.url}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && params.country && params.pageType && params.region && cities.length > 0 && (
        <section className="not-prose">
          <h2 className="text-2xl font-bold text-white mb-3">City guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {cities.slice(0, 60).map((c) => (
              <Link key={c.url} href={c.url}>
                <div className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer">
                  <div className="font-semibold text-orange-200">{c.title || c.url}</div>
                  <div className="text-xs text-gray-400">{c.url}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && params.country && params.pageType && params.region && cities.length === 0 && (
        <div className="not-prose text-gray-300">No city list available yet for this region.</div>
      )}
    </PillarLayout>
  );
}

