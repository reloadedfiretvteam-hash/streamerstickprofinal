import { PACKAGE_INCLUDES, PLAN_INCLUDES } from "@/lib/offer-copy";

export function PlanIncludes({ tone = "light" }: { tone?: "light" | "dark" }) {
  const muted = tone === "dark" ? "text-[#C9D4DF]" : "text-[#536275]";
  const groups = [
    ["What you watch", PLAN_INCLUDES.watch],
    ["What arrives after checkout", PLAN_INCLUDES.afterOrder],
    ["What a plan is not", PLAN_INCLUDES.limits],
  ] as const;
  return (
    <div className="stg-include-grid">
      {groups.map(([title, items]) => (
        <div key={title}>
          <p className="text-sm font-semibold tracking-[0.08em] uppercase">{title}</p>
          <ul className={`mt-3 space-y-2 ${muted}`}>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function PackageIncludes() {
  const groups = [
    ["Hardware", PACKAGE_INCLUDES.hardware],
    ["In the order email", PACKAGE_INCLUDES.afterOrder],
    ["Limits", PACKAGE_INCLUDES.limits],
  ] as const;
  return (
    <div className="stg-include-grid">
      {groups.map(([title, items]) => (
        <div key={title}>
          <p className="text-sm font-semibold tracking-[0.08em] uppercase text-[#536275]">{title}</p>
          <ul className="mt-3 space-y-2 text-[#536275]">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
