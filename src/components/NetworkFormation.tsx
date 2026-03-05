import { useEffect, useRef } from "react";
import React from "react";

interface NetworkFormationProps {
  onComplete: () => void;
  style?: React.CSSProperties;
}

const PRIMARY_LABELS = ["Faculty", "Students", "Exams", "Attendance", "Timetable"];
const CRIMSON = { r: 155, g: 26, b: 26 };

// ─── Node types ───────────────────────────────────────────────────────────────
interface BaseNode { id: string; x: number; y: number; baseX: number; baseY: number; radius: number; alpha: number; }
interface PrimaryNode extends BaseNode { type: "primary"; label: string; }
interface SecondaryNode extends BaseNode { type: "secondary"; parentId: string; parentX: number; parentY: number; }
interface TertiaryNode extends BaseNode { type: "tertiary"; parentId: string; parentX: number; parentY: number; }
type AnyNode = PrimaryNode | SecondaryNode | TertiaryNode;

// ─── Easing ──────────────────────────────────────────────────────────────────
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

// ─── Node generation ─────────────────────────────────────────────────────────
const SEC_PER_PRIMARY = 8;
const TERT_PER_SECONDARY = 5;

function generatePrimaryNodes(cx: number, cy: number, R: number): PrimaryNode[] {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const r = R * 0.36;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { id: `p${i}`, x, y, baseX: x, baseY: y, radius: 6, alpha: 0.9, type: "primary", label: PRIMARY_LABELS[i] };
  });
}

function generateSecondaryNodes(primary: PrimaryNode[], cx: number, cy: number, R: number): SecondaryNode[] {
  const nodes: SecondaryNode[] = [];
  const sector = (Math.PI * 2) / 5; // 72° sector per primary
  primary.forEach((p) => {
    const pAngle = Math.atan2(p.baseY - cy, p.baseX - cx);
    for (let i = 0; i < SEC_PER_PRIMARY; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4); // 0 = inner ring, 1 = outer ring
      const angleOff = ((col / 3) - 0.5) * sector * 0.78;
      const dist = R * (0.52 + row * 0.14 + (col % 2) * 0.03);
      const x = cx + dist * Math.cos(pAngle + angleOff);
      const y = cy + dist * Math.sin(pAngle + angleOff);
      const depth = 0.3 + row * 0.4 + (col / 8);
      nodes.push({
        id: `s_${p.id}_${i}`, x, y, baseX: x, baseY: y,
        radius: 2 + depth * 2.5,
        alpha: 0.45 + depth * 0.45,
        type: "secondary", parentId: p.id, parentX: p.baseX, parentY: p.baseY,
      });
    }
  });
  return nodes;
}

function generateTertiaryNodes(secondary: SecondaryNode[], cx: number, cy: number, R: number): TertiaryNode[] {
  const nodes: TertiaryNode[] = [];
  secondary.forEach((s) => {
    const sAngle = Math.atan2(s.baseY - cy, s.baseX - cx);
    for (let i = 0; i < TERT_PER_SECONDARY; i++) {
      const spread = Math.PI * 0.15;
      const angle = sAngle + ((i / (TERT_PER_SECONDARY - 1)) - 0.5) * spread * 2;
      const dist = R * (0.76 + (i % 2) * 0.09 + Math.floor(i / 2) * 0.04);
      const x = cx + dist * Math.cos(angle);
      const y = cy + dist * Math.sin(angle);
      const depth = 0.35 + (i / TERT_PER_SECONDARY) * 0.55;
      nodes.push({
        id: `t_${s.id}_${i}`, x, y, baseX: x, baseY: y,
        radius: 1 + depth * 1.6,
        alpha: 0.25 + depth * 0.5,
        type: "tertiary", parentId: s.id, parentX: s.baseX, parentY: s.baseY,
      });
    }
  });
  return nodes;
}

// ─── Component ────────────────────────────────────────────────────────────────
const NetworkFormation = ({ onComplete }: NetworkFormationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelDivRef = useRef<HTMLDivElement>(null);
  const iSpinDivRef = useRef<HTMLDivElement>(null);
  const measureDivRef = useRef<HTMLDivElement>(null);
  const iMeasureRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const nodesRef = useRef<{ primary: PrimaryNode[]; secondary: SecondaryNode[]; tertiary: TertiaryNode[] } | null>(null);
  const phaseRef = useRef<"A" | "B" | "C" | "D" | "E" | "F" | "done">("A");
  const frameRef = useRef<number>(0);
  const readyRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const iTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  onCompleteRef.current = onComplete;

  // ── Initialize nodes ONCE ─────────────────────────────────────────────────
  useEffect(() => {
    if (nodesRef.current !== null) return;
    const w = window.innerWidth, h = window.innerHeight;
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * (w < 600 ? 0.38 : 0.32);
    const primary = generatePrimaryNodes(cx, cy, R);
    const secondary = generateSecondaryNodes(primary, cx, cy, R);
    const tertiary = generateTertiaryNodes(secondary, cx, cy, R);
    nodesRef.current = { primary, secondary, tertiary };
    readyRef.current = true;
  }, []);

  // ── Measure "i" tittle ────────────────────────────────────────────────────
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (iMeasureRef.current) {
        const rect = iMeasureRef.current.getBoundingClientRect();
        iTargetRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.08 };
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Phase timers ─────────────────────────────────────────────────────────
  // A(0→1.5s) B(1.5→3.5s) C(3.5→5.5s) D(5.5→6.5s) E(6.5→7.3s) F(7.3→9.8s)
  useEffect(() => {
    const t1 = setTimeout(() => { phaseRef.current = "B"; }, 1500);
    const t2 = setTimeout(() => { phaseRef.current = "C"; }, 3500);
    const t3 = setTimeout(() => { phaseRef.current = "D"; }, 5500);
    const t4 = setTimeout(() => { phaseRef.current = "E"; }, 6500);
    const t5 = setTimeout(() => { phaseRef.current = "F"; }, 7300);
    const t6 = setTimeout(() => { phaseRef.current = "done"; }, 9800);
    return () => { [t1, t2, t3, t4, t5, t6].forEach(clearTimeout); };
  }, []);

  // ── Single rAF loop ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * (w < 600 ? 0.38 : 0.32);

    let startTime: number | null = null;
    let phaseEStart = 0, phaseFStart = 0;
    let completeFired = false, dotHandoffDone = false;
    const stableRadii = new Map<string, number>();
    const TRAVEL_MS = 500;

    const draw = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = (now - startTime) / 1000;
      const phase = phaseRef.current;

      if (phase === "done" && !completeFired) {
        completeFired = true;
        const ov = iSpinDivRef.current;
        if (ov) ov.style.opacity = "0";
        setTimeout(() => onCompleteRef.current(), 600);
        return;
      }
      if (!readyRef.current) { frameRef.current = requestAnimationFrame(draw); return; }

      const nodes = nodesRef.current!;
      ctx.clearRect(0, 0, w, h);

      // ═════════════════════════════════════════════════════════════
      // PHASES A – D: hierarchical casting
      // ═════════════════════════════════════════════════════════════
      if (phase === "A" || phase === "B" || phase === "C" || phase === "D") {

        // ── Crimson core glow ───────────────────────────────────────
        const coreR = 10;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
        g.addColorStop(0, `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},0.85)`);
        g.addColorStop(0.5, "rgba(155,26,26,0.12)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},0.9)`; ctx.fill();

        // ── PHASE A: 5 primary spokes shoot out ────────────────────
        nodes.primary.forEach((node, i) => {
          const prog = Math.max(0, Math.min(1, (elapsed - i * 0.18) / 0.45));
          if (prog <= 0) return;
          const ex = cx + (node.baseX - cx) * easeOut(prog);
          const ey = cy + (node.baseY - cy) * easeOut(prog);
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey);
          ctx.strokeStyle = "rgba(0,200,212,0.5)"; ctx.lineWidth = 1.5; ctx.stroke();
          if (prog >= 1) {
            // glow behind primary
            const pg = ctx.createRadialGradient(node.baseX, node.baseY, 0, node.baseX, node.baseY, 18);
            pg.addColorStop(0, "rgba(0,200,212,0.35)"); pg.addColorStop(1, "rgba(0,0,0,0)");
            ctx.beginPath(); ctx.arc(node.baseX, node.baseY, 18, 0, Math.PI * 2);
            ctx.fillStyle = pg; ctx.fill();
            ctx.beginPath(); ctx.arc(node.baseX, node.baseY, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,200,212,0.92)"; ctx.fill();
          }
        });

        // Labels
        if (labelDivRef.current) {
          nodes.primary.forEach((node, i) => {
            const el = labelDivRef.current!.children[i] as HTMLSpanElement | null;
            if (!el) return;
            const p = Math.max(0, Math.min(1, (elapsed - i * 0.18) / 0.45));
            el.style.opacity = p >= 1 ? "0.65" : "0";
            el.style.left = `${node.baseX}px`;
            el.style.top = `${node.baseY + 20}px`;
          });
        }

        // ── PHASE B: primary → secondary casting ───────────────────
        if (phase === "B" || phase === "C" || phase === "D") {
          const bEl = elapsed - 1.5;
          nodes.secondary.forEach((node, idx) => {
            const grp = Math.floor(idx / SEC_PER_PRIMARY);
            const j = idx % SEC_PER_PRIMARY;
            // In B: animate; in C/D: fully drawn
            const prog = phase === "B"
              ? Math.max(0, Math.min(1, (bEl - grp * 0.12 - j * 0.07) / 0.35))
              : 1;
            if (prog <= 0) return;

            // cast line from parent
            const ex = node.parentX + (node.baseX - node.parentX) * easeOut(prog);
            const ey = node.parentY + (node.baseY - node.parentY) * easeOut(prog);
            const lineA = phase === "B" ? 0.45 * prog : 0.22;
            const isTeal = (Math.floor(idx / SEC_PER_PRIMARY) + j) % 3 !== 0;
            ctx.beginPath(); ctx.moveTo(node.parentX, node.parentY); ctx.lineTo(ex, ey);
            ctx.strokeStyle = isTeal
              ? `rgba(0,200,212,${lineA})`
              : `rgba(224,154,42,${lineA})`;
            ctx.lineWidth = 0.9; ctx.stroke();

            if (prog >= 1) {
              ctx.beginPath(); ctx.arc(node.baseX, node.baseY, node.radius, 0, Math.PI * 2);
              ctx.fillStyle = isTeal
                ? `rgba(0,200,212,${node.alpha})`
                : `rgba(224,154,42,${node.alpha * 0.85})`;
              ctx.fill();
            }
          });
        }

        // ── PHASE C: secondary → tertiary casting ──────────────────
        if (phase === "C" || phase === "D") {
          const cEl = elapsed - 3.5;
          nodes.tertiary.forEach((node, idx) => {
            const grp = Math.floor(idx / TERT_PER_SECONDARY);
            const k = idx % TERT_PER_SECONDARY;
            const prog = phase === "C"
              ? Math.max(0, Math.min(1, (cEl - grp * 0.022 - k * 0.055) / 0.28))
              : 1;
            if (prog <= 0) return;

            const ex = node.parentX + (node.baseX - node.parentX) * easeOut(prog);
            const ey = node.parentY + (node.baseY - node.parentY) * easeOut(prog);
            const lineA = phase === "C" ? 0.3 * prog : 0.14;
            ctx.beginPath(); ctx.moveTo(node.parentX, node.parentY); ctx.lineTo(ex, ey);
            ctx.strokeStyle = `rgba(0,200,212,${lineA})`;
            ctx.lineWidth = 0.6; ctx.stroke();

            if (prog >= 1) {
              ctx.beginPath(); ctx.arc(node.baseX, node.baseY, node.radius, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0,200,212,${node.alpha})`; ctx.fill();
            }
          });
        }

        // ── PHASE D: pulse wave ─────────────────────────────────────
        if (phase === "D") {
          const dEl = elapsed - 5.5;
          const pa = Math.max(0, Math.sin(dEl * Math.PI * 2.5) * 0.7);
          ctx.beginPath(); ctx.arc(cx, cy, 18 + dEl * 55, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(224,154,42,${pa * 0.5})`; ctx.lineWidth = 1; ctx.stroke();
          // brighten core
          ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},${Math.min(1, 0.9 + pa * 0.1)})`; ctx.fill();
        }
      }

      // ═════════════════════════════════════════════════════════════
      // PHASE E — collapse everything to a 3px dot (0.8 s)
      // ═════════════════════════════════════════════════════════════
      if (phase === "E") {
        if (phaseEStart === 0) phaseEStart = elapsed;
        const eEl = elapsed - phaseEStart;
        const e = easeInOut(Math.min(1, eEl / 0.8));

        if (stableRadii.size === 0) {
          [...nodes.primary, ...nodes.secondary, ...nodes.tertiary].forEach(n => stableRadii.set(n.id, n.radius));
        }

        const drawCollapsing = (n: AnyNode, color: string) => {
          const nx = n.baseX + (cx - n.baseX) * e;
          const ny = n.baseY + (cy - n.baseY) * e;
          const r0 = stableRadii.get(n.id) ?? n.radius;
          const nr = r0 * (1 - e);
          if (nr < 0.1) return;
          ctx.beginPath(); ctx.arc(nx, ny, nr, 0, Math.PI * 2);
          ctx.fillStyle = color.replace("$a", String(n.alpha * (1 - e))); ctx.fill();
        };

        nodes.tertiary.forEach(n => drawCollapsing(n, `rgba(0,200,212,$a)`));
        nodes.secondary.forEach(n => {
          const isTeal = (parseInt(n.id.split("_")[2]) + parseInt(n.id.split("_")[3] ?? "0")) % 3 !== 0;
          drawCollapsing(n, isTeal ? `rgba(0,200,212,$a)` : `rgba(224,154,42,$a)`);
        });
        nodes.primary.forEach(n => drawCollapsing(n, `rgba(0,200,212,$a)`));

        // Keep-alive crimson dot
        const cr = 10 * (1 - e) + 3;
        ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},0.95)`; ctx.fill();

        // Fade labels
        if (labelDivRef.current) {
          [...labelDivRef.current.children].forEach(el => {
            (el as HTMLElement).style.opacity = String(Math.max(0, 1 - e * 3));
          });
        }
      }

      // ═════════════════════════════════════════════════════════════
      // PHASE F — bezier dot travel → "by iSpin Team" reveal
      // ═════════════════════════════════════════════════════════════
      if (phase === "F" || phase === "done") {
        if (phaseFStart === 0) phaseFStart = elapsed;
        const fEl = elapsed - phaseFStart;

        const iTarget = iTargetRef.current;
        const targetX = iTarget.x || cx;
        const targetY = iTarget.y || cy;
        const travelDur = 0.5;
        const tE = easeInOut(Math.min(1, fEl / travelDur));
        const cpX = (cx + targetX) / 2;
        const cpY = Math.min(cy, targetY) - 50;
        const dotX = (1 - tE) * (1 - tE) * cx + 2 * (1 - tE) * tE * cpX + tE * tE * targetX;
        const dotY = (1 - tE) * (1 - tE) * cy + 2 * (1 - tE) * tE * cpY + tE * tE * targetY;

        const fElMs = fEl * 1000;
        const HANDOFF_MS = TRAVEL_MS - 30;
        const dotAlpha = phase === "done" ? 0
          : fElMs < HANDOFF_MS ? 1
            : Math.max(0, 1 - (fElMs - HANDOFF_MS) / 80);

        if (dotAlpha > 0.01) {
          ctx.beginPath(); ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${CRIMSON.r},${CRIMSON.g},${CRIMSON.b},${dotAlpha})`; ctx.fill();
        }

        if (!dotHandoffDone && fElMs >= HANDOFF_MS) {
          dotHandoffDone = true;
          if (dotRef.current) {
            dotRef.current.style.transition = "opacity 150ms ease-in";
            dotRef.current.style.opacity = "1";
            dotRef.current.style.animation = "dotPulse 0.6s ease-in-out infinite alternate";
          }
        }

        const textFadeDur = 0.4;
        const textProg = Math.max(0, Math.min(1, (fEl - travelDur + textFadeDur * 0.3) / textFadeDur));
        const holdStart = travelDur + textFadeDur;
        const holdEnd = holdStart + 1.1;
        const fadeOutDur = 0.5;
        const overlay = iSpinDivRef.current;
        if (overlay) {
          let opa = 0;
          if (fEl >= travelDur - textFadeDur * 0.3) opa = textProg;
          if (fEl >= holdStart && fEl < holdEnd) opa = 1;
          if (fEl >= holdEnd) opa = Math.max(0, 1 - (fEl - holdEnd) / fadeOutDur);
          overlay.style.opacity = String(opa);
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="fixed inset-0 z-10">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Node labels */}
      <div ref={labelDivRef} className="absolute inset-0 pointer-events-none">
        {PRIMARY_LABELS.map((label, i) => (
          <span
            key={i}
            className="absolute font-space text-xs tracking-[0.1em]"
            style={{ color: "rgba(220,235,240,0.65)", transform: "translateX(-50%)", opacity: 0 }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Hidden measurement div for "i" tittle position */}
      <div
        ref={measureDivRef}
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          whiteSpace: "nowrap",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(1rem, 6vw, 2.8rem)",
          letterSpacing: "0.25em",
          opacity: 0, pointerEvents: "none", zIndex: -1,
        }}
      >
        <span>by </span>
        <span ref={iMeasureRef}>ı</span>
        <span>Spin Team</span>
      </div>

      {/* "by iSpin Team" overlay */}
      <div
        ref={iSpinDivRef}
        className="pointer-events-none"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 50, textAlign: "center", whiteSpace: "nowrap",
          opacity: 0, transition: "opacity 0.05s linear",
          letterSpacing: "0.25em",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(1rem, 6vw, 2.8rem)",
        }}
      >
        <span style={{ color: "rgba(180,205,215,0.5)", fontWeight: 400 }}>by&nbsp;</span>
        <span style={{ position: "relative", display: "inline-block" }}>
          <span style={{ color: "#9b1a1a", fontWeight: 400 }}>ı</span>
          <span
            ref={dotRef}
            style={{
              position: "absolute", top: "-0.08em", left: "50%",
              transform: "translateX(-50%)",
              display: "inline-block", fontSize: "0.55em", lineHeight: 1,
              color: "#9b1a1a",
              filter: "drop-shadow(0 0 6px #9b1a1a) drop-shadow(0 0 12px rgba(155,26,26,0.8))",
              opacity: 0,
            }}
            className="ispin-dot"
          >●</span>
        </span>
        <span style={{ color: "#00c8d4", fontWeight: 400 }}>Spin</span>
        <span style={{ color: "rgba(180,205,215,0.5)", fontWeight: 400 }}>&nbsp;Team</span>
      </div>

      <style>{`
        @keyframes dotPulse {
          0%   { transform: translateX(-50%) scale(0.85); filter: drop-shadow(0 0 4px #9b1a1a) drop-shadow(0 0 8px rgba(155,26,26,0.6)); opacity: 0.85; }
          100% { transform: translateX(-50%) scale(1.2);  filter: drop-shadow(0 0 10px #9b1a1a) drop-shadow(0 0 20px rgba(155,26,26,0.9)) drop-shadow(0 0 35px rgba(155,26,26,0.4)); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NetworkFormation;
