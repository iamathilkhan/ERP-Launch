import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface NetworkFormationProps {
  onComplete: () => void;
}

interface Node {
  x: number;
  y: number;
  label: string;
  opacity: number;
  scale: number;
}

const PRIMARY_LABELS = ["Faculty", "Students", "Exams", "Attendance", "Finance"];
const CRIMSON = { r: 121, g: 12, b: 12 };

const NetworkFormation = ({ onComplete }: NetworkFormationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"A" | "B" | "C" | "D" | "done">("A");
  const [labels, setLabels] = useState<{ x: number; y: number; text: string; opacity: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.22;

    // Primary nodes
    const primaryNodes: Node[] = PRIMARY_LABELS.map((label, i) => {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, label, opacity: 0, scale: 0 };
    });

    // Secondary nodes: 8-15 per primary, random angles/radii
    const secondaryNodes: Node[] = [];
    const secParent: number[] = [];
    primaryNodes.forEach((pn, pi) => {
      const count = 8 + Math.floor(Math.random() * 8); // 8-15
      for (let j = 0; j < count; j++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 80; // 60-140px
        secondaryNodes.push({
          x: pn.x + Math.cos(angle) * dist,
          y: pn.y + Math.sin(angle) * dist,
          label: "",
          opacity: 0,
          scale: 0,
        });
        secParent.push(pi);
      }
    });

    // Pre-compute cross-links between nearby secondary nodes
    const crossLinks: [number, number][] = [];
    for (let i = 0; i < secondaryNodes.length; i++) {
      for (let j = i + 1; j < secondaryNodes.length; j++) {
        const dx = secondaryNodes[i].x - secondaryNodes[j].x;
        const dy = secondaryNodes[i].y - secondaryNodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 180) {
          crossLinks.push([i, j]);
        }
      }
    }

    let elapsed = 0;
    let lastTime = performance.now();
    let currentPhase: "A" | "B" | "C" | "D" | "done" = "A";
    let globalScale = 1;
    let goldPulse = 0;
    let rafId = 0;

    const draw = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      elapsed += dt;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(globalScale, globalScale);
      ctx.translate(-cx, -cy);

      // Phase transitions
      if (currentPhase === "A" && elapsed > 5) { currentPhase = "B"; setPhase("B"); }
      else if (currentPhase === "B" && elapsed > 12) { currentPhase = "C"; setPhase("C"); }
      else if (currentPhase === "C" && elapsed > 16) { currentPhase = "D"; setPhase("D"); }
      else if (currentPhase === "D" && elapsed > 18) { currentPhase = "done"; setPhase("done"); }

      // Central core - CRIMSON
      const pulseScale = 1 + Math.sin(elapsed * Math.PI) * 0.04;
      const coreR = 12 * pulseScale;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
      grad.addColorStop(0, `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},0.8)`);
      grad.addColorStop(0.4, "rgba(214,184,90,0.3)");
      grad.addColorStop(1, "rgba(214,184,90,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},0.9)`;
      ctx.fill();

      // Primary lines & nodes
      if (currentPhase !== "done") {
        primaryNodes.forEach((node, i) => {
          const lineStart = i * 0.3;
          const lineProgress = Math.max(0, Math.min(1, (elapsed - lineStart) / 0.8));

          if (lineProgress > 0) {
            const endX = cx + (node.x - cx) * lineProgress;
            const endY = cy + (node.y - cy) * lineProgress;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(255,255,255,${0.4 + goldPulse * 0.4})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (lineProgress >= 1) {
              node.opacity = Math.min(1, node.opacity + dt * 2);
              node.scale = Math.min(1, node.scale + dt * 3);
            }
          }
        });

        // Draw primary nodes
        primaryNodes.forEach((node) => {
          if (node.opacity <= 0) return;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5 * node.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${node.opacity * 0.8})`;
          ctx.fill();
          if (goldPulse > 0) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(214,184,90,${goldPulse * 0.5})`;
            ctx.fill();
          }
        });

        setLabels(primaryNodes.filter(n => n.opacity > 0.5).map(n => ({
          x: n.x, y: n.y + 20, text: n.label, opacity: Math.min(1, (n.opacity - 0.5) * 2),
        })));
      }

      // Phase B+: secondary nodes + cross-links
      if (currentPhase === "B" || currentPhase === "C" || currentPhase === "D") {
        const bElapsed = elapsed - 5;

        secondaryNodes.forEach((sn, i) => {
          const delay = i * 0.06;
          const progress = Math.max(0, Math.min(1, (bElapsed - delay) / 0.6));
          sn.opacity = progress * (0.5 + Math.random() * 0.2);
          sn.scale = progress;

          if (progress > 0) {
            const r = 3 + Math.random() * 2;
            ctx.beginPath();
            ctx.arc(sn.x, sn.y, r * sn.scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${sn.opacity * 0.7})`;
            ctx.fill();

            // Line to parent
            const parent = primaryNodes[secParent[i]];
            const ex = parent.x + (sn.x - parent.x) * progress;
            const ey = parent.y + (sn.y - parent.y) * progress;
            ctx.beginPath();
            ctx.moveTo(parent.x, parent.y);
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = `rgba(255,255,255,${0.3 * progress})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        // Cross-links between nearby secondary nodes
        if (bElapsed > 1.5) {
          const crossProgress = Math.min(1, (bElapsed - 1.5) / 2);
          crossLinks.forEach(([i, j]) => {
            const a = secondaryNodes[i];
            const b = secondaryNodes[j];
            if (a.opacity > 0.1 && b.opacity > 0.1) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              const mx = a.x + (b.x - a.x) * crossProgress;
              const my = a.y + (b.y - a.y) * crossProgress;
              ctx.lineTo(mx, my);
              ctx.strokeStyle = `rgba(255,255,255,${(0.3 + Math.random() * 0.2) * crossProgress})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          });
        }

        // Adjacent primary cross-links
        if (bElapsed > 1.5) {
          const cp = Math.min(1, (bElapsed - 1.5) / 1.5);
          for (let i = 0; i < primaryNodes.length; i++) {
            const j = (i + 1) % primaryNodes.length;
            const a = primaryNodes[i], b = primaryNodes[j];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(a.x + (b.x - a.x) * cp, a.y + (b.y - a.y) * cp);
            ctx.strokeStyle = `rgba(255,255,255,${0.25 * cp})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Phase C: zoom out
      if (currentPhase === "C") {
        const cElapsed = elapsed - 12;
        globalScale = 1 - (cElapsed / 4) * 0.15;
        if (cElapsed > 2) {
          goldPulse = Math.max(0, Math.sin((cElapsed - 2) * Math.PI) * 0.4);
        }
      }

      // Phase D: gold pulse
      if (currentPhase === "D") {
        const dElapsed = elapsed - 16;
        goldPulse = Math.max(0, Math.sin(dElapsed * Math.PI * 2) * 0.8);
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},${0.3 + dElapsed * 0.3})`;
        ctx.fill();
      }

      ctx.restore();

      if (currentPhase !== "done") {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (phase === "done") {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === "done" ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {labels.map((l, i) => (
        <span
          key={i}
          className="absolute font-space text-xs tracking-[0.1em] pointer-events-none"
          style={{
            left: l.x, top: l.y, transform: "translateX(-50%)",
            color: `rgba(255,255,255,${l.opacity * 0.5})`,
          }}
        >
          {l.text}
        </span>
      ))}
    </motion.div>
  );
};

export default NetworkFormation;
