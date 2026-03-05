import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ConvergencePulseProps {
  onComplete: () => void;
}

// New palette
const CRIMSON = { r: 155, g: 26, b: 26 };

const ConvergencePulse = ({ onComplete }: ConvergencePulseProps) => {
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
    const sphereRadius = Math.min(canvas.width, canvas.height) * 0.32;

    // Generate scattered particles — teal (front) / amber (back) depth-based
    const particles: { baseX: number; baseY: number; x: number; y: number; r: number; color: string }[] = [];
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = sphereRadius * Math.sqrt(Math.random());
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      // depth from center: front = teal, back = amber
      const depthFactor = dist / sphereRadius;
      const isTeal = depthFactor < 0.6;
      particles.push({
        baseX: x, baseY: y, x, y,
        r: 1 + Math.random() * 3,
        color: isTeal ? "rgba(0,200,212,0.5)" : "rgba(224,154,42,0.5)",
      });
    }

    // Blast lines
    const blastLines: { angle: number; len: number }[] = [];
    for (let i = 0; i < 35; i++) {
      blastLines.push({ angle: Math.random() * Math.PI * 2, len: 20 + Math.random() * 100 });
    }

    const start = performance.now();
    let rafId = 0;

    const draw = (now: number) => {
      const elapsed = (now - start) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Phase A: Shrink (0-0.7s)
      if (elapsed < 0.7) {
        const t = Math.min(1, elapsed / 0.7);
        const ease = t * t * t;

        particles.forEach((p) => {
          p.x = p.baseX + (cx - p.baseX) * ease;
          p.y = p.baseY + (cy - p.baseY) * ease;
          const currentR = p.r * (1 - ease);
          if (currentR > 0.1) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
        });

        // Central crimson dot
        const coreR = 12 * (1 - ease * 0.6);
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},0.9)`;
        ctx.fill();
      }

      // Phase B: Tension hold (0.7s - 0.9s)
      if (elapsed >= 0.7 && elapsed < 0.9) {
        const pulseT = (elapsed - 0.7) / 0.08;
        const pulseScale = 1 + 0.4 * Math.abs(Math.sin(pulseT * Math.PI));
        const dotR = 4 * pulseScale;
        ctx.beginPath();
        ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},1)`;
        ctx.fill();
      }

      // Phase C: Blast (0.9s - 1.4s)
      if (elapsed >= 0.9 && elapsed < 1.4) {
        const blastT = (elapsed - 0.9) / 0.5;

        // Blast particle lines — crimson fading to transparent
        const blastAlpha = Math.max(0, 1 - blastT * 2);
        blastLines.forEach((bl) => {
          const endX = cx + Math.cos(bl.angle) * bl.len * blastT;
          const endY = cy + Math.sin(bl.angle) * bl.len * blastT;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},${blastAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        // First ring — teal
        const ringR = blastT * Math.max(canvas.width, canvas.height) * 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,200,212,${(1 - blastT) * 0.65})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Second ring — amber (delayed)
        if (blastT > 0.3) {
          const ringT = (blastT - 0.3) / 0.7;
          const ringR2 = ringT * Math.max(canvas.width, canvas.height) * 0.25;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(224,154,42,${(1 - ringT) * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      if (elapsed < 2) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    const t = setTimeout(onComplete, 1600);
    return () => { cancelAnimationFrame(rafId); clearTimeout(t); };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-10"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </motion.div>
  );
};

export default ConvergencePulse;
