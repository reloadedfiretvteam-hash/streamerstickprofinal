import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { StorefrontChrome } from "@/components/StorefrontChrome";
import { setPageMeta } from "@/lib/seo";

export function GuidesCatalog() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageMeta({
      title: "Google TV & Device Setup Guides | StreamStickPro",
      description:
        "Written setup steps for ONN and Google TV, plus troubleshooting. A video alone is not the guide. Links to devices and plans.",
      path: "/guides",
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/owner-cms/guides");
        const json = await res.json();
        if (!cancelled) setGuides(Array.isArray(json.data) ? json.data : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StorefrontChrome>
    <div className="bg-[#f4f6f8]">
      <div className="bg-[#0b1220] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Setup &amp; Compatibility</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Setup guides you can follow</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Each guide has written steps. A video can sit beside the steps. It does not replace them.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        {loading && <p>Loading guides…</p>}
        {!loading && !guides.length && (
          <div className="rounded-2xl border bg-white p-8">
            <p className="text-slate-600">
              Written guides publish here from the admin panel. Video walkthroughs are on{" "}
              <Link href="/setup" className="text-blue-700 underline">
                the setup page
              </Link>
              .
            </p>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((g) => (
            <Link
              key={g.id || g.slug}
              href={`/guides/${encodeURIComponent(g.slug)}`}
              className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">{g.category || "setup"}</p>
              <h2 className="mt-2 text-xl font-semibold">{g.title}</h2>
              <p className="mt-2 text-sm text-slate-600 line-clamp-3">{g.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </StorefrontChrome>
  );
}

export function GuideDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug || "");
  const [guide, setGuide] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/owner-cms/guides/${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (!cancelled) {
          if (!json.data) setError("not_found");
          else setGuide(json.data);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!guide) return;
    setPageMeta({
      title: guide.seo_title || guide.title || "Setup guide",
      description: guide.seo_description || guide.summary || "Written setup steps for StreamStickPro.",
      path: `/guides/${encodeURIComponent(guide.slug || slug)}`,
    });
  }, [guide, slug]);

  if (error === "not_found") {
    return (
      <StorefrontChrome>
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-2xl font-semibold">Guide not found</h1>
        <Link href="/guides" className="mt-4 inline-block text-blue-700 underline">
          Back to guides
        </Link>
      </div>
      </StorefrontChrome>
    );
  }
  if (!guide) {
    return (
      <StorefrontChrome>
        <div className="mx-auto max-w-3xl px-4 py-20">Loading…</div>
      </StorefrontChrome>
    );
  }

  const steps = Array.isArray(guide.written_steps) ? guide.written_steps : [];
  const prereq = Array.isArray(guide.prerequisites) ? guide.prerequisites : [];
  const faq = Array.isArray(guide.faq) ? guide.faq : [];
  const yt = youtubeEmbedId(guide.youtube_url);

  return (
    <StorefrontChrome>
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm uppercase tracking-wide text-blue-700">{guide.category || "setup"}</p>
      <h1 className="mt-2 text-4xl font-semibold">{guide.title}</h1>
      {guide.summary ? <p className="mt-4 text-lg text-slate-600">{guide.summary}</p> : null}

      {prereq.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Prerequisites</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {prereq.map((p: any, i: number) => (
              <li key={i}>{typeof p === "string" ? p : p?.label}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {steps.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Steps</h2>
          <ol className="mt-4 list-decimal space-y-4 pl-5">
            {steps.map((s: any, i: number) => (
              <li key={i} className="pl-1">
                <p className="font-medium">{s.title || s.heading || `Step ${i + 1}`}</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-700">{s.body || s.text || s}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          This guide needs written steps in the owner CMS. A video alone is not enough.
        </p>
      )}

      {yt ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Video</h2>
          <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${yt}`}
              title={guide.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}

      {faq.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">FAQ</h2>
          <div className="mt-4 space-y-3">
            {faq.map((f: any, i: number) => (
              <div key={i} className="rounded-xl border p-4">
                <h3 className="font-medium">{f.question || f.q}</h3>
                <p className="mt-1 text-slate-600">{f.answer || f.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/devices" className="rounded-xl border px-4 py-2 text-sm">
          Google TV devices
        </Link>
        <Link href="/plans" className="rounded-xl border px-4 py-2 text-sm">
          Plans &amp; services
        </Link>
        <Link href="/support" className="rounded-xl border px-4 py-2 text-sm">
          Support
        </Link>
      </div>
    </article>
    </StorefrontChrome>
  );
}

function youtubeEmbedId(url?: string | null) {
  if (!url) return null;
  const m =
    String(url).match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/) ||
    String(url).match(/^([A-Za-z0-9_-]{6,})$/);
  return m ? m[1] : null;
}

export default GuidesCatalog;
