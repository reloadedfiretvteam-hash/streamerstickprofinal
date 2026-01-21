import { useEffect, useState } from "react";
import { Users, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface SocialProofCounterProps {
  customerCount?: number;
  rating?: number;
  variant?: "compact" | "full";
  className?: string;
}

export function SocialProofCounter({ 
  customerCount = 50000, 
  rating = 4.9,
  variant = "full",
  className = "" 
}: SocialProofCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("social-proof-counter");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = customerCount / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const newCount = Math.min(
        Math.floor(increment * currentStep),
        customerCount
      );
      setCount(newCount);

      if (currentStep >= steps) {
        clearInterval(timer);
        setCount(customerCount);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, customerCount]);

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-3 ${className}`} id="social-proof-counter">
        <div className="flex items-center gap-1 text-sm">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-gray-200 font-semibold">{count.toLocaleString()}+</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-gray-200 font-semibold">{rating}/5</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      id="social-proof-counter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.6 }}
      className={`bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-white/20 rounded-2xl p-6 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        {/* Customer Count */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isVisible ? 1 : 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-3"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>
          <div className="text-4xl font-bold text-white mb-1">
            {count.toLocaleString()}+
          </div>
          <div className="text-gray-300 text-sm">Happy Customers</div>
        </div>

        {/* Rating */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isVisible ? 1 : 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-3"
          >
            <Star className="w-8 h-8 text-white fill-white" />
          </motion.div>
          <div className="text-4xl font-bold text-white mb-1">
            {rating}/5
          </div>
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-400"
                }`}
              />
            ))}
          </div>
          <div className="text-gray-300 text-sm">Customer Rating</div>
        </div>

        {/* Growth Indicator */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isVisible ? 1 : 0 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-3"
          >
            <TrendingUp className="w-8 h-8 text-white" />
          </motion.div>
          <div className="text-4xl font-bold text-white mb-1">
            99%
          </div>
          <div className="text-gray-300 text-sm">Satisfaction Rate</div>
        </div>
      </div>
    </motion.div>
  );
}
