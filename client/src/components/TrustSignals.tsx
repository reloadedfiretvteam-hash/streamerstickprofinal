/**
 * Trust signals block for pillar and location pages (Deliverable 19).
 * Use real metrics only; pass placeholders for channel count if needed.
 */
interface TrustSignalsProps {
  channelCount?: string;
  showTrial?: boolean;
  showSupport?: boolean;
  className?: string;
}

const DEFAULT_CHANNEL = "18,000+";

export function TrustSignals({
  channelCount = DEFAULT_CHANNEL,
  showTrial = true,
  showSupport = true,
  className = "",
}: TrustSignalsProps) {
  const parts: string[] = [`${channelCount} channels`];
  if (showTrial) parts.push("Free trial");
  if (showSupport) parts.push("24/7 support");
  return (
    <p className={`text-sm text-gray-400 ${className}`}>
      {parts.join(" • ")}
    </p>
  );
}
