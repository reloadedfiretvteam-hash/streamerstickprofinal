import { Users, TrendingUp, MapPin } from "lucide-react";

export function TrustStats({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-6 ${className}`}>
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-400" />
        <span className="text-sm">
          <span className="font-bold text-white">2,700+</span>
          <span className="text-gray-300 ml-1">Happy Customers</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-400" />
        <span className="text-sm">
          <span className="font-bold text-white">98%</span>
          <span className="text-gray-300 ml-1">Satisfaction Rate</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-orange-400" />
        <span className="text-sm">
          <span className="font-bold text-white">USA</span>
          <span className="text-gray-300 ml-1">Based Support</span>
        </span>
      </div>
    </div>
  );
}
