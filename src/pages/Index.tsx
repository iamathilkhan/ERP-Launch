import { useState, useEffect, useCallback } from "react";
import BackgroundCanvas from "@/components/BackgroundCanvas";
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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ev-dark">
      <BackgroundCanvas />

      {step === "boot" && <BootSequence onComplete={advance("network")} />}
      {step === "network" && <NetworkFormation onComplete={advance("convergence")} />}
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
