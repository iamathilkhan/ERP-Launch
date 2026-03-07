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
import CurtainLaunch from "@/components/CurtainLaunch";
import campusnexusLogo from "@/assets/campusnexus.png";
import batmanLogo from "@/assets/batman logo.png";
import loaderVideo from "@/assets/loader.mp4";
import { motion, AnimatePresence } from "framer-motion";

// Import all images for preloading
import thanushImg from "@/assets/development_team/Thanush Kumar.jpg";
import logeshImg from "@/assets/development_team/Logesh Kumar.jpg";
import kaviyaImg from "@/assets/development_team/Kaviya.jpg";
import srihariImg from "@/assets/development_team/Sri Hari Prasath.jpg";
import rishikeshImg from "@/assets/development_team/Rishi Kesh.jpg";
import preethiImg from "@/assets/development_team/Preethi.jpg";
import naveenImg from "@/assets/development_team/Naveen Bharathi.jpg";
import pandeeswaranImg from "@/assets/development_team/Pandeeswaran.jpg";
import akshayaImg from "@/assets/development_team/Akahaya Shri.jpg";
import athilImg from "@/assets/development_team/Ahamed Athil Khan.jpg";
import keerthanaImg from "@/assets/development_team/Keerthana.jpg";
import aashwinImg from "@/assets/development_team/Aashwin.jpg";
import sakthiImg from "@/assets/development_team/Sakthi Sundar.jpg";
import deebaImg from "@/assets/development_team/Deeba Dharshini.jpg";
import kanagaImg from "@/assets/development_team/Kanaga Duraga.jpg";
import pranavImg from "@/assets/development_team/15 Pranav.jpg";
import joshikaImg from "@/assets/development_team/33 Palasai Joshika.jpg";
import ravintharImg from "@/assets/development_team/38 Ravinthar.jpg";
import sachithImg from "@/assets/development_team/41 Sachithananthan.jpg";

import staff1 from "@/assets/staff_team/Mr. L.S. Vignesh.jpg";
import staff2 from "@/assets/staff_team/Mr. C. Prathap.jpg";
import staff3 from "@/assets/staff_team/Mrs. R. Archana.jpg";
import staff4 from "@/assets/staff_team/Mr. R. UdhayaKumar.jpg";
import staff5 from "@/assets/staff_team/Ms. Abirami Kayathri.jpg";
import staff6 from "@/assets/staff_team/Mrs. R. Pavithra.jpg";
import staff7 from "@/assets/staff_team/Mrs. S. Sai Suganya.jpg";
import staff8 from "@/assets/staff_team/Mr. K. Velkumar.jpg";
import staff9 from "@/assets/staff_team/Mrs. M. Bhavani.jpg";

import principalImg from "@/assets/spl_thanks/Mathalai Sundharam.jpg";
import vicePrincipalImg from "@/assets/spl_thanks/Sathya.jpg";
import secretaryImg from "@/assets/spl_thanks/Somasundharam.jpg";
import jointSecretaryImg from "@/assets/spl_thanks/Joint.jpg";

const ASSETS_TO_PRELOAD = [
  thanushImg, logeshImg, kaviyaImg, srihariImg, rishikeshImg, preethiImg, naveenImg,
  pandeeswaranImg, akshayaImg, athilImg, keerthanaImg, aashwinImg, sakthiImg,
  deebaImg, kanagaImg, pranavImg, joshikaImg, ravintharImg, sachithImg,
  staff1, staff2, staff3, staff4, staff5, staff6, staff7, staff8, staff9,
  principalImg, vicePrincipalImg, secretaryImg, jointSecretaryImg
];

type Step = "curtain" | "loader" | "boot" | "network" | "convergence" | "matrix" | "devteam" | "finalconv" | "hero";

const Index = () => {
  const [step, setStep] = useState<Step>("curtain");
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleCurtainStart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.play().catch(() => console.log("Audio play failed"));
    }
  }, []);

  const handleCurtainComplete = useCallback(() => {
    // Fallback: If the curtains are fully open, we MUST proceed to the boot sequence
    // even if the loader video hasn't finished yet or failed to play.
    setStep("boot");
  }, []);

  const handleUnveil = useCallback(() => {
    setStep("loader");
  }, []);

  useEffect(() => {
    // Preload all team/staff images proactively with high priority
    ASSETS_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      // @ts-ignore - fetchPriority is an experimental feature in some environments
      img.fetchPriority = "high";
      img.src = src;
    });
  }, []);

  const advance = useCallback((next: Step) => {
    return () => setStep(next);
  }, []);

  useEffect(() => {
    if (step === "network") {
      const guard = setTimeout(() => {
      }, 12000);
      return () => clearTimeout(guard);
    }
  }, [step]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ev-dark">
      <audio ref={audioRef} src={bgm} loop preload="auto" />
      <BackgroundCanvas step={step === "curtain" || step === "loader" ? "boot" : step} />

      <AnimatePresence mode="wait">
        {(step === "curtain" || step === "loader") && (
          <motion.div
            key="launch-layer"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100]"
          >
            {/* The loader plays behind the curtains */}
            {step === "loader" && (
              <div className="fixed inset-0 z-0 bg-black flex items-center justify-center">
                <video
                  src={loaderVideo}
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => setStep("boot")}
                  onError={() => setStep("boot")}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CurtainLaunch 
              onStart={handleCurtainStart}
              onUnveil={handleUnveil}
              onComplete={handleCurtainComplete} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "boot" && (
          <motion.div
            key="boot-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BootSequence onComplete={advance("network")} />
          </motion.div>
        )}
      </AnimatePresence>
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

      {step !== "curtain" && (
        <motion.div 
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none px-6 py-6 flex justify-between items-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img 
            src={campusnexusLogo} 
            alt="Campus Nexus" 
            className="w-12 h-12 md:w-16 md:h-16 object-contain opacity-80"
            style={{ filter: "drop-shadow(0 0 10px rgba(0,200,212,0.3))" }}
          />
          <img 
            src={batmanLogo} 
            alt="Nexus Ops" 
            className="w-12 h-12 md:w-16 md:h-16 object-contain opacity-80"
            style={{ filter: "drop-shadow(0 0 10px rgba(155,26,26,0.3))" }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default Index;
