type Props = {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
  invert?: boolean;
};

/** Unique StreamStickPro mark: a beveled screen with a teal signal cut and royal-blue play beam. */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="4" y="8" width="56" height="40" rx="10" fill="#111827" />
      <rect x="8" y="12" width="48" height="32" rx="6" fill="#1d4ed8" />
      <path d="M12 36L28 16H52L36 36H12Z" fill="#14b8a6" />
      <path d="M26 20L42 28L26 36V20Z" fill="#f8fafc" />
      <rect x="24" y="50" width="16" height="4" rx="2" fill="#2563eb" />
      <rect x="18" y="54" width="28" height="3" rx="1.5" fill="#0f172a" />
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
