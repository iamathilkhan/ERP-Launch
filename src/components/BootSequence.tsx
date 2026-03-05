import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const LINES = [
  "Initializing Eduvertex Core...",
  "Establishing Campus Network...",
  "Authenticating Academic Nodes...",
  "Loading Institutional Data Layer...",
  "System Ready. Awaiting Authorization...",
];

const TYPOS: [number, string][] = [
  [14, "x"],
  [15, "s"],
  [17, "g"],
  [10, "z"],
  [8, "e"],
];

interface BootSequenceProps {
  onComplete: () => void;
}

const BootSequence = ({ onComplete }: BootSequenceProps) => {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [lineComplete, setLineComplete] = useState<boolean[]>([]);
  const [flickering, setFlickering] = useState(-1);
  const [exiting, setExiting] = useState(false);
  const typoStateRef = useRef<"none" | "typed" | "paused" | "backspaced">("none");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const iv = setInterval(() => setShowCursor((p) => !p), 530);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (currentLine >= LINES.length) {
      timeoutRef.current = setTimeout(() => setExiting(true), 800);
      return;
    }

    const line = LINES[currentLine];
    const [typoIdx, typoChar] = TYPOS[currentLine];

    if (currentChar <= line.length) {
      if (currentChar === typoIdx && typoStateRef.current === "none") {
        typoStateRef.current = "typed";
        setDisplayLines((prev) => {
          const next = [...prev];
          next[currentLine] = line.slice(0, currentChar) + typoChar;
          return next;
        });
        timeoutRef.current = setTimeout(() => {
          typoStateRef.current = "paused";
          timeoutRef.current = setTimeout(() => {
            setDisplayLines((prev) => {
              const next = [...prev];
              next[currentLine] = line.slice(0, currentChar);
              return next;
            });
            typoStateRef.current = "backspaced";
            timeoutRef.current = setTimeout(() => {
              typoStateRef.current = "none";
              setDisplayLines((prev) => {
                const next = [...prev];
                next[currentLine] = line.slice(0, currentChar + 1);
                return next;
              });
              setCurrentChar(currentChar + 1);
            }, 45);
          }, 200);
        }, 200);
        return;
      }

      const isSpace = line[currentChar - 1] === " ";
      const delay = isSpace ? 120 + Math.random() * 80 : 35 + Math.random() * 20;

      timeoutRef.current = setTimeout(() => {
        setDisplayLines((prev) => {
          const next = [...prev];
          next[currentLine] = line.slice(0, currentChar + 1);
          return next;
        });
        setCurrentChar(currentChar + 1);
      }, delay);
    } else {
      setFlickering(currentLine);
      timeoutRef.current = setTimeout(() => {
        setFlickering(-1);
        setLineComplete((prev) => [...prev, true]);
        timeoutRef.current = setTimeout(() => {
          setCurrentLine(currentLine + 1);
          setCurrentChar(0);
          typoStateRef.current = "none";
          setDisplayLines((prev) => [...prev, ""]);
        }, 400);
      }, 300);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [currentLine, currentChar]);

  useEffect(() => {
    setDisplayLines([""]);
  }, []);

  useEffect(() => {
    if (exiting) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
  }, [exiting, onComplete]);

  // Compute per-line progress: ratio of chars typed vs line length
  const lineProgress = (i: number): number => {
    if (lineComplete[i]) return 1;
    if (i > currentLine) return 0;
    if (i < currentLine) return 1;
    // active line
    const lineLen = LINES[i]?.length ?? 1;
    return Math.min(1, currentChar / lineLen);
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 1 }}
      animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl w-full px-6">
        {displayLines.map((text, i) => {
          const isActive = i === currentLine && !exiting;
          const isComplete = lineComplete[i];
          const isFinal = i === LINES.length - 1 && isComplete;
          const isFlickering = flickering === i;
          const progress = lineProgress(i);

          return (
            <motion.div
              key={i}
              className="mb-3"
              initial={{ opacity: 0 }}
              animate={{
                opacity: exiting ? 0 : isFlickering ? 0.4 : 1,
              }}
              transition={{
                opacity: {
                  duration: exiting ? 0.3 : 0.15,
                  delay: exiting ? i * 0.1 : 0,
                },
              }}
            >
              {/* Line text */}
              <div
                className="font-orbitron tracking-[0.08em] mb-1.5"
                style={{
                  fontSize: "clamp(0.65rem, 3.5vw, 1rem)",
                  color: isFinal
                    ? "rgba(220,235,240,0.9)"
                    : isActive
                      ? "rgba(220,235,240,0.9)"
                      : "rgba(180,205,215,0.35)",
                  opacity: isFlickering ? 0.4 : 1,
                }}
              >
                {text}
                {isActive && !isComplete && (
                  <span
                    style={{
                      opacity: showCursor ? 1 : 0,
                      color: "#00c8d4",
                    }}
                  >
                    |
                  </span>
                )}
              </div>

              {/* Progress bar — only shown if line has appeared */}
              {text.length > 0 && (
                <div
                  style={{
                    position: "relative",
                    height: "2px",
                    width: "100%",
                    background: "rgba(0,200,212,0.10)",
                    borderRadius: "1px",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      borderRadius: "1px",
                      background: isComplete
                        ? "rgba(0,200,212,0.75)"
                        : "rgba(0,200,212,0.55)",
                      boxShadow: isComplete
                        ? "0 0 6px rgba(0,200,212,0.6)"
                        : "0 0 4px rgba(0,200,212,0.35)",
                    }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.round(progress * 100)}%` }}
                    transition={{ duration: 0.12, ease: "linear" }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BootSequence;
