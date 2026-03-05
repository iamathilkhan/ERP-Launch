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
      { name: "Sneha Iyer", role: "Frontend Dev", img: "https://i.pravatar.cc/90?img=2" },
      { name: "Ravi Shankar", role: "Backend Dev", img: "https://i.pravatar.cc/90?img=3" },
      { name: "Divya Pillai", role: "QA Engineer", img: "https://i.pravatar.cc/90?img=4" },
    ],
  },
  {
    name: "Student Module",
    members: [
      { name: "Jordan Kim", role: "Frontend Dev", img: "https://i.pravatar.cc/90?img=6" },
      { name: "Mei Chen", role: "Backend Dev", img: "https://i.pravatar.cc/90?img=7" },
      { name: "Karan Verma", role: "QA Engineer", img: "https://i.pravatar.cc/90?img=8" },
    ],
  },
  {
    name: "Attendance Module",
    members: [
      { name: "Omar Farouk", role: "Frontend Dev", img: "https://i.pravatar.cc/90?img=10" },
      { name: "Alex Reeves", role: "Backend Dev", img: "https://i.pravatar.cc/90?img=11" },
      { name: "Nisha Patel", role: "QA Engineer", img: "https://i.pravatar.cc/90?img=12" },
    ],
  },
  {
    name: "TimeTable Module",
    members: [
      { name: "Rohan Das", role: "Frontend Dev", img: "https://i.pravatar.cc/90?img=14" },
      { name: "Aisha Patel", role: "Backend Dev", img: "https://i.pravatar.cc/90?img=15" },
      { name: "Suresh Kumar", role: "QA Engineer", img: "https://i.pravatar.cc/90?img=16" },
    ],
  },
  {
    name: "Admin Module",
    members: [
      { name: "Fatima Zahra", role: "Frontend Dev", img: "https://i.pravatar.cc/90?img=18" },
      { name: "Lucas Ferreira", role: "Backend Dev", img: "https://i.pravatar.cc/90?img=19" },
      { name: "Anjali Singh", role: "QA Engineer", img: "https://i.pravatar.cc/90?img=20" },
    ],
  },
];

// Per-module timing (ms)
// Phase 1 – name + rule:       1300
// Phase 2 – member cards:      2800  (enter 400ms + hold 2400ms)
// Phase 3 – fade out + gap:    1000
// Total per module:            5100
const MODULE_DURATION = 5100;
const MEMBERS_SHOW_DELAY = 1300;

const DevTeamReveal = ({ onComplete }: DevTeamRevealProps) => {
  const [showHeading, setShowHeading] = useState(false);
  const [currentModule, setCurrentModule] = useState(-1);
  const [showMembers, setShowMembers] = useState(false);
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
      }, 600);
      return () => clearTimeout(t);
    }

    setShowMembers(false);
    const tMembers = setTimeout(() => setShowMembers(true), MEMBERS_SHOW_DELAY);
    const tNext = setTimeout(() => setCurrentModule((p) => p + 1), MODULE_DURATION);
    return () => { clearTimeout(tMembers); clearTimeout(tNext); };
  }, [currentModule, onComplete]);

  const mod = currentModule >= 0 && currentModule < MODULES.length ? MODULES[currentModule] : null;

  return (
    <motion.div
      className="fixed inset-0 z-10 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Heading */}
      <AnimatePresence>
        {showHeading && (
          <motion.h2
            className="font-orbitron text-lg md:text-2xl tracking-[0.08em] mb-10"
            style={{ color: "rgba(220,235,240,0.95)", textShadow: "0 0 24px rgba(0,200,212,0.4)" }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Development Team
          </motion.h2>
        )}
      </AnimatePresence>

      {/* Module content */}
      <div className="relative flex flex-col items-center w-full max-w-2xl px-4" style={{ minHeight: 200 }}>
        <AnimatePresence mode="wait">
          {mod && (
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
                className="font-orbitron tracking-[0.08em]"
                style={{
                  color: "#e09a2a",
                  textShadow: "0 0 20px rgba(224,154,42,0.45)",
                  fontSize: "clamp(0.9rem, 4.5vw, 1.4rem)",
                }}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {mod.name}
              </motion.h3>

              {/* Amber rule */}
              <motion.div
                className="h-px mt-2 mb-6"
                style={{ backgroundColor: "#e09a2a" }}
                initial={{ width: 0 }}
                animate={{ width: 200 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />

              {/* Member cards */}
              {showMembers && (
                <div className="flex gap-3 md:gap-5 justify-center flex-wrap">
                  {mod.members.map((member, i) => (
                    <motion.div
                      key={member.name}
                      className="flex flex-col items-center p-4 rounded-[14px]"
                      style={{
                        background: "#0f1520",
                        border: "1px solid rgba(0,200,212,0.2)",
                        boxShadow: "0 0 16px rgba(0,200,212,0.15)",
                      }}
                      initial={{ opacity: 0, scale: 0.96, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08, ease: "easeInOut" }}
                    >
                      <div
                        className="rounded-xl overflow-hidden mb-3"
                        style={{ width: 90, height: 90, border: "1px solid rgba(0,200,212,0.25)" }}
                      >
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover" loading="eager" />
                      </div>
                      <p
                        className="font-orbitron tracking-[0.05em] text-center"
                        style={{ color: "rgba(220,235,240,0.95)", fontSize: "0.85rem" }}
                      >
                        {member.name}
                      </p>
                      <p
                        className="font-space tracking-[0.08em] mt-0.5 text-center"
                        style={{ color: "rgba(180,205,215,0.55)", fontSize: "0.7rem" }}
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
