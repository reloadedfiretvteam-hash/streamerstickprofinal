type Props = {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
  invert?: boolean;
};

/** StreamStickPro mark: a blue-to-teal S with a live point in the middle. */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M46 15C46 4 14 6 16 26C18 40 34 36 36 31" stroke="#3B82F6" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 49C18 60 50 58 48 38C46 24 30 28 28 33" stroke="#2DD4BF" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="2.8" fill="#FFFFFF" />
    </svg>
  );
}

export function BrandLogo({ className = "", markClassName = "h-8 w-8", wordmark = true, invert = false }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandMark className={markClassName} />
      {wordmark ? (
        <span className={`font-semibold tracking-tight ${invert ? "text-white" : "text-inherit"}`}>
          StreamStick<span className="text-teal-400">Pro</span>
        </span>
      ) : null}
    </span>
  );
}
