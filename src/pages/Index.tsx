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
import campusnexusLogo from "@/assets/campusnexus.png";
import { motion } from "framer-motion";

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
    // Preload all team/staff images proactively with high priority
    ASSETS_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      // @ts-ignore - fetchPriority is an experimental feature in some environments
      img.fetchPriority = "high";
      img.src = src;
    });

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
      <BackgroundCanvas step={step === "init" ? "boot" : step} />

      {step === "init" && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.img
            src={campusnexusLogo}
            alt="Campus Nexus Logo"
            className="w-32 h-32 md:w-48 md:h-48 mb-8 object-contain"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 1.2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            style={{
              filter: "drop-shadow(0 0 20px rgba(0,200,212,0.4))"
            }}
          />
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
