import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api";

type Promo = {
  enabled?: boolean;
  headline?: string;
  subheadline?: string;
  buttonLabel?: string;
  coupon?: string;
  delaySeconds?: number;
};

export function CmsEmailPromo({ promo, page }: { promo?: Promo | null; page: "real" | "cloak" }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!promo?.enabled) return;
    if (localStorage.getItem("cms-email-promo-dismissed") === "1") return;
    const delay = Math.max(4, Number(promo.delaySeconds || 12)) * 1000;
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [promo?.enabled, promo?.delaySeconds]);

  if (!promo?.enabled || !open) return null;

  const close = () => {
    localStorage.setItem("cms-email-promo-dismissed", "1");
    setOpen(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const res = await apiCall("/api/owner-cms/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage-promo", page, website: "" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save email");
      setStatus(promo.coupon ? `Saved. Use code ${promo.coupon} at checkout.` : "Saved. Watch your inbox for the offer.");
      localStorage.setItem("cms-email-promo-dismissed", "1");
    } catch (error: any) {
      setStatus(error.message || "Could not save email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-[#121826] p-5 text-white shadow-2xl border border-white/10">
        <button type="button" className="float-right text-2xl leading-none text-slate-400" onClick={close} aria-label="Close email offer">
          ×
        </button>
        <h3 className="pr-8 text-xl font-semibold">{promo.headline || "Get the current sale"}</h3>
        <p className="mt-2 text-sm text-slate-300">{promo.subheadline || "Leave your email and we will send the offer."}</p>
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-white"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-11 rounded-lg bg-blue-600 font-semibold hover:bg-blue-500 disabled:opacity-60"
          >
            {busy ? "Saving..." : promo.buttonLabel || "Send my code"}
          </button>
        </form>
        {status ? <p className="mt-3 text-sm text-teal-300">{status}</p> : null}
      </div>
    </div>
  );
}
