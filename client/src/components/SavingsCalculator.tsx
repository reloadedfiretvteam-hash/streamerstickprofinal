import { useState } from "react";
import { DollarSign, TrendingDown, Tv, Calculator, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function SavingsCalculator({ className = "" }: { className?: string }) {
  const [cableBill, setCableBill] = useState(150);

  const yearlyPriceFireStick = 150; // Fire Stick 4K with 1 year IPTV
  const yearlyCable = cableBill * 12;
  const yearlySavings = yearlyCable - yearlyPriceFireStick;
  const fiveYearSavings = (yearlyCable * 5) - (yearlyPriceFireStick + (75 * 4)); // Initial + 4 renewals

  return (
    <section className={`py-16 bg-gradient-to-b from-gray-900 to-gray-800 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-4 py-2 mb-4">
            <Calculator className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">SAVINGS CALCULATOR</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">See How Much </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">You'll Save</span>
          </h2>
          <p className="text-gray-400">Compare your current cable bill to StreamStickPro</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            {/* Input */}
            <div className="mb-8">
              <label className="block text-gray-300 text-sm mb-3">
                What's your current monthly cable/streaming bill?
              </label>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={cableBill}
                    onChange={(e) => setCableBill(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                    data-testid="input-cable-bill"
                  />
                </div>
                <div className="text-3xl font-bold text-white min-w-[100px]">
                  ${cableBill}/mo
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2 max-w-xs">
                <span>$50</span>
                <span>$150</span>
                <span>$300</span>
              </div>
            </div>

            {/* Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Cable */}
              <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tv className="w-5 h-5 text-red-400" />
                  <span className="font-semibold text-red-300">Cable TV</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Monthly cost</span>
                    <span className="text-red-400 font-semibold">${cableBill}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Yearly cost</span>
                    <span className="text-red-400 font-semibold">${yearlyCable.toLocaleString()}/yr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">5 Year cost</span>
                    <span className="text-red-400 font-semibold">${(yearlyCable * 5).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* StreamStickPro */}
              <div className="bg-green-950/30 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-green-300">StreamStickPro</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Fire Stick 4K + 1yr IPTV</span>
                    <span className="text-green-400 font-semibold">$150 one-time</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Yearly renewal</span>
                    <span className="text-green-400 font-semibold">$75/yr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">5 Year total</span>
                    <span className="text-green-400 font-semibold">${(yearlyPriceFireStick + (75 * 4)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings result */}
            <motion.div 
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-gray-300 mb-2">Your estimated savings</div>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-green-400">
                    ${yearlySavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">First Year</div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-500 hidden md:block" />
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-green-400">
                    ${fiveYearSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Over 5 Years</div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <div className="text-center mt-8">
              <Button 
                onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-green-500/30"
                data-testid="button-start-saving"
              >
                Start Saving Today
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
