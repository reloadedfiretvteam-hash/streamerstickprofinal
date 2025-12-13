import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, CheckCircle } from "lucide-react";

const names = [
  "Marcus T.", "Jennifer L.", "David R.", "Michelle K.", "Robert J.", "Sarah M.",
  "Brandon W.", "Nicole P.", "Kevin H.", "Amanda S.", "Jason C.", "Stephanie B.",
  "Tyler G.", "Melissa R.", "Ryan D.", "Laura K.", "Justin M.", "Heather N.",
  "Derek F.", "Christina V.", "Brian A.", "Rebecca H.", "Andrew T.", "Danielle C.",
  "Scott P.", "Kimberly W.", "Eric L.", "Angela M.", "Patrick O.", "Natalie S.",
  "Sean R.", "Vanessa G.", "Kyle B.", "Courtney D.", "Trevor J.", "Shannon K.",
  "Chad M.", "Brittany L.", "Dustin H.", "Amber P.", "Corey S.", "Monica R."
];

const cities = [
  "Houston, TX", "Atlanta, GA", "Phoenix, AZ", "Chicago, IL", "Miami, FL",
  "Denver, CO", "Seattle, WA", "Dallas, TX", "Los Angeles, CA", "New York, NY",
  "San Diego, CA", "Austin, TX", "Charlotte, NC", "Tampa, FL", "Orlando, FL",
  "Nashville, TN", "Indianapolis, IN", "Columbus, OH", "San Antonio, TX", "Portland, OR",
  "Las Vegas, NV", "Detroit, MI", "Memphis, TN", "Boston, MA", "Baltimore, MD"
];

const products = [
  "StreamStick 4K Kit",
  "StreamStick Max Kit", 
  "1 Year Live TV Plan",
  "6 Month Live TV Plan",
  "3 Month Live TV Plan",
  "StreamStick Starter Kit"
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function SocialProofPopup() {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState({
    name: "",
    city: "",
    product: "",
    minutesAgo: 0
  });
  const usedNamesRef = useRef<Set<string>>(new Set());
  const shuffledNamesRef = useRef<string[]>(shuffleArray(names));
  const nameIndexRef = useRef(0);
  const showCountRef = useRef(0);

  useEffect(() => {
    const getNextName = () => {
      if (nameIndexRef.current >= shuffledNamesRef.current.length) {
        shuffledNamesRef.current = shuffleArray(names);
        nameIndexRef.current = 0;
      }
      const name = shuffledNamesRef.current[nameIndexRef.current];
      nameIndexRef.current++;
      return name;
    };

    const showNotification = () => {
      showCountRef.current++;
      if (showCountRef.current > 3) return;
      
      setNotification({
        name: getNextName(),
        city: cities[Math.floor(Math.random() * cities.length)],
        product: products[Math.floor(Math.random() * products.length)],
        minutesAgo: Math.floor(Math.random() * 25) + 5
      });
      setVisible(true);
      
      setTimeout(() => setVisible(false), 2500);
    };

    const initialDelay = setTimeout(() => {
      showNotification();
    }, 15000);

    const interval = setInterval(() => {
      showNotification();
    }, 45000 + Math.random() * 30000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-24 left-4 z-50 max-w-xs"
          data-testid="social-proof-popup"
        >
          <div className="bg-gray-900/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-lg">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white">
                  <span className="font-medium">{notification.name}</span> from {notification.city}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  purchased {notification.product}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {notification.minutesAgo} min ago
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
