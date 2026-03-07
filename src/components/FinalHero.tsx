import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import BlackholeTransition from "./BlackholeTransition";
import campusnexusLogo from "@/assets/campusnexus.png";

const ERP_PAGE = "http://192.168.30.60/login";

const FinalHero = () => {
  const [showBlackhole, setShowBlackhole] = useState(false);

  const handleClick = useCallback(() => {
    setShowBlackhole(true);
  }, []);

  const handleDone = useCallback(() => {
    setShowBlackhole(false);
  }, []);

  return (
    <>
      {showBlackhole && (
        <BlackholeTransition url={ERP_PAGE} onDone={handleDone} />
      )}

      <motion.div
        className="fixed inset-0 z-10 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src={campusnexusLogo}
          alt="Campus Nexus Logo"
          className="w-24 h-24 md:w-32 md:h-32 mb-6 object-contain"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            filter: "drop-shadow(0 0 30px rgba(155,26,26,0.5)) drop-shadow(0 0 15px rgba(0,200,212,0.3))"
          }}
        />
        <motion.h1
          className="font-orbitron font-bold tracking-[0.08em]"
          style={{
            fontSize: "clamp(2.2rem, 8vw, 5rem)",
            color: "rgba(220,235,240,0.97)",
            textShadow: "0 0 80px rgba(155,26,26,0.5), 0 0 40px rgba(0,200,212,0.25)",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          CAMPUS NEXUS
        </motion.h1>

        <motion.p
          className="font-space tracking-[0.15em] mt-4 text-center px-4"
          style={{
            color: "rgba(180,205,215,0.5)",
            fontSize: "clamp(0.7rem, 3.5vw, 1rem)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          The Centralized System of the College
        </motion.p>

        <motion.button
          onClick={handleClick}
          className="font-space mt-8 px-9 py-3.5 rounded-[10px] text-sm md:text-base tracking-[0.08em] cursor-pointer"
          style={{
            background: "transparent",
            border: "1.5px solid #00c8d4",
            color: "#00c8d4",
            transition: "all 200ms ease",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          whileHover={{
            backgroundColor: "#00c8d4",
            color: "#080b12",
            y: -2,
            scale: 1.02,
            boxShadow: "0 0 24px rgba(0,200,212,0.4)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          Go to Campus Nexus
        </motion.button>
      </motion.div>
    </>
  );
};

export default FinalHero;
