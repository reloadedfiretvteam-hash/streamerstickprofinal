import { useState } from "react";
import { Search, Package, CheckCircle, Clock, AlertCircle, Mail, Copy } from "lucide-react";
import { setPageMeta } from "@/lib/seo";
import { apiCall } from "@/lib/api";

type OrderStatus = "pending" | "processing" | "completed" | "failed";

interface OrderResult {
  id: string;
  purchaseCode: string;
  status: OrderStatus;
  productName: string;
  amount: number;
  customerEmail: string;
  createdAt: string;
  generatedUsername?: string;
  generatedPassword?: string;
  serviceUrl?: string;
  setupVideoUrl?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-yellow-400", icon: Clock },
  processing: { label: "Processing", color: "text-blue-400", icon: Clock },
  completed: { label: "Completed", color: "text-green-400", icon: CheckCircle },
  failed: { label: "Failed", color: "text-red-400", icon: AlertCircle },
};

export default function TrackOrder() {
  setPageMeta({
    title: "Track Your Order | StreamStickPro",
    description: "Track your StreamStickPro order status and retrieve your service credentials using your purchase code or email address.",
    path: "/track-order",
  });

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await apiCall(`/api/orders/track?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as any)?.error || "Order not found. Please check your purchase code or email.");
        return;
      }
      const data = await res.json();
      setOrder((data as any).data || data);
    } catch {
      setError("Unable to look up order. Please try again or contact support@streamstickpro.com.");
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const StatusIcon = order ? STATUS_CONFIG[order.status]?.icon ?? CheckCircle : CheckCircle;
  const statusColor = order ? STATUS_CONFIG[order.status]?.color ?? "text-green-400" : "text-green-400";
  const statusLabel = order ? STATUS_CONFIG[order.status]?.label ?? order.status : "";

  return (
    <div className="min-h-screen bg-gray-950 text-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/30 mb-4">
            <Package className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-400">Enter your purchase code (PC-XXXXX) or email address to check your order status and retrieve your service credentials.</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="PC-XXXXX or your email address"
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? "Searching…" : "Track"}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700/50 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300">{error}</p>
              <p className="text-gray-400 text-sm mt-1">
                Need help?{" "}
                <a href="mailto:support@streamstickpro.com" className="text-orange-400 hover:underline">
                  support@streamstickpro.com
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Order result */}
        {order && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            {/* Status banner */}
            <div className="px-6 py-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                <span className={`font-semibold ${statusColor}`}>{statusLabel}</span>
              </div>
              <span className="text-gray-400 text-sm">
                {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <div className="p-6 space-y-4">
              {/* Order info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Purchase Code</p>
                  <p className="font-mono text-orange-400 font-semibold">{order.purchaseCode}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Product</p>
                  <p className="text-white text-sm">{order.productName}</p>
                </div>
              </div>

              {/* Credentials (only when completed) */}
              {order.status === "completed" && order.generatedUsername && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-700/40 rounded-lg space-y-3">
                  <p className="text-green-400 font-semibold text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Your Service Credentials
                  </p>
                  <CredRow label="Username" value={order.generatedUsername} onCopy={() => copyText(order.generatedUsername!, "user")} copied={copied === "user"} />
                  {order.generatedPassword && (
                    <CredRow label="Password" value={order.generatedPassword} onCopy={() => copyText(order.generatedPassword!, "pass")} copied={copied === "pass"} />
                  )}
                  {order.serviceUrl && (
                    <CredRow label="Service URL" value={order.serviceUrl} onCopy={() => copyText(order.serviceUrl!, "url")} copied={copied === "url"} />
                  )}
                  {order.setupVideoUrl && (
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Setup Video</p>
                      <a href={order.setupVideoUrl} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-sm">
                        Watch Setup Tutorial →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Pending state message */}
              {order.status === "pending" && (
                <div className="p-4 bg-yellow-900/20 border border-yellow-700/40 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    Your order is being processed. You'll receive your credentials by email shortly. Check your spam folder if you don't see it within 10 minutes.
                  </p>
                </div>
              )}

              {/* Email reminder */}
              <div className="flex items-center gap-2 text-gray-400 text-sm pt-2 border-t border-gray-700">
                <Mail className="w-4 h-4" />
                <span>Credentials also sent to <strong className="text-white">{order.customerEmail}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Help section */}
        {!order && !error && (
          <div className="mt-8 p-6 bg-gray-900 border border-gray-700 rounded-xl">
            <h2 className="font-semibold text-lg mb-4">How to find your purchase code</h2>
            <ol className="space-y-3 text-gray-400 text-sm">
              <li className="flex gap-3"><span className="text-orange-400 font-bold">1.</span> Check your confirmation email after payment. Subject: "Your StreamStickPro Order"</li>
              <li className="flex gap-3"><span className="text-orange-400 font-bold">2.</span> Your purchase code starts with <code className="bg-gray-800 px-1 rounded text-orange-300">PC-</code> followed by letters and numbers.</li>
              <li className="flex gap-3"><span className="text-orange-400 font-bold">3.</span> You can also search by the email address you used during checkout.</li>
            </ol>
            <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-500">
              Still can't find it?{" "}
              <a href="mailto:support@streamstickpro.com" className="text-orange-400 hover:underline">Email support</a>
              {" "}— available 24/7.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CredRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-mono text-white text-sm">{value}</p>
      </div>
      <button onClick={onCopy} className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors flex-shrink-0">
        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-300" />}
      </button>
    </div>
  );
}
