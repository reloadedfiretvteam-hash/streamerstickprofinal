type Props = {
  src: string;
  alt: string;
  fallbackSrc: string;
  /** Short label on the footer tag (covers retail “no fee” copy on the box art). */
  kitLabel: string;
};

/**
 * ONN retail box photos: keep the device visible, soften only the top/bottom marketing strips,
 * and place a small tag over the usual “no fee” footer line.
 */
export function OnnProductCardImage({ src, alt, fallbackSrc, kitLabel }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-[50%_56%] transition-transform duration-700 group-hover:scale-[1.05]"
        loading="lazy"
        width={400}
        height={248}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== fallbackSrc) target.src = fallbackSrc;
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[11] h-[11%] min-h-[1rem] bg-gradient-to-b from-slate-950/85 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[11] h-[15%] min-h-[1.75rem] max-h-[2.75rem] bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-[12] max-w-[94%] -translate-x-1/2">
        <span className="block rounded-md border border-white/20 bg-slate-950/95 px-2.5 py-1 text-center text-[10px] font-bold leading-tight text-white shadow-md backdrop-blur-sm sm:text-[11px]">
          {kitLabel}
        </span>
      </div>
    </div>
  );
}
