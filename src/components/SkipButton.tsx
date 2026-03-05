import { motion } from "framer-motion";

interface SkipButtonProps {
  visible: boolean;
  onSkip: () => void;
}

const SkipButton = ({ visible, onSkip }: SkipButtonProps) => {
  if (!visible) return null;

  return (
    <motion.button
      onClick={onSkip}
      className="fixed top-6 right-6 z-50 font-space text-xs md:text-sm cursor-pointer"
      style={{
        color: "rgba(180,205,215,0.45)",
        background: "none",
        border: "none",
        letterSpacing: "0.05em",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ color: "rgba(210,220,255,0.8)" }}
    >
      Skip →
    </motion.button>
  );
};

export default SkipButton;
