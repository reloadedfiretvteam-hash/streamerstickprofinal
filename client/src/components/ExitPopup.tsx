import { useState, useEffect } from "react"
import { X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function ExitPopup() {
  const [open, setOpen] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setOpen(true)
        setHasShown(true)
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave)
    return () => document.removeEventListener("mouseleave", handleMouseLeave)
  }, [hasShown])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-card border-primary/50 shadow-2xl shadow-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Zap className="text-primary fill-primary animate-pulse" />
            Wait! Don't Miss Out
          </DialogTitle>
          <DialogDescription className="text-lg pt-2">
            Get <span className="text-primary font-bold">10% OFF</span> your first Fire Stick order today!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg text-center border border-dashed border-primary/30">
            <p className="text-sm text-muted-foreground mb-2">Use Code at Checkout:</p>
            <code className="text-2xl font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded">STREAM2025</code>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            No Thanks
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => setOpen(false)}>
            Claim Offer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
