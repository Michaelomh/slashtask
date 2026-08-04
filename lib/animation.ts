export function fireConfetti() {
  import('canvas-confetti').then((mod) => {
    const confetti = mod.default as (opts: Record<string, unknown>) => void;
    const shared = {
      particleCount: 80,
      spread: 55,
      startVelocity: 55,
      decay: 0.92,
      ticks: 200,
      origin: { y: 0.6 },
      disableForReducedMotion: true,
    };
    confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.6 } });
    confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.6 } });
  });
}
