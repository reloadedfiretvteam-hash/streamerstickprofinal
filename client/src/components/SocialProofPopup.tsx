import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

const names = [
  "Marcus T.", "Jennifer L.", "David R.", "Michelle K.", "Robert J.", "Sarah M.",
  "Brandon W.", "Nicole P.", "Kevin H.", "Amanda S.", "Jason C.", "Stephanie B.",
  "Tyler G.", "Melissa R.", "Ryan D.", "Laura K.", "Justin M.", "Heather N.",
  "Derek F.", "Christina V.", "Brian A.", "Rebecca H.", "Andrew T.", "Danielle C.",
  "Scott P.", "Kimberly W.", "Eric L.", "Angela M.", "Patrick O.", "Natalie S.",
  "Sean R.", "Vanessa G.", "Kyle B.", "Courtney D.", "Trevor J.", "Shannon K.",
  "Chad M.", "Brittany L.", "Dustin H.", "Amber P.", "Corey S.", "Monica R.",
  "Craig W.", "Tiffany N.", "Jesse M.", "Crystal L.", "Adam B.", "Whitney S.",
  "Nathan R.", "Lindsey K.", "Blake T.", "Megan H.", "Travis P.", "Holly G.",
  "Keith D.", "Rachel V.", "Derrick J.", "Samantha C.", "Brett F.", "Erica W.",
  "Jordan A.", "Cassandra M.", "Mitchell L.", "Brenda P.", "Gregory S.", "Jenna R.",
  "Phillip K.", "Valerie T.", "Rodney H.", "Kristen B.", "Raymond D.", "Alicia N.",
  "Eduardo M.", "Veronica L.", "Ricardo S.", "Diana G.", "Carlos P.", "Isabella R.",
  "Antonio J.", "Carmen V.", "Miguel H.", "Elena D.", "Francisco T.", "Sofia K.",
  "Dominic A.", "Brianna W.", "Marcus L.", "Jasmine S.", "Vincent R.", "Aaliyah P.",
  "Terrence G.", "Maya J.", "Darnell K.", "Destiny M.", "Maurice B.", "Kiara T."
];

const cities = [
  "Houston, TX", "Atlanta, GA", "Phoenix, AZ", "Chicago, IL", "Miami, FL",
  "Denver, CO", "Seattle, WA", "Dallas, TX", "Los Angeles, CA", "New York, NY",
  "San Diego, CA", "Austin, TX", "Charlotte, NC", "Tampa, FL", "Orlando, FL",
  "Nashville, TN", "Indianapolis, IN", "Columbus, OH", "San Antonio, TX", "Portland, OR",
  "Las Vegas, NV", "Detroit, MI", "Memphis, TN", "Boston, MA", "Baltimore, MD",
  "Philadelphia, PA", "San Jose, CA", "Jacksonville, FL", "Fort Worth, TX", "Oklahoma City, OK",
  "Louisville, KY", "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ", "Fresno, CA",
  "Sacramento, CA", "Kansas City, MO", "Mesa, AZ", "Virginia Beach, VA", "Omaha, NE",
  "Colorado Springs, CO", "Raleigh, NC", "Minneapolis, MN", "Cleveland, OH", "Pittsburgh, PA"
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
      if (showCountRef.current > 2) return;
      
      setNotification({
        name: getNextName(),
        city: cities[Math.floor(Math.random() * cities.length)],
        product: products[Math.floor(Math.random() * products.length)],
        minutesAgo: Math.floor(Math.random() * 30) + 5
      });
      setVisible(true);
      
      setTimeout(() => setVisible(false), 2000);
    };

    const initialDelay = setTimeout(() => {
      showNotification();
    }, 25000);

    const interval = setInterval(() => {
      showNotification();
    }, 90000);

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 left-4 z-40 max-w-[220px]"
          data-testid="social-proof-popup"
        >
          <div className="bg-gray-800/80 backdrop-blur-sm border border-white/5 rounded-lg px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
              <span className="text-gray-300">
                {notification.name} purchased {notification.product}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
