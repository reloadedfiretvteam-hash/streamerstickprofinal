import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, CheckCircle } from "lucide-react";

const names = [
  "John", "Mike", "Sarah", "Emily", "David", "Jessica", "Chris", "Amanda", 
  "James", "Ashley", "Robert", "Jennifer", "Michael", "Lisa", "William"
];

const states = [
  "Texas", "California", "Florida", "New York", "Ohio", "Georgia", 
  "North Carolina", "Michigan", "Arizona", "Pennsylvania", "Illinois"
];

const products = [
  "Fire Stick 4K Max Bundle",
  "Fire Stick HD with 1 Year IPTV",
  "3 Month IPTV Subscription",
  "Fire Stick 4K with 1 Year IPTV",
  "6 Month IPTV - 2 Devices",
  "1 Year IPTV Subscription"
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomMinutesAgo(): number {
  return Math.floor(Math.random() * 15) + 1;
}

export function SocialProofPopup() {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState({
    name: "",
    state: "",
    product: "",
    minutesAgo: 0
  });

  useEffect(() => {
    const showNotification = () => {
      setNotification({
        name: getRandomItem(names),
        state: getRandomItem(states),
        product: getRandomItem(products),
        minutesAgo: getRandomMinutesAgo()
      });
      setVisible(true);
      
      setTimeout(() => setVisible(false), 4000);
    };

    const initialDelay = setTimeout(() => {
      showNotification();
    }, 8000);

    const interval = setInterval(() => {
      showNotification();
    }, 25000 + Math.random() * 15000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-24 left-4 z-50 max-w-sm"
          data-testid="social-proof-popup"
        >
          <div className="bg-gray-900/95 backdrop-blur-lg border border-green-500/30 rounded-xl p-4 shadow-2xl shadow-green-500/10">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">
                  {notification.name} from {notification.state}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  just purchased <span className="text-orange-400 font-medium">{notification.product}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" />
                  {notification.minutesAgo} minute{notification.minutesAgo > 1 ? 's' : ''} ago
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
