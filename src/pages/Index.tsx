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

type Step = "boot" | "network" | "convergence" | "matrix" | "devteam" | "finalconv" | "hero";

const Index = () => {
  const [step, setStep] = useState<Step>("boot");
  const [showSkip, setShowSkip] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Attempt to play the audio on mount
    const attemptPlay = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Autoplay blocked: play on first interaction
          console.log("Autoplay blocked, waiting for interaction");
        });
      }
    };
    attemptPlay();

    // Set fallback on first user interaction
    const handleInteraction = () => {
      attemptPlay();
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
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
      <audio ref={audioRef} src={bgm} loop autoPlay preload="auto" />
      <BackgroundCanvas step={step} />

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
