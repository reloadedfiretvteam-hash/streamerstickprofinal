import { useState } from "react";
import { apiCall } from "@/lib/api";
import { Gift, Mail, User, Loader2, Check, Clock, Globe, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

const iptvImg = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg";

export function FreeTrial() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [countryOptions, setCountryOptions] = useState({
    usaOnly: false,
    usaCanadaUk: false,
    allCountries: true,
  });
  const [customCountries, setCustomCountries] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleCountryOptionChange = (option: keyof typeof countryOptions, checked: boolean) => {
    setCountryOptions(prev => {
      const newState = { ...prev, [option]: checked };
      return newState;
    });
  };

  const buildCountryPreference = () => {
    const preferences: string[] = [];
    if (countryOptions.usaOnly) preferences.push("USA Only");
    if (countryOptions.usaCanadaUk) preferences.push("USA, Canada, UK");
    if (countryOptions.allCountries) preferences.push("All Countries");
    if (customCountries.trim()) preferences.push(`Custom: ${customCountries.trim()}`);
    return preferences.join("; ") || "All Countries";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      setError("Please fill in your name and email");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiCall("/api/free-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          name,
          message: message.trim() || null,
          countryPreference: buildCountryPreference(),
        })
      });

      if (response.ok) {
        setSuccess(true);
        setEmail("");
        setName("");
        setMessage("");
      } else {
        const data = await response.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-2xl p-8 text-center"
        data-testid="free-trial-success"
      >
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <p className="text-2xl font-bold text-green-400 mb-2">Trial Activated!</p>
        <p className="text-gray-300 mb-4">
          Check your email for your 36-hour trial credentials. Your login details have been sent to <span className="text-green-400 font-semibold">{email || "your email"}</span>.
        </p>
        <p className="text-sm text-gray-300">
          Didn't receive it? Check your spam folder or contact us at reloadedfiretvteam@gmail.com
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-2 border-purple-500/50 rounded-2xl overflow-hidden"
      data-testid="free-trial-box"
      onAnimationStart={() => {}}
    >
      <div className="grid md:grid-cols-5 gap-0">
        <div className="md:col-span-2 relative h-48 md:h-auto">
          <img 
            src={iptvImg} 
            alt="4K Live TV - Free Trial" 
            className="w-full h-full object-cover"
            loading="lazy"
            width={300}
            height={192}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-purple-900/80 md:bg-gradient-to-r md:from-transparent md:to-gray-900"></div>
          <div className="absolute bottom-4 left-4 md:hidden">
            <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              FREE TRIAL
            </span>
          </div>
        </div>
        
        <div className="md:col-span-3 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                FREE 36-Hour Trial
              </p>
              <p className="text-gray-300 text-sm">No credit card required • Instant access</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-300 mb-6">
            <Clock className="w-5 h-5 text-purple-400" />
            <span>Try our premium 4K Live TV service FREE - experience our extensive channel library!</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name and Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Label htmlFor="trial-name" className="sr-only">Your Name</Label>
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <Input
                  id="trial-name"
                  type="text"
                  placeholder="Your Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white h-12"
                  data-testid="input-trial-name"
                />
              </div>
              <div className="relative">
                <Label htmlFor="trial-email" className="sr-only">Your Email</Label>
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <Input
                  id="trial-email"
                  type="email"
                  placeholder="Your Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white h-12"
                  data-testid="input-trial-email"
                />
              </div>
            </div>

            {/* Country Preferences */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                Channel Preferences
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div 
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                    countryOptions.usaOnly 
                      ? "border-purple-500 bg-purple-500/20" 
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  data-testid="checkbox-trial-usa-only"
                >
                  <Checkbox 
                    checked={countryOptions.usaOnly}
                    onCheckedChange={(checked) => {
                      handleCountryOptionChange("usaOnly", !!checked);
                    }}
                    id="trial-usa-only"
                  />
                  <Label htmlFor="trial-usa-only" className="cursor-pointer text-sm">USA Only</Label>
                </div>
                
                <div 
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                    countryOptions.usaCanadaUk 
                      ? "border-purple-500 bg-purple-500/20" 
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  data-testid="checkbox-trial-usa-canada-uk"
                >
                  <Checkbox 
                    checked={countryOptions.usaCanadaUk}
                    onCheckedChange={(checked) => handleCountryOptionChange("usaCanadaUk", !!checked)}
                    id="trial-usa-canada-uk"
                  />
                  <Label htmlFor="trial-usa-canada-uk" className="cursor-pointer text-sm">USA+CA+UK</Label>
                </div>
                
                <div 
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                    countryOptions.allCountries 
                      ? "border-purple-500 bg-purple-500/20" 
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  data-testid="checkbox-trial-all-countries"
                >
                  <Checkbox 
                    checked={countryOptions.allCountries}
                    onCheckedChange={(checked) => handleCountryOptionChange("allCountries", !!checked)}
                    id="trial-all-countries"
                  />
                  <Label htmlFor="trial-all-countries" className="cursor-pointer text-sm">All Countries</Label>
                </div>
              </div>
              <div className="relative">
                <Input
                  id="trial-custom-countries"
                  type="text"
                  placeholder="Other countries/languages (e.g., Spanish, Arabic...)"
                  value={customCountries}
                  onChange={(e) => setCustomCountries(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white h-10 text-sm"
                  data-testid="input-trial-custom-countries"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="trial-message" className="text-sm font-medium text-gray-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Message (Optional)
              </Label>
              <Textarea
                id="trial-message"
                placeholder="Any special requests or questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white min-h-[80px]"
                data-testid="input-trial-message"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold text-lg"
              data-testid="button-start-trial"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Start My Free Trial
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            By requesting a trial, you agree to receive emails about your trial and our services.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
