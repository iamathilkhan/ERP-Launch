import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ConvergencePulseProps {
  onComplete: () => void;
}

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
    const start = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - start) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Central sphere scales up
      const sphereScale = 1 + Math.min(elapsed / 0.6, 1) * 0.12;
      const sphereR = 15 * sphereScale;
      
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sphereR * 4);
      grad.addColorStop(0, "rgba(121,12,12,0.9)");
      grad.addColorStop(0.3, "rgba(214,184,90,0.4)");
      grad.addColorStop(1, "rgba(121,12,12,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, sphereR * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, sphereR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(121,12,12,0.9)";
      ctx.fill();

      // White pulse at 0.6s
      if (elapsed > 0.6 && elapsed < 1.6) {
        const pulseProgress = (elapsed - 0.6) / 1.0;
        const pulseRadius = pulseProgress * Math.max(canvas.width, canvas.height) * 0.4;
        const pulseOpacity = Math.max(0, 1 - pulseProgress);
        ctx.beginPath();
        ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${pulseOpacity * 0.4})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Gold pulse at 0.9s
      if (elapsed > 0.9 && elapsed < 2.0) {
        const gp = (elapsed - 0.9) / 1.1;
        const gr = gp * Math.max(canvas.width, canvas.height) * 0.35;
        const go = Math.max(0, 1 - gp);
        ctx.beginPath();
        ctx.arc(cx, cy, gr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(214,184,90,${go * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (elapsed < 3) {
        requestAnimationFrame(draw);
      }
    };
    requestAnimationFrame(draw);

    const t = setTimeout(onComplete, 2800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-10"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </motion.div>
  );
};

export default ConvergencePulse;
