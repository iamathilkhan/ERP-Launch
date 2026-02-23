import { motion } from "framer-motion";

const FinalHero = () => {
  return (
    <motion.div
      className="fixed inset-0 z-10 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1
        className="font-orbitron font-bold tracking-[0.08em]"
        style={{
          fontSize: "clamp(2.5rem, 6vw, 5rem)",
          color: "rgba(210,220,255,0.95)",
          textShadow: "0 0 60px rgba(121,12,12,0.5), 0 0 30px rgba(26,58,255,0.3)",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        EDUVERTEX
      </motion.h1>

      <motion.p
        className="font-space tracking-[0.15em] mt-4 text-center px-4"
        style={{
          color: "rgba(180,195,255,0.45)",
          fontSize: "clamp(0.75rem, 1.5vw, 1rem)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        The Centralized System of the College
      </motion.p>

      <motion.a
        href="#"
        className="font-space mt-8 px-9 py-3.5 rounded-[10px] text-sm md:text-base tracking-[0.08em] cursor-pointer"
        style={{
          background: "transparent",
          border: "1.5px solid #1a3aff",
          color: "#1a3aff",
          transition: "all 200ms ease",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        whileHover={{
          backgroundColor: "#1a3aff",
          color: "#ffffff",
          y: -2,
          scale: 1.02,
          boxShadow: "0 0 20px rgba(26,58,255,0.4)",
        }}
      >
        Go to Eduvertex
      </motion.a>
    </motion.div>
  );
};

export default FinalHero;
