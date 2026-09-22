import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api";

export function CmsPresence() {
  const [online, setOnline] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiCall("/api/owner-cms/presence");
        const json = await res.json();
        const count = Number(json?.data?.onlineNow || 0);
        if (!cancelled) setOnline(count);
      } catch {
        if (!cancelled) setOnline(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (online < 2) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 rounded-full border border-white/10 bg-[#0b1220]/90 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
      {online} people shopping now
    </div>
  );
}
