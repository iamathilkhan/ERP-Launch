import { useEffect, useRef } from "react";

interface BlackholeTransitionProps {
    url: string;
    onDone: () => void;
}

const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Particle spiralling into the blackhole
interface Particle {
    x: number; y: number;        // current position
    angle: number;               // current orbital angle
    dist: number;                // current distance from center
    speed: number;               // angular velocity (rad/s)
    infall: number;              // inward speed (px/s)
    size: number;
    r: number; g: number; b: number; // colour
    alpha: number;
}

const LINKEDIN_URL = "https://www.linkedin.com/in/ahamed-athil-khan/";

const BlackholeTransition = ({ url = LINKEDIN_URL, onDone }: BlackholeTransitionProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const w = window.innerWidth, h = window.innerHeight;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        const cx = w / 2, cy = h / 2;

        // ── Generate particles scattered across the full screen ──────────
        const PALETTES = [
            [0, 200, 212],   // teal
            [224, 154, 42],  // amber
            [220, 235, 240], // cold white
            [155, 26, 26],   // crimson
        ];
        const particles: Particle[] = Array.from({ length: 320 }, () => {
            const px = Math.random() * w;
            const py = Math.random() * h;
            const dx = px - cx, dy = py - cy;
            const dist = Math.hypot(dx, dy) || 1;
            const angle = Math.atan2(dy, dx);
            const [r, g, b] = PALETTES[Math.floor(Math.random() * PALETTES.length)];
            return {
                x: px, y: py,
                angle,
                dist,
                speed: 0.4 + Math.random() * 0.8,   // rad/s angular velocity
                infall: 30 + Math.random() * 60,     // px/s infall speed
                size: 0.8 + Math.random() * 2.5,
                r, g, b,
                alpha: 0.5 + Math.random() * 0.5,
            };
        });

        const start = performance.now();
        let rafId = 0;
        let navigated = false;

        // Total timeline:
        //   0.0 – 2.0s  Phase 1: infall + black iris grows
        //   2.0 – 4.0s  Phase 2: 2s pause (full black, embers orbit)
        //   4.0 – 5.5s  Phase 3: blue pulse waves
        //   5.5s        Navigate

        const draw = (now: number) => {
            const elapsed = (now - start) / 1000;
            ctx.clearRect(0, 0, w, h);

            // ══════════════════════════════════════════════════════════
            // PHASE 1  (0 → 2s) — dark overlay + particles + iris
            // ══════════════════════════════════════════════════════════
            if (elapsed < 2) {
                const t = elapsed / 2;  // 0→1

                // Dark overlay fades in quickly
                const overlayAlpha = Math.min(1, t * 2.5) * 0.88;
                ctx.fillStyle = `rgba(2,4,10,${overlayAlpha})`;
                ctx.fillRect(0, 0, w, h);

                // Iris (pure-black circle) grows
                const maxIris = Math.max(w, h) * 0.55;
                const irisR = maxIris * easeIn(t);

                // Gravitational lens halo (ring outside iris)
                if (irisR > 4) {
                    const haloWidth = irisR * 0.18;
                    const hg = ctx.createRadialGradient(cx, cy, irisR - 2, cx, cy, irisR + haloWidth);
                    hg.addColorStop(0, `rgba(255,200,80,${0.9 - t * 0.4})`);
                    hg.addColorStop(0.4, `rgba(255,120,40,${0.5 - t * 0.2})`);
                    hg.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.beginPath(); ctx.arc(cx, cy, irisR + haloWidth, 0, Math.PI * 2);
                    ctx.fillStyle = hg; ctx.fill();
                }

                // Particles spiral inward
                const dt = 1 / 60;
                particles.forEach((p) => {
                    if (p.dist < 2) return;
                    // Increase speed as they get sucked in
                    const infallMult = 1 + (1 - p.dist / (Math.max(w, h) * 0.7)) * 4;
                    p.dist -= p.infall * infallMult * dt;
                    p.angle += p.speed * infallMult * dt;
                    p.x = cx + p.dist * Math.cos(p.angle);
                    p.y = cy + p.dist * Math.sin(p.angle);

                    // Stretch factor (tangential stretch as they near the iris)
                    const stretch = 1 + (1 - Math.min(1, p.dist / 200)) * 8;
                    const fadeAlpha = p.alpha * Math.min(1, p.dist / 40);

                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.angle + Math.PI / 2);  // tangent direction
                    ctx.scale(1, stretch);
                    ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${fadeAlpha})`;
                    ctx.fill();
                    ctx.restore();
                });

                // Draw iris on top (black)
                if (irisR > 0) {
                    ctx.beginPath(); ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
                    ctx.fillStyle = "#000"; ctx.fill();
                }
            }

            // ══════════════════════════════════════════════════════════
            // PHASE 2  (2s → 4s) — full black pause with ember orbit
            // ══════════════════════════════════════════════════════════
            if (elapsed >= 2 && elapsed < 4) {
                // Full black background
                ctx.fillStyle = "#000";
                ctx.fillRect(0, 0, w, h);

                const pEl = elapsed - 2;

                // Dim remnant accretion ring
                const ringR = Math.max(w, h) * 0.12;
                const rg = ctx.createRadialGradient(cx, cy, ringR * 0.7, cx, cy, ringR * 1.3);
                rg.addColorStop(0, "rgba(80,20,10,0)");
                rg.addColorStop(0.5, `rgba(120,40,10,${0.12 + Math.sin(pEl * 2) * 0.04})`);
                rg.addColorStop(1, "rgba(0,0,0,0)");
                ctx.beginPath(); ctx.arc(cx, cy, ringR * 1.3, 0, Math.PI * 2);
                ctx.fillStyle = rg; ctx.fill();

                // A few slow embers orbiting
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2 + pEl * 0.3;
                    const r = ringR * (0.9 + Math.sin(i * 1.7 + pEl) * 0.1);
                    const ex = cx + r * Math.cos(angle);
                    const ey = cy + r * Math.sin(angle);
                    ctx.beginPath(); ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(200,90,30,${0.25 + Math.sin(i + pEl * 2) * 0.1})`; ctx.fill();
                }

                // Event horizon (smallest remnant black circle)
                const horizonR = Math.max(w, h) * 0.08;
                ctx.beginPath(); ctx.arc(cx, cy, horizonR, 0, Math.PI * 2);
                ctx.fillStyle = "#000"; ctx.fill();
            }

            // ══════════════════════════════════════════════════════════
            // PHASE 3  (4s → 5.5s) — blue pulse waves
            // ══════════════════════════════════════════════════════════
            if (elapsed >= 4 && elapsed < 5.5) {
                ctx.fillStyle = "#000";
                ctx.fillRect(0, 0, w, h);

                const pEl = elapsed - 4;  // 0 → 1.5
                const maxR = Math.hypot(w, h) * 0.65;

                // Three staggered rings
                [0, 0.35, 0.7].forEach((delay, i) => {
                    const t = Math.max(0, pEl - delay);
                    if (t <= 0) return;
                    const progress = Math.min(1, t / 1.1);
                    const ringR = maxR * easeOut(progress);
                    const alpha = (1 - progress) * (0.7 - i * 0.15);
                    if (alpha <= 0.01) return;

                    const rg = ctx.createRadialGradient(cx, cy, ringR * 0.85, cx, cy, ringR);
                    rg.addColorStop(0, `rgba(0,200,212,0)`);
                    rg.addColorStop(0.6, `rgba(0,200,212,${alpha})`);
                    rg.addColorStop(1, `rgba(0,200,212,0)`);
                    ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
                    ctx.fillStyle = rg; ctx.fill();
                });

                // Central teal glow core
                const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 + pEl * 30);
                coreGlow.addColorStop(0, `rgba(0,220,230,${0.5 - pEl * 0.3})`);
                coreGlow.addColorStop(1, "rgba(0,0,0,0)");
                ctx.beginPath(); ctx.arc(cx, cy, 60 + pEl * 30, 0, Math.PI * 2);
                ctx.fillStyle = coreGlow; ctx.fill();
            }

            // ══════════════════════════════════════════════════════════
            // Navigate at 5.5 s
            // ══════════════════════════════════════════════════════════
            if (elapsed >= 5.5 && !navigated) {
                navigated = true;
                window.open(url, "_blank");
                onDone();
                return;
            }

            rafId = requestAnimationFrame(draw);
        };

        rafId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(rafId);
    }, [url, onDone]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                width: "100%",
                height: "100%",
                cursor: "none",
            }}
        />
    );
};

export default BlackholeTransition;
