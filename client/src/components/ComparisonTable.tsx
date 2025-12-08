import { motion } from "framer-motion";
import { Check, X, Tv, DollarSign, Zap } from "lucide-react";

const comparisonData = [
  { feature: "Monthly Cost", streamstick: "$15/mo", cable: "$150+/mo", netflix: "$23/mo" },
  { feature: "Live TV Channels", streamstick: "18,000+", cable: "200-300", netflix: false },
  { feature: "Movies & Shows", streamstick: "60,000+", cable: "Limited", netflix: "15,000+" },
  { feature: "Live Sports & PPV", streamstick: true, cable: "Extra $$", netflix: false },
  { feature: "No Contracts", streamstick: true, cable: false, netflix: true },
  { feature: "Works Anywhere", streamstick: true, cable: false, netflix: true },
  { feature: "4K Streaming", streamstick: true, cable: "Extra $$", netflix: "Extra $$" },
  { feature: "Cancel Anytime", streamstick: true, cable: "Fees Apply", netflix: true },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="w-5 h-5 text-green-400 mx-auto" />;
  }
  if (value === false) {
    return <X className="w-5 h-5 text-red-400 mx-auto" />;
  }
  return <span className={value.includes("$") && !value.includes("15") ? "text-red-400" : "text-gray-300"}>{value}</span>;
}

export function ComparisonTable() {
  return (
    <div className="py-16 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-2 mb-6">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-300">COMPARE & SAVE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              See Why 2,700+ Customers Made The Switch
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Stop overpaying for cable. Get everything you want for a fraction of the price.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto overflow-x-auto"
        >
          <table className="w-full border-collapse" data-testid="comparison-table">
            <thead>
              <tr>
                <th className="p-4 text-left text-gray-400 font-medium"></th>
                <th className="p-4 text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl p-4 transform -translate-y-2 shadow-xl shadow-orange-500/20">
                    <Zap className="w-6 h-6 text-white mx-auto mb-1" />
                    <span className="text-white font-bold text-lg">Stream Stick Pro</span>
                    <div className="text-orange-200 text-sm mt-1">Best Value</div>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <Tv className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <span className="text-gray-300 font-bold">Cable TV</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <Tv className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <span className="text-gray-300 font-bold">Netflix</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, i) => (
                <motion.tr 
                  key={row.feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="p-4 text-gray-300 font-medium">{row.feature}</td>
                  <td className="p-4 text-center bg-orange-500/5">
                    <CellValue value={row.streamstick} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.cable} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.netflix} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 mb-4">
            <span className="text-green-400 font-bold">Save $1,500+</span> per year by switching to Stream Stick Pro
          </p>
        </motion.div>
      </div>
    </div>
  );
}
