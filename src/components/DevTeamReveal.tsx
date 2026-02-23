import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DevTeamRevealProps {
  onComplete: () => void;
}

interface Member {
  name: string;
  role: string;
  img: string;
}

interface Module {
  name: string;
  members: Member[];
}

const MODULES: Module[] = [
  {
    name: "Faculty Module",
    members: [
      { name: "Arjun Mehta", role: "Faculty Lead", img: "https://i.pravatar.cc/90?img=1" },
      { name: "Sneha Iyer", role: "Faculty Dev", img: "https://i.pravatar.cc/90?img=2" },
      { name: "Ravi Shankar", role: "Faculty Dev", img: "https://i.pravatar.cc/90?img=3" },
    ],
  },
  {
    name: "Student Module",
    members: [
      { name: "Priya Nair", role: "Student Lead", img: "https://i.pravatar.cc/90?img=4" },
      { name: "Jordan Kim", role: "Student Dev", img: "https://i.pravatar.cc/90?img=5" },
      { name: "Mei Chen", role: "Student Dev", img: "https://i.pravatar.cc/90?img=6" },
    ],
  },
  {
    name: "Attendance Module",
    members: [
      { name: "Siddharth Rao", role: "Attendance Lead", img: "https://i.pravatar.cc/90?img=7" },
      { name: "Omar Farouk", role: "Attendance Dev", img: "https://i.pravatar.cc/90?img=8" },
      { name: "Alex Reeves", role: "Attendance Dev", img: "https://i.pravatar.cc/90?img=9" },
    ],
  },
  {
    name: "TimeTable Module",
    members: [
      { name: "Kavya Reddy", role: "TimeTable Lead", img: "https://i.pravatar.cc/90?img=10" },
      { name: "Rohan Das", role: "TimeTable Dev", img: "https://i.pravatar.cc/90?img=11" },
      { name: "Aisha Patel", role: "TimeTable Dev", img: "https://i.pravatar.cc/90?img=12" },
    ],
  },
];

const MODULE_DURATION = 5700; // ms per module

const DevTeamReveal = ({ onComplete }: DevTeamRevealProps) => {
  const [showHeading, setShowHeading] = useState(false);
  const [currentModule, setCurrentModule] = useState(-1);
  const [showCards, setShowCards] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowHeading(true), 300);
    const t2 = setTimeout(() => setCurrentModule(0), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (currentModule < 0) return;
    if (currentModule >= MODULES.length) {
      const t = setTimeout(() => {
        setExiting(true);
        setTimeout(onComplete, 800);
      }, 1000);
      return () => clearTimeout(t);
    }

    setShowCards(false);
    // Show cards after module name holds (400ms entrance + 800ms hold)
    const tCards = setTimeout(() => setShowCards(true), 1200);
    // Advance to next module
    const tNext = setTimeout(() => setCurrentModule((p) => p + 1), MODULE_DURATION);
    return () => { clearTimeout(tCards); clearTimeout(tNext); };
  }, [currentModule, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-10 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.6 }}
    >
      {exiting && (
        <motion.div
          className="absolute inset-0"
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Static heading */}
      <AnimatePresence>
        {showHeading && (
          <motion.h2
            className="font-orbitron text-lg md:text-2xl tracking-[0.08em] mb-10"
            style={{ color: "white", textShadow: "0 0 20px rgba(214,184,90,0.4)" }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Development Team
          </motion.h2>
        )}
      </AnimatePresence>

      {/* Module reveal area */}
      <div className="relative flex flex-col items-center min-h-[280px] w-full max-w-2xl px-4">
        <AnimatePresence mode="wait">
          {currentModule >= 0 && currentModule < MODULES.length && (
            <motion.div
              key={currentModule}
              className="flex flex-col items-center w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Module name */}
              <motion.h3
                className="font-orbitron text-base md:text-xl tracking-[0.08em]"
                style={{
                  color: "rgba(214,184,90,1)",
                  textShadow: "0 0 20px rgba(214,184,90,0.5)",
                  fontSize: "clamp(1rem, 2vw, 1.4rem)",
                }}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {MODULES[currentModule].name}
              </motion.h3>

              {/* Gold underline */}
              <motion.div
                className="h-px mt-2 mb-6"
                style={{ backgroundColor: "var(--ev-gold)" }}
                initial={{ width: 0 }}
                animate={{ width: 200 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />

              {/* Member cards - appear together after delay */}
              {showCards && (
                <div className="flex gap-4 md:gap-6 justify-center flex-wrap">
                  {MODULES[currentModule].members.map((member, i) => (
                    <motion.div
                      key={member.name}
                      className="flex flex-col items-center p-4 rounded-[14px]"
                      style={{
                        background: "#1a1a1d",
                        border: "1px solid rgba(214,184,90,0.2)",
                      }}
                      initial={{ opacity: 0, scale: 0.96, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1, ease: "easeInOut" }}
                    >
                      <div
                        className="w-[72px] h-[72px] md:w-[90px] md:h-[90px] rounded-xl overflow-hidden mb-3"
                        style={{ border: "1px solid rgba(214,184,90,0.25)" }}
                      >
                        <img
                          src={member.img}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          loading="eager"
                        />
                      </div>
                      <p className="font-orbitron text-white text-[0.85rem] tracking-[0.05em]">
                        {member.name}
                      </p>
                      <p
                        className="font-space text-[0.75rem] tracking-[0.1em] mt-0.5"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        {member.role}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DevTeamReveal;
