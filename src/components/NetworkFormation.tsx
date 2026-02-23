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

const NetworkFormation = ({ onComplete }: NetworkFormationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"A" | "B" | "C" | "D" | "done">("A");
  const [labels, setLabels] = useState<{ x: number; y: number; text: string; opacity: number }[]>([]);
  const phaseTimeRef = useRef(0);
  const startRef = useRef(Date.now());
  const rafRef = useRef(0);
  const nodesRef = useRef<Node[]>([]);
  const secondaryNodesRef = useRef<Node[]>([]);
  const linesRef = useRef<{ from: number; to: number; progress: number; isSecondary?: boolean }[]>([]);
  const globalScaleRef = useRef(1);
  const goldPulseRef = useRef(0);

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
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        label,
        opacity: 0,
        scale: 0,
      };
    });
    nodesRef.current = primaryNodes;

    // Secondary nodes
    const secNodes: Node[] = [];
    primaryNodes.forEach((pn, pi) => {
      const count = 2 + (pi % 2);
      for (let j = 0; j < count; j++) {
        const angle = Math.atan2(pn.y - cy, pn.x - cx) + (j - 1) * 0.5;
        const dist = radius * 0.45;
        secNodes.push({
          x: pn.x + Math.cos(angle) * dist,
          y: pn.y + Math.sin(angle) * dist,
          label: "",
          opacity: 0,
          scale: 0,
        });
      }
    });
    secondaryNodesRef.current = secNodes;

    // Primary lines (center to each primary)
    linesRef.current = primaryNodes.map((_, i) => ({
      from: -1, // center
      to: i,
      progress: 0,
    }));

    let elapsed = 0;
    let lastTime = performance.now();
    let currentPhase: "A" | "B" | "C" | "D" | "done" = "A";

    const draw = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      elapsed += dt;

      ctx.clearRect(0, 0, w, h);
      ctx.save();

      const scale = globalScaleRef.current;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);

      // Phase timing
      if (currentPhase === "A" && elapsed > 5) {
        currentPhase = "B";
        setPhase("B");
        phaseTimeRef.current = elapsed;
      } else if (currentPhase === "B" && elapsed > 12) {
        currentPhase = "C";
        setPhase("C");
        phaseTimeRef.current = elapsed;
      } else if (currentPhase === "C" && elapsed > 16) {
        currentPhase = "D";
        setPhase("D");
        phaseTimeRef.current = elapsed;
      } else if (currentPhase === "D" && elapsed > 18) {
        currentPhase = "done";
        setPhase("done");
      }

      // Central core
      const pulseScale = 1 + Math.sin(elapsed * Math.PI) * 0.04;
      const coreRadius = 12 * pulseScale;
      
      // Core glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 3);
      grad.addColorStop(0, "rgba(255,255,255,0.8)");
      grad.addColorStop(0.4, "rgba(214,184,90,0.3)");
      grad.addColorStop(1, "rgba(214,184,90,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fill();

      // Phase A: animate primary lines & nodes
      if (currentPhase === "A" || currentPhase === "B" || currentPhase === "C" || currentPhase === "D") {
        const phaseAProgress = Math.min(elapsed / 4, 1);
        
        linesRef.current.forEach((line, i) => {
          if (line.isSecondary && currentPhase === "A") return;
          
          const lineStart = i * 0.3;
          const lineProgress = Math.max(0, Math.min(1, (elapsed - lineStart) / 0.8));
          line.progress = lineProgress;

          if (lineProgress > 0 && !line.isSecondary) {
            const node = primaryNodes[line.to];
            const endX = cx + (node.x - cx) * lineProgress;
            const endY = cy + (node.y - cy) * lineProgress;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(255,255,255,${0.4 + goldPulseRef.current * 0.4})`;
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
          const nodeGlow = currentPhase === "D" ? goldPulseRef.current : 0;

          ctx.beginPath();
          ctx.arc(node.x, node.y, 5 * node.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${node.opacity * 0.8})`;
          ctx.fill();

          if (nodeGlow > 0) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(214,184,90,${nodeGlow * 0.5})`;
            ctx.fill();
          }
        });

        // Labels
        const newLabels = primaryNodes
          .filter((n) => n.opacity > 0.5)
          .map((n) => ({
            x: n.x,
            y: n.y + 20,
            text: n.label,
            opacity: Math.min(1, (n.opacity - 0.5) * 2),
          }));
        setLabels(newLabels);
      }

      // Phase B: secondary nodes and cross-links
      if (currentPhase === "B" || currentPhase === "C" || currentPhase === "D") {
        const bElapsed = elapsed - 5;
        
        secondaryNodesRef.current.forEach((sn, i) => {
          const delay = i * 0.2;
          const progress = Math.max(0, Math.min(1, (bElapsed - delay) / 0.6));
          sn.opacity = progress * 0.6;
          sn.scale = progress;

          if (progress > 0) {
            ctx.beginPath();
            ctx.arc(sn.x, sn.y, 3 * sn.scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${sn.opacity * 0.6})`;
            ctx.fill();

            // Line from parent primary node
            const parentIdx = Math.floor(i / 2.5);
            const parent = primaryNodes[Math.min(parentIdx, 4)];
            ctx.beginPath();
            ctx.moveTo(parent.x, parent.y);
            const ex = parent.x + (sn.x - parent.x) * progress;
            const ey = parent.y + (sn.y - parent.y) * progress;
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = `rgba(255,255,255,${0.3 * progress})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        // Cross-links between adjacent primary nodes
        if (bElapsed > 1.5) {
          const crossProgress = Math.min(1, (bElapsed - 1.5) / 1.5);
          for (let i = 0; i < primaryNodes.length; i++) {
            const j = (i + 1) % primaryNodes.length;
            const a = primaryNodes[i];
            const b = primaryNodes[j];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            const mx = a.x + (b.x - a.x) * crossProgress;
            const my = a.y + (b.y - a.y) * crossProgress;
            ctx.lineTo(mx, my);
            ctx.strokeStyle = `rgba(255,255,255,${0.25 * crossProgress})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Phase C: zoom out
      if (currentPhase === "C") {
        const cElapsed = elapsed - 12;
        globalScaleRef.current = 1 - (cElapsed / 4) * 0.15;
        
        // Gold shimmer
        if (cElapsed > 2) {
          const shimmer = Math.sin((cElapsed - 2) * Math.PI) * 0.4;
          goldPulseRef.current = Math.max(0, shimmer);
        }
      }

      // Phase D: gold pulse ripple
      if (currentPhase === "D") {
        const dElapsed = elapsed - 16;
        goldPulseRef.current = Math.max(0, Math.sin(dElapsed * Math.PI * 2) * 0.8);
        
        // Core brightens
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.3 + dElapsed * 0.3})`;
        ctx.fill();
      }

      ctx.restore();

      if (currentPhase !== "done") {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
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
            left: l.x,
            top: l.y,
            transform: "translateX(-50%)",
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
