import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { PillarLayout } from "@/components/PillarLayout";
import { SEOSchema } from "@/components/SEOSchema";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

const SITE_URL = "https://streamstickpro.com";

interface ContentBlocks {
  h2_sections?: { heading: string; body: string }[];
  numbered_lists?: { title: string; items: string[] }[];
  tables?: { caption: string; headers: string[]; rows: string[][] }[];
}

interface SeoPage {
  country: string;
  region?: string;
  location?: string;
  slug: string;
  page_type: string;
  title: string;
  meta_description?: string;
  h1: string;
  p1_snippet?: string;
  pillar_url?: string;
  internal_links?: { url?: string; anchor?: string }[];
  faq_json?: { question?: string; answer?: string }[];
  content_blocks?: ContentBlocks;
}

const COUNTRY_LABEL: Record<string, string> = {
  USA: "USA",
  CA: "Canada",
  UK: "United Kingdom",
};

const PAGE_TYPE_LABEL: Record<string, string> = {
  iptv: "IPTV",
  jailbreak: "Jailbroken Fire Stick",
  google: "Google TV",
  unlocked: "Unlocked Fire Stick",
  onn: "ONN Google TV",
};

export default function LocationPage() {
  const [, params] = useRoute("/l/:country/:pageType/:slug");
  const country = params?.country ?? "";
  const pageType = params?.pageType ?? "";
  const slug = params?.slug ?? "";

  const [page, setPage] = useState<SeoPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!country || !pageType || !slug) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);
    fetch(`/api/seo-page/${encodeURIComponent(country)}/${encodeURIComponent(pageType)}/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setPage(data);
        setLoading(false);
      })
      .catch(() => {
        setPage(null);
        setLoading(false);
        setError(true);
      });
  }, [country, pageType, slug]);

  useEffect(() => {
    if (!page) return;
    const rawTitle = (page.title || page.h1 || "IPTV & Jailbroken Fire Stick") + " | StreamStick Pro";
    const title = rawTitle.length > 60 ? rawTitle.slice(0, 57) + "..." : rawTitle;
    const desc = (page.meta_description || page.p1_snippet || "").substring(0, 160);
    const canonicalUrl = `${SITE_URL}/l/${country}/${pageType}/${slug}`;
    const ogImage = `${SITE_URL}/opengraph.jpg`;

    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", desc);
    setMeta("og:title", title, true);
    setMeta("og:description", desc, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:type", "website", true);
    setMeta("og:image", ogImage, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", ogImage);

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.rel = "canonical";
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    return () => {
      document.title = "StreamStickPro - Get Fully Loaded Streaming in 10 Minutes";
    };
  }, [page, country, pageType, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Spinner className="w-10 h-10 text-orange-500" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <p className="text-gray-400 mb-6">This location or topic page could not be loaded.</p>
        <Link href="/">
          <Button className="bg-orange-500 hover:bg-orange-600">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const countryLabel = COUNTRY_LABEL[page.country.toUpperCase()] || page.country;
  const typeLabel = PAGE_TYPE_LABEL[page.page_type] || page.page_type;
  const locationLabel = page.location || page.region || slug;
  const displayH1 = (page.h1 || "").replace(/\[LOCATION\]/g, locationLabel);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: countryLabel, href: "/" },
    { label: typeLabel, href: page.pillar_url || (page.page_type === "iptv" ? "/iptv-services" : page.page_type === "jailbreak" || page.page_type === "unlocked" ? "/jailbroken-fire-sticks" : page.page_type === "onn" ? "/onn-google-tv" : "/iptv-media-players") },
    { label: locationLabel, href: `/l/${country}/${pageType}/${slug}` },
  ];

  const faq = (() => {
    const raw = Array.isArray(page.faq_json)
      ? page.faq_json
          .map((f) => ({ question: (f?.question ?? "").trim(), answer: (f?.answer ?? "").trim() }))
          .filter((f) => f.question && f.answer && f.answer.length >= 25)
      : [];
    const bad = new Set(["n/a", "na", "location", "[location]", "tbd", "tba"]);
    return raw.filter((f) => !bad.has(f.answer.toLowerCase()) && !bad.has(f.question.toLowerCase()));
  })();

  const schemaBreadcrumbs = breadcrumbs.map((b) => ({
    name: b.label,
    url: b.href.startsWith("http") ? b.href : `${SITE_URL}${b.href}`,
  }));

  const internalLinks = Array.isArray(page.internal_links) ? page.internal_links : [];
  const replaceLoc = (s: string) => (s || "").replace(/\[LOCATION\]/g, locationLabel);
  const blocks = page.content_blocks || {};
  const h2Sections = Array.isArray(blocks.h2_sections) ? blocks.h2_sections : [];
  const numberedLists = Array.isArray(blocks.numbered_lists) ? blocks.numbered_lists : [];
  const tables = Array.isArray(blocks.tables) ? blocks.tables : [];

  return (
    <>
      <SEOSchema
        faq={faq.length > 0 ? faq : undefined}
        breadcrumbs={schemaBreadcrumbs.length > 0 ? schemaBreadcrumbs : undefined}
      />
      <PillarLayout
        title={displayH1}
        description={page.p1_snippet}
        breadcrumbs={breadcrumbs}
      >
        {page.p1_snippet && (
          <p className="text-xl text-gray-300 mb-6">{page.p1_snippet}</p>
        )}

        {h2Sections.length > 0 && (
          <section className="mb-8">
            {h2Sections.map((sec, i) => (
              <div key={i} className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{replaceLoc(sec.heading)}</h2>
                <p className="text-gray-300">{replaceLoc(sec.body)}</p>
              </div>
            ))}
          </section>
        )}

        {numberedLists.length > 0 && (
          <section className="mb-8">
            {numberedLists.map((list, i) => (
              <div key={i} className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-3">{replaceLoc(list.title)}</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  {(list.items || []).map((item, j) => (
                    <li key={j}>{replaceLoc(item)}</li>
                  ))}
                </ol>
              </div>
            ))}
          </section>
        )}

        {tables.length > 0 && (
          <section className="mb-8 overflow-x-auto">
            {tables.map((tbl, i) => (
              <div key={i} className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-3">{replaceLoc(tbl.caption)}</h2>
                <table className="w-full border border-white/20 rounded-lg text-gray-300">
                  <thead>
                    <tr className="bg-white/5">
                      {(tbl.headers || []).map((h, j) => (
                        <th key={j} className="px-4 py-2 text-left font-semibold text-white border-b border-white/20">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(tbl.rows || []).map((row, j) => (
                      <tr key={j} className="border-b border-white/10">
                        {row.map((cell, k) => (
                          <td key={k} className="px-4 py-2">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </section>
        )}

        {internalLinks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">Related guides</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {internalLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.url || "#"} className="text-orange-400 hover:underline">
                    {link.anchor || link.url}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {faq.length > 0 && (
          <section className="mt-8">
            <h2 id="faq" className="text-2xl font-bold text-white mb-4">FAQ</h2>
            <dl className="space-y-4">
              {faq.map((item, i) => (
                <div key={i}>
                  <dt className="font-semibold text-white">{item.question}</dt>
                  <dd className="text-gray-300 mt-1 ml-0">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="mt-12 p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to stream?</h2>
          <p className="text-gray-300 mb-4">
            StreamStickPro delivers 18,000+ IPTV channels and jailbroken Fire Sticks with Kodi/Stremio pre-installed. Works on Google TV and Chromecast. Free trial available.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600">View Home & Shop</Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">Shop Plans</Button>
            </Link>
            <Link href="/jailbroken-fire-sticks">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">Jailbroken Fire Sticks</Button>
            </Link>
            <Link href="/iptv-services">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">IPTV Guide</Button>
            </Link>
            <Link href="/iptv-media-players">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">Google TV IPTV</Button>
            </Link>
          </div>
        </section>
      </PillarLayout>
    </>
  );
}
