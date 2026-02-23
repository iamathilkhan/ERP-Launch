import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface NetworkFormationProps {
  onComplete: () => void;
}

interface SphereNode {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  alpha: number;
  layer: "primary" | "secondary" | "tertiary";
  label?: string;
  parentIdx?: number;
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
    const sphereRadius = Math.min(w, h) * 0.32;
    const primaryRadius = sphereRadius * 0.45;

    // Depth factor helper
    const depthFactor = (x: number, y: number) => {
      const dist = Math.hypot(x - cx, y - cy);
      return Math.min(1, dist / sphereRadius);
    };

    // Create primary nodes
    const allNodes: SphereNode[] = [];
    const primaryIndices: number[] = [];

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * primaryRadius;
      const y = cy + Math.sin(angle) * primaryRadius;
      const df = depthFactor(x, y);
      primaryIndices.push(allNodes.length);
      allNodes.push({
        x, y, baseX: x, baseY: y,
        radius: 1.5 + df * 3.5,
        alpha: 0.2 + df * 0.75,
        layer: "primary",
        label: PRIMARY_LABELS[i],
      });
    }

    // Create secondary nodes (12-15 per primary)
    const secondaryIndices: number[] = [];
    primaryIndices.forEach((pi) => {
      const pn = allNodes[pi];
      const count = 12 + Math.floor(Math.random() * 4);
      for (let j = 0; j < count; j++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 80;
        const x = pn.baseX + Math.cos(angle) * dist;
        const y = pn.baseY + Math.sin(angle) * dist;
        const df = depthFactor(x, y);
        secondaryIndices.push(allNodes.length);
        allNodes.push({
          x, y, baseX: x, baseY: y,
          radius: 1.5 + df * 3.5,
          alpha: 0.2 + df * 0.75,
          layer: "secondary",
          parentIdx: pi,
        });
      }
    });

    // Create tertiary nodes (6-8 per secondary)
    const tertiaryIndices: number[] = [];
    secondaryIndices.forEach((si) => {
      const sn = allNodes[si];
      const count = 6 + Math.floor(Math.random() * 3);
      for (let j = 0; j < count; j++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 50;
        let x = sn.baseX + Math.cos(angle) * dist;
        let y = sn.baseY + Math.sin(angle) * dist;
        // Constrain to sphere
        const dfc = Math.hypot(x - cx, y - cy);
        if (dfc > sphereRadius) {
          const scale = sphereRadius / dfc;
          x = cx + (x - cx) * scale;
          y = cy + (y - cy) * scale;
        }
        const df = depthFactor(x, y);
        tertiaryIndices.push(allNodes.length);
        allNodes.push({
          x, y, baseX: x, baseY: y,
          radius: 1.5 + df * 3.5,
          alpha: 0.2 + df * 0.75,
          layer: "tertiary",
          parentIdx: si,
        });
      }
    });

    // Pre-compute links by distance
    interface Link { a: number; b: number; type: "p-s" | "s-t" | "t-t" | "s-s" }
    const links: Link[] = [];

    // Primary-to-secondary
    secondaryIndices.forEach((si) => {
      const sn = allNodes[si];
      if (sn.parentIdx !== undefined) links.push({ a: sn.parentIdx, b: si, type: "p-s" });
    });

    // Secondary-to-tertiary
    tertiaryIndices.forEach((ti) => {
      const tn = allNodes[ti];
      if (tn.parentIdx !== undefined) links.push({ a: tn.parentIdx, b: ti, type: "s-t" });
    });

    // Cross-links within 50px threshold
    const crossNodes = [...secondaryIndices, ...tertiaryIndices];
    for (let i = 0; i < crossNodes.length; i++) {
      for (let j = i + 1; j < crossNodes.length; j++) {
        const a = allNodes[crossNodes[i]];
        const b = allNodes[crossNodes[j]];
        const dist = Math.hypot(a.baseX - b.baseX, a.baseY - b.baseY);
        if (dist < 50) {
          const aLayer = a.layer;
          const bLayer = b.layer;
          if (aLayer === "tertiary" && bLayer === "tertiary") {
            links.push({ a: crossNodes[i], b: crossNodes[j], type: "t-t" });
          } else if (aLayer === "secondary" && bLayer === "secondary") {
            links.push({ a: crossNodes[i], b: crossNodes[j], type: "s-s" });
          } else {
            links.push({ a: crossNodes[i], b: crossNodes[j], type: "s-t" });
          }
        }
      }
    }

    let elapsed = 0;
    let lastTime = performance.now();
    let currentPhase: "A" | "B" | "C" | "D" | "done" = "A";
    let driftOffset = 0;
    let rafId = 0;

    const linkStyle = (type: Link["type"]): [number, number] => {
      // [opacity, lineWidth]
      switch (type) {
        case "p-s": return [0.5, 1.5];
        case "s-t": return [0.32, 0.8];
        case "s-s": return [0.35, 1];
        case "t-t": return [0.2, 0.5];
      }
    };

    const draw = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      elapsed += dt;
      driftOffset += 0.15; // lateral drift per frame

      ctx.clearRect(0, 0, w, h);

      // Phase transitions
      if (currentPhase === "A" && elapsed > 5) { currentPhase = "B"; setPhase("B"); }
      else if (currentPhase === "B" && elapsed > 12) { currentPhase = "C"; setPhase("C"); }
      else if (currentPhase === "C" && elapsed > 16) { currentPhase = "D"; setPhase("D"); }
      else if (currentPhase === "D" && elapsed > 18) { currentPhase = "done"; setPhase("done"); }

      // Apply lateral drift (rotation illusion) - wrap nodes
      const wrapWidth = sphereRadius * 2.5;
      allNodes.forEach((node) => {
        node.x = node.baseX + driftOffset;
        // Wrap around
        const relX = node.x - cx;
        if (relX > wrapWidth / 2) {
          node.x -= wrapWidth;
          node.baseX -= wrapWidth;
        }
        // Recalculate depth
        const df = depthFactor(node.x, node.y);
        node.radius = 1.5 + df * 3.5;
        node.alpha = 0.2 + df * 0.75;
      });

      // Central core - CRIMSON
      const pulseScale = 1 + Math.sin(elapsed * Math.PI) * 0.04;
      const coreR = 12 * pulseScale;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
      grad.addColorStop(0, `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},0.8)`);
      grad.addColorStop(0.4, "rgba(26,58,255,0.15)");
      grad.addColorStop(1, "rgba(26,58,255,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},0.9)`;
      ctx.fill();

      // Phase A: Primary nodes animate in
      if (currentPhase === "A" || currentPhase === "B" || currentPhase === "C" || currentPhase === "D") {
        primaryIndices.forEach((pi, i) => {
          const node = allNodes[pi];
          const lineStart = i * 0.3;
          const lineProgress = Math.max(0, Math.min(1, (elapsed - lineStart) / 0.8));

          if (lineProgress > 0) {
            const endX = cx + (node.x - cx) * lineProgress;
            const endY = cy + (node.y - cy) * lineProgress;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(26,58,255,0.5)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            if (lineProgress >= 1) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(26,58,255,${node.alpha * 0.8})`;
              ctx.fill();
            }
          }
        });

        setLabels(primaryIndices
          .map(pi => allNodes[pi])
          .filter((_, i) => {
            const lineStart = i * 0.3;
            return elapsed - lineStart > 0.8;
          })
          .map(n => ({
            x: n.x, y: n.y + 20, text: n.label || "", opacity: 0.6,
          })));
      }

      // Phase B+: secondary + tertiary nodes
      if (currentPhase === "B" || currentPhase === "C" || currentPhase === "D") {
        const bElapsed = elapsed - 5;

        // Secondary nodes
        secondaryIndices.forEach((si, i) => {
          const node = allNodes[si];
          const delay = i * 0.04;
          const progress = Math.max(0, Math.min(1, (bElapsed - delay) / 0.6));
          if (progress <= 0) return;

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * progress, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196,168,79,${node.alpha * 0.6 * progress})`;
          ctx.fill();
        });

        // Tertiary nodes (delayed further)
        if (bElapsed > 1.5) {
          tertiaryIndices.forEach((ti, i) => {
            const node = allNodes[ti];
            const delay = i * 0.008;
            const progress = Math.max(0, Math.min(1, (bElapsed - 1.5 - delay) / 0.8));
            if (progress <= 0) return;

            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * progress, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(26,58,255,${node.alpha * 0.4 * progress})`;
            ctx.fill();
          });
        }

        // Links
        if (bElapsed > 0.5) {
          const linkProgress = Math.min(1, (bElapsed - 0.5) / 2);
          links.forEach((link) => {
            const a = allNodes[link.a];
            const b = allNodes[link.b];
            // Only draw if nodes are somewhat visible
            const aP = link.type === "p-s" ? 1 : Math.max(0, Math.min(1, (bElapsed - 0.5) / 0.6));
            const bP = link.type === "t-t" || link.type === "s-t"
              ? Math.max(0, Math.min(1, (bElapsed - 1.5) / 0.8))
              : aP;
            if (aP <= 0 || bP <= 0) return;

            const [opacity, lineW] = linkStyle(link.type);
            const mx = a.x + (b.x - a.x) * linkProgress;
            const my = a.y + (b.y - a.y) * linkProgress;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mx, my);

            // Color by type
            if (link.type === "p-s") {
              ctx.strokeStyle = `rgba(26,58,255,${opacity * linkProgress})`;
            } else if (link.type === "s-t" || link.type === "s-s") {
              ctx.strokeStyle = `rgba(196,168,79,${opacity * linkProgress})`;
            } else {
              ctx.strokeStyle = `rgba(26,58,255,${opacity * linkProgress})`;
            }
            ctx.lineWidth = lineW;
            ctx.stroke();
          });
        }
      }

      // Phase C: zoom out
      if (currentPhase === "C") {
        const cElapsed = elapsed - 12;
        // No CSS scale - just visual
      }

      // Phase D: muted yellow pulse
      if (currentPhase === "D") {
        const dElapsed = elapsed - 16;
        const pulseAlpha = Math.max(0, Math.sin(dElapsed * Math.PI * 2) * 0.8);
        // Pulse ring
        const pulseR = 20 + dElapsed * 40;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(196,168,79,${pulseAlpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},${0.3 + dElapsed * 0.3})`;
        ctx.fill();
      }

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
            color: `rgba(210,220,255,${l.opacity})`,
          }}
        >
          {l.text}
        </span>
      ))}
    </motion.div>
  );
};

export default NetworkFormation;
