import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DevTeamRevealProps {
  onComplete: () => void;
}

const TEAM = [
  { name: "Alex Reeves", role: "Full Stack Lead", img: "https://i.pravatar.cc/120?img=1" },
  { name: "Priya Nair", role: "AI Integration", img: "https://i.pravatar.cc/120?img=2" },
  { name: "Jordan Kim", role: "Frontend Developer", img: "https://i.pravatar.cc/120?img=3" },
  { name: "Siddharth Rao", role: "Backend Engineer", img: "https://i.pravatar.cc/120?img=4" },
  { name: "Mei Chen", role: "UI/UX Design", img: "https://i.pravatar.cc/120?img=5" },
  { name: "Omar Farouk", role: "Infrastructure", img: "https://i.pravatar.cc/120?img=6" },
];

const DevTeamReveal = ({ onComplete }: DevTeamRevealProps) => {
  const [showHeading, setShowHeading] = useState(false);
  const [currentMember, setCurrentMember] = useState(-1);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Show heading
    const t1 = setTimeout(() => setShowHeading(true), 300);
    // Start showing members
    const t2 = setTimeout(() => setCurrentMember(0), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (currentMember < 0) return;
    if (currentMember >= TEAM.length) {
      const t = setTimeout(() => {
        setExiting(true);
        setTimeout(onComplete, 800);
      }, 1000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCurrentMember((p) => p + 1), 4500);
    return () => clearTimeout(t);
  }, [currentMember, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-10 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Darkening overlay on exit */}
      {exiting && (
        <motion.div
          className="absolute inset-0"
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Heading */}
      <AnimatePresence>
        {showHeading && (
          <motion.h2
            className="font-orbitron text-lg md:text-2xl tracking-[0.08em] mb-12"
            style={{
              color: "white",
              textShadow: "0 0 20px rgba(214,184,90,0.4)",
            }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Development Team
          </motion.h2>
        )}
      </AnimatePresence>

      {/* Team members */}
      <div className="relative h-52 w-72 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentMember >= 0 && currentMember < TEAM.length && (
            <motion.div
              key={currentMember}
              className="absolute flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {/* Avatar */}
              <div
                className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-2xl overflow-hidden bg-ev-card mb-4"
                style={{
                  border: "1px solid rgba(214,184,90,0.25)",
                  boxShadow: "0 0 16px rgba(214,184,90,0.2)",
                }}
              >
                <img
                  src={TEAM[currentMember].img}
                  alt={TEAM[currentMember].name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              {/* Name */}
              <motion.p
                className="font-orbitron text-sm md:text-base tracking-[0.05em]"
                style={{ color: "white" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              >
                {TEAM[currentMember].name}
              </motion.p>

              {/* Gold underline */}
              <motion.div
                className="h-px mt-1 mb-2"
                style={{ backgroundColor: "var(--ev-gold)" }}
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              />

              {/* Role */}
              <motion.p
                className="font-space text-xs md:text-sm tracking-[0.1em]"
                style={{ color: "rgba(255,255,255,0.5)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {TEAM[currentMember].role}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DevTeamReveal;
