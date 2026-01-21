import { useState, useEffect } from "react"
import { X, Zap, Gift, CheckCircle, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useLocation } from "wouter"

export function ExitPopup() {
  const [open, setOpen] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const [, setLocation] = useLocation()

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

  const scrollToFreeTrial = () => {
    setOpen(false)
    const trialSection = document.querySelector('[data-section="free-trial"]')
    if (trialSection) {
      trialSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      setLocation("/?section=free-trial")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-3xl font-bold flex items-center gap-2 text-white">
              <Gift className="w-8 h-8 text-orange-400 animate-pulse" />
              Wait! Free Trial Inside! 🎁
            </DialogTitle>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <DialogDescription className="text-lg pt-2 text-gray-200">
            Get <span className="text-orange-400 font-bold text-2xl">FREE 36-Hour Trial</span> - No Credit Card Required!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Benefits */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>18,000+ Live TV Channels</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>100,000+ Movies & Series</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Instant Access - No Credit Card</span>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-200">
              🔒 100% Secure • ⚡ Instant Activation • 💰 Money-Back Guarantee
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800" 
            onClick={() => setOpen(false)}
          >
            Maybe Later
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg py-6 shadow-lg shadow-orange-500/50" 
            onClick={scrollToFreeTrial}
          >
            <Gift className="w-5 h-5 mr-2" />
            Claim Free Trial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
