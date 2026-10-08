import { useEffect, useState } from "react";
import { Link } from "wouter";

const FINDER = ["Fire TV", "Google TV", "ONN", "Android TV", "Smart TV", "I’m Not Sure"] as const;
const PREF_KEY = "ssp-device-pref";

export function DeviceFinderBlock() {
  const [finder, setFinder] = useState("");
  const [shown, setShown] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "null");
      if (saved?.choice && saved.until > Date.now()) setFinder(saved.choice);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <section id="device-finder" className="bg-[#F5F2EA]" aria-labelledby="finder-title">
      <div className="v4-shell py-16">
        <h2 id="finder-title" className="text-[34px] font-bold leading-tight lg:text-[42px]">What are you watching on?</h2>
        <p className="mt-4 max-w-3xl text-[#536275]">Pick your device to find compatibility information and the right setup guide. Choosing a radio does not move you to another page.</p>
        <fieldset className="mt-8">
          <legend className="font-semibold">Device type</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FINDER.map((label) => (
              <label key={label} className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-[#D7DFE7] bg-white px-4">
                <input type="radio" name="live-device" value={label} checked={finder === label} onChange={() => setFinder(label)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          className="v4-btn v4-btn-primary mt-6"
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
                <Link href="/compatibility/"><span className="underline">Check Compatibility</span></Link>
                <Link href="/setup/"><span className="underline">Setup guides</span></Link>
                <Link href="/contact/?topic=compatibility"><span className="underline">Contact with model number</span></Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
