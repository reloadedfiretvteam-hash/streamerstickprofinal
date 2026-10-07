import { useEffect, useState } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { StagingFooter, StagingHeader } from "@/components/staging/StagingChrome";
import "@/styles/staging.css";

const FINDER = ["Fire TV", "Google TV", "ONN", "Android TV", "Smart TV", "I’m Not Sure"] as const;
const PREF_KEY = "ssp-device-pref";

export default function DeviceFinderPage() {
  const [finder, setFinder] = useState("");
  const [shown, setShown] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setPageMeta({
      title: "Find your setup | StreamStickPro",
      description: "Pick your device to find compatibility information and the right setup guide.",
      path: "/device-finder",
    });
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "null");
      if (saved?.choice && saved.until > Date.now()) setFinder(saved.choice);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="stg min-h-screen">
      <StagingHeader />
      <main id="main-content" className="stg-section stg-sub bg-[#F5F2EA]">
        <div className="stg-shell">
          <p className="text-sm text-[#536275]">
            <Link href="/">Home</Link> / Device Finder
          </p>
          <h1 className="mt-6">What are you watching on?</h1>
          <p className="mt-4 max-w-3xl text-[#536275]">
            Pick your device to find compatibility information and the right setup guide. Selection alone does not change the page.
          </p>
          <fieldset className="mt-8">
            <legend className="font-semibold">Device type</legend>
            <div className="stg-finder mt-4">
              {FINDER.map((label) => (
                <label key={label}>
                  <input type="radio" name="finder-device" value={label} checked={finder === label} onChange={() => setFinder(label)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            className="stg-btn stg-btn-primary mt-6"
            onClick={() => {
              setShown(true);
              if (remember && finder) {
                localStorage.setItem(PREF_KEY, JSON.stringify({ choice: finder, until: Date.now() + 30 * 24 * 60 * 60 * 1000 }));
              }
            }}
          >
            Show My Options
          </button>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember this device on this browser
          </label>
          {remember ? (
            <button
              type="button"
              className="ml-2 text-sm underline"
              onClick={() => {
                setRemember(false);
                localStorage.removeItem(PREF_KEY);
              }}
            >
              Forget saved device
            </button>
          ) : null}
          <div className="mt-6 rounded-2xl border border-[#D7DFE7] bg-white p-6" aria-live="polite">
            {!shown ? (
              <p>Choose a device, then select Show My Options.</p>
            ) : (
              <>
                <p className="font-semibold">We have not confirmed this setup.</p>
                <p className="mt-2 text-[#536275]">
                  {finder || "This choice"} is a category, not a tested model. Send the exact model number before ordering a plan.
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Link href="/compatibility/">
                    <span className="underline">Check Compatibility</span>
                  </Link>
                  <Link href="/setup/">
                    <span className="underline">Setup guides</span>
                  </Link>
                  <Link href="/contact/?topic=compatibility">
                    <span className="underline">Contact with model number</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <StagingFooter />
    </div>
  );
}
