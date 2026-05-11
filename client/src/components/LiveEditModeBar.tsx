import { useSearch, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ExternalLink, Pencil, X } from "lucide-react";

/**
 * Shown when the storefront is opened with ?edit=true (Admin → Visual Editor → Open Live Editor).
 * Wires the query param to real controls: admin panel + section anchors.
 */
export function LiveEditModeBar() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);
  const isEdit = params.get("edit") === "true";
  if (!isEdit) return null;

  const exitEditMode = () => {
    params.delete("edit");
    const q = params.toString();
    setLocation(q ? `/?${q}` : "/");
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] border-t border-amber-500/40 bg-gray-950/98 backdrop-blur-md px-3 py-2.5 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
      role="region"
      aria-label="Live edit mode"
    >
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 sm:justify-between">
        <div className="flex items-center gap-2 text-amber-100 text-sm font-medium">
          <Pencil className="w-4 h-4 text-amber-400 shrink-0" aria-hidden />
          <span>Live edit preview — use Admin Visual Editor to change copy &amp; images</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-600/60 text-amber-100 hover:bg-amber-950/80"
            onClick={() => window.open("/admin", "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="w-4 h-4 mr-1.5" />
            Admin
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
            onClick={() => {
              window.open("/admin#change-pricing", "_blank", "noopener,noreferrer");
            }}
          >
            Price guide
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-amber-600/50 text-amber-100 hover:bg-amber-950/80"
            onClick={() => {
              window.open("/admin#visual-editor", "_blank", "noopener,noreferrer");
            }}
          >
            Visual Editor
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={exitEditMode}
            aria-label="Exit live edit preview"
          >
            <X className="w-4 h-4 mr-1" />
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
