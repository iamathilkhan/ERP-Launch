import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const LINES = [
  "Initializing Eduvertex Core...",
  "Establishing Campus Network...",
  "Authenticating Academic Nodes...",
  "Loading Institutional Data Layer...",
  "System Ready. Awaiting Authorization...",
];

// One typo per line: [charIndex, wrongChar]
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

  // Cursor blink
  useEffect(() => {
    const iv = setInterval(() => setShowCursor((p) => !p), 530);
    return () => clearInterval(iv);
  }, []);

  // Typing engine
  useEffect(() => {
    if (currentLine >= LINES.length) {
      // All done, wait then exit
      timeoutRef.current = setTimeout(() => setExiting(true), 800);
      return;
    }

    const line = LINES[currentLine];
    const [typoIdx, typoChar] = TYPOS[currentLine];

    if (currentChar <= line.length) {
      // Check typo
      if (currentChar === typoIdx && typoStateRef.current === "none") {
        // Type wrong char
        typoStateRef.current = "typed";
        setDisplayLines((prev) => {
          const next = [...prev];
          next[currentLine] = line.slice(0, currentChar) + typoChar;
          return next;
        });
        timeoutRef.current = setTimeout(() => {
          typoStateRef.current = "paused";
          // Backspace
          timeoutRef.current = setTimeout(() => {
            setDisplayLines((prev) => {
              const next = [...prev];
              next[currentLine] = line.slice(0, currentChar);
              return next;
            });
            typoStateRef.current = "backspaced";
            // Now type correct char
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

      // Normal typing
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
      // Line complete - flicker
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

  // Init first line
  useEffect(() => {
    setDisplayLines([""]);
  }, []);

  // Exit animation complete
  useEffect(() => {
    if (exiting) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
  }, [exiting, onComplete]);

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

          return (
            <motion.div
              key={i}
              className="font-orbitron tracking-[0.08em] mb-2"
              style={{
                fontSize: "clamp(0.75rem, 1.5vw, 1rem)",
                color: isFinal
                  ? "rgba(255,255,255,0.75)"
                  : isActive
                  ? "rgba(255,255,255,0.75)"
                  : "rgba(255,255,255,0.35)",
                opacity: isFlickering ? 0.4 : 1,
              }}
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
              {text}
              {isActive && !isComplete && (
                <span
                  style={{
                    opacity: showCursor ? 1 : 0,
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  |
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BootSequence;
