
import { Play } from "lucide-react";

export function DemoVideo() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
        <p className="text-muted-foreground">Watch how easy it is to set up and start streaming in minutes.</p>
      </div>
      
      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black group cursor-pointer">
        {/* Placeholder for the actual video file from Supabase */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-primary/20 to-purple-900/20">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white font-medium">StreamerStick Pro - Setup Guide & Demo</p>
          <p className="text-xs text-gray-400">Duration: 2:45</p>
        </div>
      </div>
    </div>
  );
}
