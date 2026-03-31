export function playCtaClick(): void {
  if (typeof window === "undefined") return;

  const AudioContextCtor =
    window.AudioContext ||
    // @ts-expect-error webkit fallback for older browsers
    window.webkitAudioContext;

  if (!AudioContextCtor) return;

  try {
    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.08);

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.03, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);

    void context.close().catch(() => {});
  } catch {
    // Non-fatal enhancement only.
  }
}
