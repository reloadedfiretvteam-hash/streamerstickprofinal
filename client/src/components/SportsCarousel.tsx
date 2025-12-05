import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Card, CardContent } from "@/components/ui/card"
import ufcImg from "@assets/stock_images/ufc_mma_fighter_in_o_3625dd6b.jpg";
import nflImg from "@assets/stock_images/american_football_pl_1dce3698.jpg";
import nbaImg from "@assets/stock_images/basketball_player_du_c74298fe.jpg";
import mlbImg from "@assets/stock_images/baseball_batter_hitt_88195588.jpg";

const sports = [
  { name: "UFC & MMA", image: ufcImg, desc: "Every PPV Event Live" },
  { name: "NFL Sunday Ticket", image: nflImg, desc: "Every Game, Every Sunday" },
  { name: "NBA League Pass", image: nbaImg, desc: "Follow Your Team" },
  { name: "MLB Extra Innings", image: mlbImg, desc: "Home Run Action" },
]

export function SportsCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 3000 })])

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Live Sports Included</h2>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {sports.map((sport, index) => (
            <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33%] min-w-0 px-4">
              <div className="relative h-64 rounded-xl overflow-hidden group cursor-pointer border border-white/10 hover:border-primary/50 transition-colors">
                <img 
                  src={sport.image} 
                  alt={sport.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{sport.name}</h3>
                  <p className="text-sm text-gray-300">{sport.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
