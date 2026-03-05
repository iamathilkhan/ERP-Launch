import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface FinalConvergenceProps {
  onComplete: () => void;
}

const FinalConvergence = ({ onComplete }: FinalConvergenceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const start = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - start) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsed < 0.5) {
        requestAnimationFrame(draw);
        return;
      }

      // Central crimson glow
      const glowProgress = Math.min(1, (elapsed - 0.5) / 1.5);
      const glowR = 20 + glowProgress * 100;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      grad.addColorStop(0, `rgba(155,26,26,${0.5 * glowProgress})`);
      grad.addColorStop(0.5, `rgba(0,200,212,${0.1 * glowProgress})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Ghost network sphere
      if (elapsed > 1 && elapsed < 3) {
        const ghostAlpha = elapsed < 2
          ? Math.min(0.15, (elapsed - 1) * 0.15)
          : Math.max(0, 0.15 - (elapsed - 2) * 0.15);
        const radius = Math.min(cx, cy) * 0.2;

        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const nx = cx + Math.cos(angle) * radius;
          const ny = cy + Math.sin(angle) * radius;

          ctx.beginPath();
          ctx.arc(nx, ny, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(155,26,26,${ghostAlpha})`;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.strokeStyle = `rgba(0,200,212,${ghostAlpha * 0.5})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Blue pulse ring
      if (elapsed > 2) {
        const p1 = (elapsed - 2) / 1.5;
        if (p1 < 1) {
          const r = p1 * Math.max(canvas.width, canvas.height) * 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,200,212,${(1 - p1) * 0.55})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // Muted yellow pulse ring
      if (elapsed > 2.6) {
        const p2 = (elapsed - 2.6) / 1.5;
        if (p2 < 1) {
          const r = p2 * Math.max(canvas.width, canvas.height) * 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(224,154,42,${(1 - p2) * 0.45})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      if (elapsed < 5) {
        requestAnimationFrame(draw);
      }
    };

    requestAnimationFrame(draw);
    const t = setTimeout(onComplete, 4500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </motion.div>
  );
};

export default FinalConvergence;
