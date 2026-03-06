import { useEffect, useRef } from "react";

// Video served directly from GitHub LFS edge cache to completely bypass Vercel's 100MB static asset limit and clone limits
const BG_VIDEO_URL = "https://github.com/iamathilkhan/ERP-Launch/raw/main/public/background.webm";

interface BackgroundCanvasProps {
  step: "boot" | "network" | "convergence" | "matrix" | "devteam" | "finalconv" | "hero";
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
}

const BackgroundCanvas = ({ step }: BackgroundCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── 3D Mouse Parallax Effect ───
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20; // max 20px tilt
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      containerRef.current.style.transform = `perspective(1000px) rotateX(${-y * 0.5}deg) rotateY(${x * 0.5}deg) scale(1.05)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ─── Canvas Particles Effect ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialise 60 particles with 3D depth (z)
    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 100, // Depth factor
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      opacity: 0.1 + Math.random() * 0.3,
      size: 1 + Math.random() * 3,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Deep glowing atmosphere overlay
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h));
      grad.addColorStop(0, "rgba(0,0,0,0.1)");
      grad.addColorStop(1, "rgba(0,12,24,0.7)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Floating grand particles
      for (const p of particlesRef.current) {
        // Perspective scaling based on Z
        const scale = 100 / (100 + p.z);
        const screenX = (p.x - w / 2) * scale + w / 2;
        const screenY = (p.y - h / 2) * scale + h / 2;
        const r = p.size * scale;

        p.x += p.vx;
        p.y += p.vy;
        p.z -= 0.1; // slowly drift forward
        if (p.z < 0) p.z = 100;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(screenX, screenY, r, 0, Math.PI * 2);

        // Slightly teal / amber particles
        const isTeal = p.z % 2 > 1;
        ctx.fillStyle = isTeal
          ? `rgba(0, 200, 212, ${p.opacity * scale})`
          : `rgba(224, 154, 42, ${p.opacity * scale})`;

        ctx.shadowBlur = 10;
        ctx.shadowColor = isTeal ? "#00c8d4" : "#e09a2a";
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black" style={{ zIndex: 0 }}>
      {/* 3D Moving Video Layer */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full origin-center transition-transform duration-300 ease-out"
      >
        <video
          src={BG_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.65, mixBlendMode: "screen", filter: "brightness(0.8) blur(1px)" }}
        />
      </div>

      {/* Canvas Particle Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Vignette Edge Darkening */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{
        boxShadow: "inset 0 0 150px rgba(0,0,0,0.9)",
      }} />
    </div>
  );
};

export default BackgroundCanvas;
