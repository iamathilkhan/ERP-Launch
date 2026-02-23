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
  z?: number;
}

interface SphereLink {
  a: number;
  b: number;
  alpha: number;
  lineWidth: number;
  color: "blue" | "yellow";
}

interface SphereData {
  nodes: SphereNode[];
  primaryCount: number;
  secondaryStart: number;
  secondaryCount: number;
  tertiaryStart: number;
  tertiaryCount: number;
  links: SphereLink[];
  cx: number;
  cy: number;
  sphereRadius: number;
}

const PRIMARY_LABELS = ["Faculty", "Students", "Exams", "Attendance", "Timetable"];
const CRIMSON = { r: 121, g: 12, b: 12 };
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function buildSphereData(w: number, h: number): SphereData {
  const cx = w / 2;
  const cy = h / 2;
  const sphereRadius = Math.min(w, h) * 0.32;
  const nodes: SphereNode[] = [];

  // Primary nodes — pentagon at 55% radius
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + sphereRadius * 0.55 * Math.cos(angle);
    const y = cy + sphereRadius * 0.55 * Math.sin(angle);
    nodes.push({
      x, y, baseX: x, baseY: y,
      radius: 6, alpha: 0.9, layer: "primary",
      label: PRIMARY_LABELS[i], z: 0.8,
    });
  }

  const secondaryStart = nodes.length;
  // Secondary nodes — 12 per primary using golden angle spiral on sphere surface
  for (let pi = 0; pi < 5; pi++) {
    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = GOLDEN_ANGLE * i + pi * 1.2566; // offset per primary

      const x3d = Math.sin(inclination) * Math.cos(azimuth);
      const y3d = Math.sin(inclination) * Math.sin(azimuth);
      const z3d = Math.cos(inclination);

      const depthFactor = (z3d + 1) / 2;
      const projectedR = sphereRadius * (0.5 + depthFactor * 0.45);

      const x = cx + projectedR * x3d;
      const y = cy + projectedR * y3d;

      nodes.push({
        x, y, baseX: x, baseY: y,
        radius: 1.5 + depthFactor * 2.5,
        alpha: 0.2 + depthFactor * 0.65,
        layer: "secondary", z: z3d,
      });
    }
  }
  const secondaryCount = nodes.length - secondaryStart;

  const tertiaryStart = nodes.length;
  // Tertiary nodes — 480 total using Fibonacci sphere
  const totalTertiary = 480;
  for (let i = 0; i < totalTertiary; i++) {
    const t = i / totalTertiary;
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = GOLDEN_ANGLE * i;

    const x3d = Math.sin(inclination) * Math.cos(azimuth);
    const y3d = Math.sin(inclination) * Math.sin(azimuth);
    const z3d = Math.cos(inclination);

    const depthFactor = (z3d + 1) / 2;
    const projectedR = sphereRadius * (0.48 + depthFactor * 0.48);

    const x = cx + projectedR * x3d;
    const y = cy + projectedR * y3d;

    nodes.push({
      x, y, baseX: x, baseY: y,
      radius: 0.8 + depthFactor * 1.2,
      alpha: 0.1 + depthFactor * 0.4,
      layer: "tertiary", z: z3d,
    });
  }
  const tertiaryCount = nodes.length - tertiaryStart;

  // Links — nearest neighbor within 45px threshold
  const links: SphereLink[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].baseX - nodes[j].baseX;
      const dy = nodes[i].baseY - nodes[j].baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 45) {
        const a = nodes[i];
        const b = nodes[j];
        const minAlpha = Math.min(a.alpha, b.alpha);

        let lineWidth = 0.5;
        let color: "blue" | "yellow" = "blue";
        if (a.layer === "primary" || b.layer === "primary") {
          lineWidth = 1.5;
          color = "blue";
        } else if (a.layer === "secondary" || b.layer === "secondary") {
          lineWidth = 1;
          color = "yellow";
        }

        links.push({ a: i, b: j, alpha: minAlpha * 0.6, lineWidth, color });
      }
    }
  }

  return {
    nodes, primaryCount: 5,
    secondaryStart, secondaryCount,
    tertiaryStart, tertiaryCount,
    links, cx, cy, sphereRadius,
  };
}

const NetworkFormation = ({ onComplete }: NetworkFormationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<SphereData | null>(null);
  const phaseRef = useRef<"A" | "B" | "C" | "D" | "done">("A");
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(0);
  const driftRef = useRef(0);
  const rafRef = useRef(0);
  const [labels, setLabels] = useState<{ x: number; y: number; text: string; opacity: number }[]>([]);
  const [fadeOut, setFadeOut] = useState(false);

  // Initialize sphere data once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    if (!dataRef.current) {
      dataRef.current = buildSphereData(w, h);
    }
  }, []);

  // Continuous animation loop — never interrupted between phases
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    lastTimeRef.current = performance.now();

    const draw = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      elapsedRef.current += dt;
      const elapsed = elapsedRef.current;
      const data = dataRef.current;
      if (!data) { rafRef.current = requestAnimationFrame(draw); return; }

      const { nodes, primaryCount, secondaryStart, secondaryCount, tertiaryStart, tertiaryCount, links, cx, cy, sphereRadius } = data;
      const w = canvas.width;
      const h = canvas.height;

      // Phase transitions — only update ref, never restart loop
      if (phaseRef.current === "A" && elapsed > 5) phaseRef.current = "B";
      else if (phaseRef.current === "B" && elapsed > 12) phaseRef.current = "C";
      else if (phaseRef.current === "C" && elapsed > 16) phaseRef.current = "D";
      else if (phaseRef.current === "D" && elapsed > 18) {
        phaseRef.current = "done";
        setFadeOut(true);
        return; // stop loop
      }

      const phase = phaseRef.current;

      ctx.clearRect(0, 0, w, h);

      // Lateral drift for rotation illusion
      driftRef.current += 0.15;
      const drift = driftRef.current;

      // Central core — CRIMSON
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

      // Calculate drifted positions (without mutating baseX)
      const driftedX = (node: SphereNode) => {
        let nx = node.baseX + drift;
        const relX = nx - cx;
        const wrapW = sphereRadius * 2.5;
        while (relX > wrapW / 2) nx -= wrapW;
        return nx;
      };

      // Phase A: Primary nodes animate in (always draw once visible)
      const labelData: { x: number; y: number; text: string; opacity: number }[] = [];

      for (let i = 0; i < primaryCount; i++) {
        const node = nodes[i];
        const nx = driftedX(node);
        const lineStart = i * 0.3;
        const lineProgress = Math.max(0, Math.min(1, (elapsed - lineStart) / 0.8));

        if (lineProgress > 0) {
          const endX = cx + (nx - cx) * lineProgress;
          const endY = cy + (node.baseY - cy) * lineProgress;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = "rgba(26,58,255,0.5)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          if (lineProgress >= 1) {
            ctx.beginPath();
            ctx.arc(nx, node.baseY, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(26,58,255,${node.alpha * 0.8})`;
            ctx.fill();

            if (node.label) {
              labelData.push({ x: nx, y: node.baseY + 20, text: node.label, opacity: 0.6 });
            }
          }
        }
      }

      // Phase B+: secondary + tertiary nodes (opacity only increases, never decreases)
      if (phase === "B" || phase === "C" || phase === "D") {
        const bElapsed = elapsed - 5;

        // Secondary nodes
        for (let i = 0; i < secondaryCount; i++) {
          const node = nodes[secondaryStart + i];
          const delay = i * 0.04;
          const progress = Math.max(0, Math.min(1, (bElapsed - delay) / 0.6));
          if (progress <= 0) continue;

          const nx = driftedX(node);
          ctx.beginPath();
          ctx.arc(nx, node.baseY, node.radius * progress, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196,168,79,${node.alpha * 0.6 * progress})`;
          ctx.fill();
        }

        // Tertiary nodes (delayed)
        if (bElapsed > 1.5) {
          for (let i = 0; i < tertiaryCount; i++) {
            const node = nodes[tertiaryStart + i];
            const delay = i * 0.005;
            const progress = Math.max(0, Math.min(1, (bElapsed - 1.5 - delay) / 0.8));
            if (progress <= 0) continue;

            const nx = driftedX(node);
            ctx.beginPath();
            ctx.arc(nx, node.baseY, node.radius * progress, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(26,58,255,${node.alpha * 0.4 * progress})`;
            ctx.fill();
          }
        }

        // Links
        if (bElapsed > 0.5) {
          const linkProgress = Math.min(1, (bElapsed - 0.5) / 2);
          for (const link of links) {
            const a = nodes[link.a];
            const b = nodes[link.b];
            const ax = driftedX(a);
            const bx = driftedX(b);

            const mx = ax + (bx - ax) * linkProgress;
            const my = a.baseY + (b.baseY - a.baseY) * linkProgress;

            ctx.beginPath();
            ctx.moveTo(ax, a.baseY);
            ctx.lineTo(mx, my);

            if (link.color === "blue") {
              ctx.strokeStyle = `rgba(26,58,255,${link.alpha * linkProgress})`;
            } else {
              ctx.strokeStyle = `rgba(196,168,79,${link.alpha * linkProgress})`;
            }
            ctx.lineWidth = link.lineWidth;
            ctx.stroke();
          }
        }
      }

      // Phase D: muted yellow pulse
      if (phase === "D") {
        const dElapsed = elapsed - 16;
        const pulseAlpha = Math.max(0, Math.sin(dElapsed * Math.PI * 2) * 0.8);
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

      // Update labels without causing re-render storm — throttle
      if (Math.floor(elapsed * 10) % 3 === 0) {
        setLabels(labelData);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Handle completion
  useEffect(() => {
    if (fadeOut) {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
  }, [fadeOut, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
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
