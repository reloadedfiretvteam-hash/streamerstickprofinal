import { Star, Quote, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  id: string;
  name: string;
  location: string;
  date: string;
  rating: number;
  product: string;
  review: string;
  verified: boolean;
}

const reviews: Review[] = [
  {
    id: "1",
    name: "Marcus T.",
    location: "Houston, TX",
    date: "Nov 2024",
    rating: 5,
    product: "Fire Stick 4K",
    review: "This thing is amazing! Set it up in about 10 minutes and the picture quality is incredible. Only thing was shipping took 3 days instead of 2, but honestly worth the wait. My cable bill was $180/month - now I pay nothing. Best purchase I've made.",
    verified: true
  },
  {
    id: "2",
    name: "Jennifer L.",
    location: "Atlanta, GA",
    date: "Oct 2024",
    rating: 5,
    product: "1 Year IPTV",
    review: "Customer service is top notch. Had a small issue with my login not working at first and they fixed it within a few hours. The channel selection is insane - I can watch anything. My husband is happy he can finally watch all the UFC fights without paying $80 each time.",
    verified: true
  },
  {
    id: "3",
    name: "David R.",
    location: "Phoenix, AZ",
    date: "Nov 2024",
    rating: 5,
    product: "Fire Stick 4K Max",
    review: "Bought this for my parents who are not tech savvy at all. They figured it out in 5 minutes! The interface is super simple. Only minor complaint is I wish the remote had a mute button, but that's an Amazon thing not StreamStickPro. Highly recommend.",
    verified: true
  },
  {
    id: "4",
    name: "Michelle K.",
    location: "Chicago, IL",
    date: "Sep 2024",
    rating: 5,
    product: "3 Month IPTV",
    review: "Started with 3 months to test it out and just renewed for a full year. Picture quality is great, rarely any buffering. I emailed support once on a Sunday and didn't hear back until Monday morning, but they were helpful when they responded. Overall very satisfied.",
    verified: true
  },
  {
    id: "5",
    name: "Robert J.",
    location: "Miami, FL",
    date: "Oct 2024",
    rating: 5,
    product: "Fire Stick 4K",
    review: "Finally cut the cord! Been thinking about it for years. The Fire Stick came exactly as described and works perfectly. Setup video they emailed was really helpful. My only note is make sure you have good wifi - I had to move my router closer to the TV but now it's flawless.",
    verified: true
  },
  {
    id: "6",
    name: "Sarah M.",
    location: "Denver, CO",
    date: "Nov 2024",
    rating: 5,
    product: "6 Month IPTV",
    review: "Love being able to watch my shows whenever I want. The on-demand library is huge. Took me a day to get my credentials after ordering but once I got them everything worked perfectly. Support walked me through connecting to my smart TV. Would definitely recommend to friends.",
    verified: true
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

export function CustomerReviews({ className = "" }: { className?: string }) {
  return (
    <section className={`py-16 bg-gradient-to-b from-gray-800/50 to-gray-900 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2 mb-4">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-yellow-300">CUSTOMER REVIEWS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">What Our </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Customers Say</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real reviews from verified customers. We're proud of our 4.9/5 average rating.
          </p>
          
          {/* Overall rating summary */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-2xl font-bold text-white">4.9</span>
            <span className="text-gray-400">out of 5</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">2,700+ reviews</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors"
              data-testid={`review-card-${review.id}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{review.name}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{review.location}</div>
                  </div>
                </div>
                <Quote className="w-6 h-6 text-orange-500/30" />
              </div>

              {/* Rating & Product */}
              <div className="flex items-center gap-3 mb-3">
                <StarRating rating={review.rating} />
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-blue-400">{review.product}</span>
              </div>

              {/* Review text */}
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                "{review.review}"
              </p>

              {/* Date */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
