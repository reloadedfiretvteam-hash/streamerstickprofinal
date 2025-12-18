import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Flame } from "lucide-react";

interface CountdownTimerProps {
  endDate?: Date;
  title?: string;
  subtitle?: string;
}

export function CountdownTimer({ 
  endDate,
  title = "Holiday Sale Ends In",
  subtitle = "Don't miss out on these exclusive deals!"
}: CountdownTimerProps) {
  const getEndDate = () => {
    if (endDate) return endDate;
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const daysToAdd = 3 - (end.getDay() % 7);
    end.setDate(end.getDate() + (daysToAdd <= 0 ? 7 + daysToAdd : daysToAdd));
    return end;
  };

  const calculateTimeLeft = () => {
    const difference = getEndDate().getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <motion.div 
        key={value}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-lg shadow-orange-500/30"
      >
        <span className="text-2xl md:text-3xl font-bold font-mono">
          {value.toString().padStart(2, '0')}
        </span>
      </motion.div>
      <span className="text-xs text-gray-300 mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-y border-orange-500/30 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-lg font-bold text-white">{title}</p>
              <p className="text-sm text-gray-300">{subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <TimeBlock value={timeLeft.days} label="Days" />
            <span className="text-2xl text-orange-400 font-bold">:</span>
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <span className="text-2xl text-orange-400 font-bold">:</span>
            <TimeBlock value={timeLeft.minutes} label="Mins" />
            <span className="text-2xl text-orange-400 font-bold">:</span>
            <TimeBlock value={timeLeft.seconds} label="Secs" />
          </div>
        </div>
      </div>
    </div>
  );
}
