import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface MatrixSequenceProps {
  onComplete: () => void;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789アイウエオカキクケコサシスセソ";

interface Column {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  alpha: number;
}

const MatrixSequence = ({ onComplete }: MatrixSequenceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [overlayPhase, setOverlayPhase] = useState<"sync" | "map" | "fadeout" | "none">("none");
  const startRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const colCount = Math.ceil(canvas.width / fontSize);
    const trailLen = 15;

    const columns: Column[] = Array.from({ length: colCount }, (_, i) => ({
      x: i * fontSize,
      y: Math.random() * -canvas.height,
      speed: 2 + Math.random() * 2,
      chars: Array.from({ length: trailLen }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
      alpha: 0.4 + Math.random() * 0.6,
    }));

    startRef.current = performance.now();
    let matrixAlpha = 1;

    const draw = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;

      if (elapsed > 1 && elapsed < 4) setOverlayPhase("sync");
      if (elapsed > 2 && elapsed < 4) setOverlayPhase("map");
      if (elapsed > 4 && elapsed < 5) setOverlayPhase("fadeout");
      if (elapsed > 5) setOverlayPhase("none");

      // Gentle fade-out in last 3s — purely alpha, no transform
      if (elapsed > 7) {
        const fadeProgress = Math.min(1, (elapsed - 7) / 3);
        matrixAlpha = Math.max(0, 1 - fadeProgress * 0.8);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      columns.forEach((col) => {
        // Strictly 2D: only vertical movement, no drift, no scale
        col.y += col.speed;
        if (col.y > canvas.height + trailLen * fontSize) {
          col.y = -trailLen * fontSize;
          col.chars = col.chars.map(() => CHARS[Math.floor(Math.random() * CHARS.length)]);
        }

        if (Math.random() < 0.03) {
          const idx = Math.floor(Math.random() * col.chars.length);
          col.chars[idx] = CHARS[Math.floor(Math.random() * CHARS.length)];
        }

        col.chars.forEach((char, j) => {
          const charY = col.y - j * fontSize;
          if (charY < -fontSize || charY > canvas.height + fontSize) return;

          const trailAlpha = (1 - j / trailLen) * col.alpha * matrixAlpha;

          if (j === 0) {
            // Lead char — brighter teal
            ctx.fillStyle = `rgba(0,220,230,${trailAlpha * 0.65})`;
          } else {
            ctx.fillStyle = `rgba(0,200,212,${trailAlpha * 0.65})`;
          }
          ctx.font = `${fontSize}px monospace`;
          ctx.fillText(char, col.x, charY);
        });
      });

      // Central glow in phase C - crimson tinted
      if (elapsed > 8) {
        const glowProgress = Math.min(1, (elapsed - 8) / 2);
        const glowR = 60 + glowProgress * 140;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        grad.addColorStop(0, `rgba(155,26,26,${glowProgress * 0.4})`);
        grad.addColorStop(0.5, `rgba(0,200,212,${glowProgress * 0.12})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.restore();

      if (elapsed < 10) {
        requestAnimationFrame(draw);
      }
    };

    requestAnimationFrame(draw);
    const t = setTimeout(onComplete, 10000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.p
          className="font-space tracking-[0.2em] text-sm md:text-base"
          style={{ color: "rgba(220,235,240,0.35)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: overlayPhase === "sync" || overlayPhase === "map" ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          Synchronizing Systems…
        </motion.p>
        <motion.p
          className="font-space tracking-[0.2em] text-xs md:text-sm mt-3"
          style={{ color: "rgba(224,154,42,0.3)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: overlayPhase === "map" ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          Mapping Academic Infrastructure…
        </motion.p>
      </div>
    </motion.div>
  );
};

export default MatrixSequence;
