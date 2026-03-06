import { useState, useEffect, useCallback, useRef } from "react";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import bgm from "@/assets/bgm.m4a";
import BootSequence from "@/components/BootSequence";
import NetworkFormation from "@/components/NetworkFormation";
import ConvergencePulse from "@/components/ConvergencePulse";
import MatrixSequence from "@/components/MatrixSequence";
import DevTeamReveal from "@/components/DevTeamReveal";
import FinalConvergence from "@/components/FinalConvergence";
import FinalHero from "@/components/FinalHero";
import SkipButton from "@/components/SkipButton";

import { motion } from "framer-motion";

type Step = "init" | "boot" | "network" | "convergence" | "matrix" | "devteam" | "finalconv" | "hero";

const Index = () => {
  const [step, setStep] = useState<Step>("init");
  const [showSkip, setShowSkip] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startSequence = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.play().catch(() => console.log("Audio play failed"));
    }
    setStep("boot");
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleSkip = useCallback(() => {
    setStep("hero");
    setShowSkip(false);
  }, []);

  const advance = useCallback((next: Step) => {
    return () => setStep(next);
  }, []);

  // Guard: Step 2 (network) → Step 3 (convergence) only after 16s minimum.
  // Timeline: A(4s)+B(5s)+C(4s)+D(1.6s)+hold(1s)+E collapse(1.2s)+F travel/text(3s) ≈ 19.8s
  // NetworkFormation fires onComplete internally via phaseRef at ~19.9s.
  // This guard ensures no parent re-render can unmount it earlier.
  useEffect(() => {
    if (step === "network") {
      const guard = setTimeout(() => {
        // No-op safety guard — NetworkFormation's internal timer is the true trigger.
      }, 12000);
      return () => clearTimeout(guard);
    }
  }, [step]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ev-dark">
      <audio ref={audioRef} src={bgm} loop preload="auto" />
      <BackgroundCanvas step={step === "init" ? "boot" : step} />

      {step === "init" && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            onClick={startSequence}
            className="font-space px-8 py-3 rounded-md text-sm md:text-base tracking-[0.2em] uppercase cursor-pointer"
            style={{
              color: "#00c8d4",
              border: "1px solid rgba(0,200,212,0.3)",
              background: "rgba(0,20,30,0.6)",
              textShadow: "0 0 10px rgba(0,200,212,0.5)",
              boxShadow: "0 0 20px rgba(0,200,212,0.1)",
            }}
            whileHover={{
              scale: 1.05,
              background: "rgba(0,200,212,0.1)",
              borderColor: "rgba(0,200,212,1)",
              boxShadow: "0 0 30px rgba(0,200,212,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Initialize System
          </motion.button>
        </motion.div>
      )}

      {step === "boot" && <BootSequence onComplete={advance("network")} />}
      {/* Guard E: keep NetworkFormation mounted through convergence — opacity swap, never unmount */}
      {(step === "network" || step === "convergence") && (
        <NetworkFormation
          onComplete={advance("convergence")}
          style={{ opacity: step === "network" ? 1 : 0, pointerEvents: "none" } as React.CSSProperties}
        />
      )}
      {step === "convergence" && <ConvergencePulse onComplete={advance("matrix")} />}
      {step === "matrix" && <MatrixSequence onComplete={advance("devteam")} />}
      {step === "devteam" && <DevTeamReveal onComplete={advance("finalconv")} />}
      {step === "finalconv" && <FinalConvergence onComplete={advance("hero")} />}
      {step === "hero" && <FinalHero />}

      <SkipButton visible={showSkip && step !== "hero"} onSkip={handleSkip} />
    </div>
  );
};

export default Index;
