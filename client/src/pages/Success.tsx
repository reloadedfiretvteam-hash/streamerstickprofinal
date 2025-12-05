import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight, Download, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Success() {
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-primary/50 bg-card shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Order Confirmed!</CardTitle>
          <CardDescription className="text-lg">
            Thank you for your purchase. Your device is being prepared.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Video Section */}
          <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 relative group">
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50">
               <Youtube className="w-16 h-16 text-red-600 mb-2" />
               <p className="text-white font-medium">Setup Guide Video</p>
               <p className="text-sm text-gray-400 px-8 text-center mt-2">
                 (Please provide the YouTube URL to display the video here)
               </p>
            </div>
            {/* 
              Once you provide the YouTube URL, we will embed it here like this:
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
                title="Setup Guide" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            */}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" /> What Happens Next?
              </h4>
              <p>Your payment has been securely processed. You will receive an email with your tracking number and credentials shortly.</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-white/10 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" /> Quick Actions:
              </h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Check your Spam folder</li>
                <li>Download the Downloader App</li>
                <li>Have your credentials ready</li>
              </ul>
            </div>
          </div>

          <Button onClick={() => setLocation("/")} className="w-full bg-primary hover:bg-primary/90 h-12 text-lg">
            Return to Store
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
