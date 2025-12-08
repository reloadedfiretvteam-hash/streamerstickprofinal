import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({ 
  end, 
  duration = 2, 
  suffix = "", 
  prefix = "",
  className = "",
  decimals = 0
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const updateCount = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (duration * 1000), 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = decimals > 0 
          ? parseFloat((easeOutQuart * end).toFixed(decimals))
          : Math.floor(easeOutQuart * end);
        
        setCount(currentCount);

        if (now < endTime) {
          requestAnimationFrame(updateCount);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(updateCount);
    }
  }, [isInView, end, duration, decimals]);

  const displayValue = decimals > 0 
    ? count.toFixed(decimals) 
    : count.toLocaleString();

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
}

interface StatCardProps {
  value: number;
  suffix?: string;
  label: string;
  icon?: React.ReactNode;
}

export function AnimatedStatCard({ value, suffix = "+", label, icon }: StatCardProps) {
  return (
    <div className="text-center p-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        {icon}
        <AnimatedCounter 
          end={value} 
          suffix={suffix}
          className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500"
        />
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
