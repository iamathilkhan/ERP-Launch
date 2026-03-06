import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import campusnexusLogo from "@/assets/campusnexus.png";
import "./CurtainLaunch.css";

interface CurtainLaunchProps {
  onComplete: () => void;
  onStart?: () => void;
}

const CurtainLaunch = ({ onComplete, onStart }: CurtainLaunchProps) => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  const unveil = () => {
    if (isLaunched) return;
    
    // Trigger onStart immediately (to start audio/logic)
    if (onStart) onStart();
    
    // 40ms delay before adding launched class
    setTimeout(() => {
      setIsLaunched(true);
    }, 40);

    // 5s animation duration + 70ms cleanup
    setTimeout(() => {
      setShouldRender(false);
      onComplete();
    }, 5070);
  };

  useEffect(() => {
    // Escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") unveil();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLaunched]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`collector-launch-overlay ${isLaunched ? "launched" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="curtain-title"
    >
      <div className="curtain-stage">
        <div className="curtain left" />
        <div className="curtain right" />
      </div>

      <div className="curtain-content">
        <h1 id="curtain-title" className="sr-only">System Launch</h1>
        
        <motion.img
          src={campusnexusLogo}
          alt="Campus Nexus Logo"
          className="w-32 h-32 md:w-48 md:h-48 mb-12 object-contain mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: "drop-shadow(0 0 20px rgba(0,200,212,0.4))"
          }}
        />

        <button 
          onClick={unveil}
          className="font-orbitron px-10 py-5 rounded-sm text-sm md:text-lg tracking-[0.3em] uppercase transition-all duration-300"
          style={{
            color: "#ffd700",
            border: "2px solid rgba(255, 215, 0, 0.4)",
            background: "rgba(0, 0, 0, 0.7)",
            textShadow: "0 0 15px rgba(255, 215, 0, 0.5)",
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.1)",
            cursor: "pointer",
            position: "relative",
            zIndex: 100
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.8)";
            e.currentTarget.style.boxShadow = "0 0 40px rgba(255, 215, 0, 0.3)";
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.4)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 0, 0, 0.8)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Initiate System & Begin Presentation
        </button>
        <p 
          className="font-space mt-6 text-xs tracking-[0.2em] uppercase opacity-60"
          style={{ color: "#ffd700", cursor: "pointer" }}
          onClick={unveil}
        >
          Click or Press ESC to unveil
        </p>
      </div>
    </div>
  );
};

export default CurtainLaunch;
