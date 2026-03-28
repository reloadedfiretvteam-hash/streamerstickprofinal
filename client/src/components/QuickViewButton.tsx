import { Eye } from "lucide-react";

export function QuickViewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 z-30 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
      aria-label="Quick view"
      data-testid="button-quick-view"
    >
      <Eye className="w-5 h-5" />
    </button>
  );
}
