import { Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function UrgencyTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const difference = endOfDay.getTime() - now.getTime();

      setTimeLeft({
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-600 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 animate-pulse" />
            <span className="font-bold text-lg">LIMITED TIME OFFER</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <div className="flex gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px] text-center">
                <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-xs uppercase">Hours</div>
              </div>
              <div className="text-2xl font-bold self-center">:</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px] text-center">
                <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-xs uppercase">Mins</div>
              </div>
              <div className="text-2xl font-bold self-center">:</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px] text-center">
                <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-xs uppercase">Secs</div>
              </div>
            </div>
          </div>

          <div className="text-center md:text-left">
            <div className="font-semibold">Save up to 50% Today!</div>
            <div className="text-sm opacity-90">Offer ends at midnight</div>
          </div>
        </div>
      </div>
    </div>
  );
}
