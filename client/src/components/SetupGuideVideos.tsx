import { SETUP_VIDEOS } from "@/lib/offer-copy";

export function SetupGuideVideos({ compact = false }: { compact?: boolean }) {
  return (
    <div className="stg-two">
      {SETUP_VIDEOS.map((guide) => (
        <article key={guide.id} id={guide.id} className="stg-panel overflow-hidden p-0">
          <div className="stg-video">
            <iframe
              src={`https://www.youtube.com/embed/${guide.youtube}`}
              title={guide.title}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <div className="p-6">
            <p className="text-sm font-semibold tracking-[0.12em] text-[#536275]">{guide.heading}</p>
            <h3 className="mt-2">{guide.title}</h3>
            <p className="mt-3 text-[#536275]">{guide.body}</p>
            {compact ? null : (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-[#536275]">
                {guide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
