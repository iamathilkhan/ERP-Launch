import { motion, AnimatePresence } from "framer-motion";

interface SkipButtonProps {
  visible: boolean;
  onSkip: () => void;
}

const SkipButton = ({ visible, onSkip }: SkipButtonProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={onSkip}
          className="fixed bottom-8 right-8 z-50 font-space px-6 py-2.5 rounded-full text-xs md:text-sm tracking-[0.2em] uppercase cursor-pointer"
          style={{
            color: "rgba(180,205,215,0.6)",
            border: "1px solid rgba(180,205,215,0.2)",
            background: "rgba(15,21,32,0.6)",
            backdropFilter: "blur(4px)",
            transition: "all 0.3s ease",
          }}
          whileHover={{
            borderColor: "rgba(0,200,212,0.5)",
            color: "#00c8d4",
            background: "rgba(0,200,212,0.05)",
            boxShadow: "0 0 20px rgba(0,200,212,0.15)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          Skip Intro
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default SkipButton;
