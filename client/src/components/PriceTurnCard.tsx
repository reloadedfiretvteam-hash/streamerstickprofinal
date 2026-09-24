import { useState } from "react";
import { Link } from "wouter";

type PriceTurnCardProps = {
  name: string;
  price: number;
  image: string;
  label: string;
  details: string[];
  tone?: "dark" | "light";
  onAdd?: () => void;
  href?: string;
};

function pointerCanHover() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function PriceTurnCard({
  name,
  price,
  image,
  label,
  details,
  tone = "dark",
  onAdd,
  href,
}: PriceTurnCardProps) {
  const [turned, setTurned] = useState(false);
  const dark = tone === "dark";
  const priceLabel = `$${price}`;

  return (
    <div
      className="min-w-0 [perspective:1400px]"
      onMouseEnter={() => {
        if (pointerCanHover()) setTurned(true);
      }}
      onMouseLeave={() => {
        if (pointerCanHover()) setTurned(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setTurned(false);
      }}
    >
      <div
        role="group"
        aria-label={`${name}, ${priceLabel}. Turn the card for what is included.`}
        tabIndex={0}
        onFocus={() => setTurned(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            if ((event.target as HTMLElement).closest("[data-card-action]")) return;
            event.preventDefault();
            setTurned((value) => !value);
          }
        }}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("[data-card-action]")) return;
          if (!pointerCanHover()) setTurned((value) => !value);
        }}
        className={`grid cursor-pointer rounded-2xl outline-none transition-transform duration-500 ease-out [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none ${
          turned ? "[transform:rotateY(180deg)]" : ""
        } ${dark ? "border border-white/10 bg-[#10192a] shadow-[0_20px_50px_rgba(0,0,0,0.35)]" : "border border-slate-200 bg-white shadow-sm"}`}
      >
        <article className="col-start-1 row-start-1 overflow-hidden rounded-2xl [backface-visibility:hidden]">
          <div className={`flex aspect-[3/4] items-center justify-center p-2 sm:aspect-[4/5] ${dark ? "bg-[#071018]" : "bg-[#0b1220]"}`}>
            <img src={image} alt="" className="h-full w-full object-contain" />
          </div>
          <div className={`border-t px-3 py-3 ${dark ? "border-white/10" : "border-slate-200 px-5 py-4"}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-teal-200" : "text-blue-700"}`}>{label}</p>
            <h3 className={`mt-1 font-semibold ${dark ? "text-base text-white sm:text-lg" : "text-2xl text-slate-900"}`}>{name}</h3>
            <p className={`font-semibold ${dark ? "text-xl text-white" : "text-3xl text-slate-900"}`}>{priceLabel}</p>
            <p className={`mt-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>Rest on the card to turn it</p>
          </div>
        </article>

        <article
          className={`col-start-1 row-start-1 flex h-full flex-col justify-between rounded-2xl p-5 [transform:rotateY(180deg)] [backface-visibility:hidden] ${
            dark ? "bg-[#10192a] text-white" : "bg-white text-slate-900"
          }`}
        >
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${dark ? "text-teal-200" : "text-blue-700"}`}>{label}</p>
            <h3 className="mt-2 text-xl font-semibold">{name}</h3>
            <p className="mt-3 text-5xl font-semibold tracking-tight">{priceLabel}</p>
            <ul className={`mt-4 space-y-1 text-sm ${dark ? "text-slate-200" : "text-slate-600"}`}>
              {details.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="mt-5 grid gap-2">
            {onAdd ? (
              <button
                type="button"
                data-card-action
                className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-600"
                onClick={onAdd}
              >
                Add to cart
              </button>
            ) : null}
            {href ? (
              <Link href={href}>
                <span data-card-action className="block w-full rounded-xl bg-blue-700 px-4 py-3 text-center font-semibold text-white hover:bg-blue-600">
                  Shop this package
                </span>
              </Link>
            ) : null}
          </div>
        </article>
      </div>
    </div>
  );
}
