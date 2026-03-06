import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Student Images
import thanushImg from "@/assets/development_team/Thanush Kumar.JPG";
import logeshImg from "@/assets/development_team/Logesh Kumar.JPG";
import kaviyaImg from "@/assets/development_team/Kaviya.jpg";
import srihariImg from "@/assets/development_team/Sri Hari Prasath.JPG";
import rishikeshImg from "@/assets/development_team/Rishi Kesh.JPG";
import preethiImg from "@/assets/development_team/Preethi.JPG";
import naveenImg from "@/assets/development_team/Naveen Bharathi.JPG";
import pandeeswaranImg from "@/assets/development_team/Pandeeswaran.JPG";
import akshayaImg from "@/assets/development_team/Akahaya Shri.JPG";
import athilImg from "@/assets/development_team/Ahamed Athil Khan.JPG";
import keerthanaImg from "@/assets/development_team/Keerthana.JPG";
import aashwinImg from "@/assets/development_team/Aashwin.JPG";
import sakthiImg from "@/assets/development_team/Sakthi Sundar.JPG";
import deebaImg from "@/assets/development_team/Deeba Dharshini.JPG";
import kanagaImg from "@/assets/development_team/Kanaga Duraga.JPG";
import pranavImg from "@/assets/development_team/15 Pranav.JPG";
import joshikaImg from "@/assets/development_team/33 Palasai Joshika.JPG";
import ravintharImg from "@/assets/development_team/38 Ravinthar.JPG";
import sachithImg from "@/assets/development_team/41 Sachithananthan.JPG";

// Staff Images
import vigneshImg from "@/assets/staff_team/Mr. L.S. Vignesh.jpg";
import prathapImg from "@/assets/staff_team/Mr. C. Prathap.JPG";
import archanaImg from "@/assets/staff_team/Mrs. R. Archana.JPG";
import udhayaImg from "@/assets/staff_team/Mr. R. UdhayaKumar.JPG";
import abiramiImg from "@/assets/staff_team/Ms. Abirami Kayathri.JPG";
import pavithraImg from "@/assets/staff_team/Mrs. R. Pavithra.JPG";
import saisuganyaImg from "@/assets/staff_team/Mrs. S. Sai Suganya.JPG";
import velkumarImg from "@/assets/staff_team/Mr. K. Velkumar.JPG";
import bhavaniImg from "@/assets/staff_team/Mrs. M. Bhavani.JPG";

// Special Thanks Images
import principalImg from "@/assets/spl_thanks/Mathalai Sundharam.JPG";
import vicePrincipalImg from "@/assets/spl_thanks/Sathya.jpg";
import secretaryImg from "@/assets/spl_thanks/Somasundharam.JPG";
import jointSecretaryImg from "@/assets/spl_thanks/Joint.JPG";
import vimalrajImg from "@/assets/spl_thanks/Vimalraj Kanagaraj.jpg";
import rengarajanImg from "@/assets/spl_thanks/Rengarajan Thiruvengadam.jpg";

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
      { name: "Thanush Kumar", role: "Developer", img: thanushImg },
      { name: "Logesh Kumar", role: "Developer", img: logeshImg },
      { name: "Kaviya", role: "Developer", img: kaviyaImg },
      { name: "Sri Hari Prasath", role: "Developer", img: srihariImg },
      { name: "Palasai Joshika", role: "Developer", img: joshikaImg },
    ],
  },
  {
    name: "Student Module",
    members: [
      { name: "Rishi Kesh", role: "Developer", img: rishikeshImg },
      { name: "Preethi", role: "Developer", img: preethiImg },
      { name: "Naveen Bharathi", role: "Developer", img: naveenImg },
    ],
  },
  {
    name: "Attendance & Leave Management Module",
    members: [
      { name: "Pandeeswaran", role: "Developer", img: pandeeswaranImg },
      { name: "Akshaya Shri", role: "Developer", img: akshayaImg },
      { name: "Ahamed Athil Khan", role: "Developer", img: athilImg },
      { name: "Keerthana", role: "Developer", img: keerthanaImg },
      { name: "Aashwin", role: "Developer", img: aashwinImg },
    ],
  },
  {
    name: "TimeTable Module",
    members: [
      { name: "Sakthi Sundar", role: "Developer", img: sakthiImg },
      { name: "Deeba Dharshini", role: "Developer", img: deebaImg },
      { name: "Kanaga Duraga", role: "Developer", img: kanagaImg },
      { name: "Ravinthar", role: "Developer", img: ravintharImg },
      { name: "Sachithananthan", role: "Developer", img: sachithImg },
      { name: "Pranav", role: "Developer", img: pranavImg },
    ],
  },
];

// Per-module timing (ms)
// Phase 1 – name + rule:       600
// Phase 2 – member cards:      1800
// Phase 3 – fade out + gap:    400
// Total per module:            2800
const MODULE_DURATION = 4000;
const MEMBERS_SHOW_DELAY = 600;

const DevTeamReveal = ({ onComplete }: DevTeamRevealProps) => {
  const [showHeading, setShowHeading] = useState(false);
  const [currentModule, setCurrentModule] = useState(-1);
  const [showMembers, setShowMembers] = useState(false);
  const [showSpecialThanks, setShowSpecialThanks] = useState(false);
  const [currentThanksIndex, setCurrentThanksIndex] = useState(-1);
  const [exiting, setExiting] = useState(false);

  const THANKS_DATA = [
    {
      title: "Industry Person",
      type: "staff",
      members: [
        { name: "Vimalraj Kanagaraj", role: "Principal Architect, NPCI, India", img: vimalrajImg },
        { name: "Rengarajan Thiruvengadam", role: "Director, TransUnion", img: rengarajanImg }
      ]
    },
    {
      title: "Secretary / Joint Secretary",
      type: "staff",
      members: [
        { name: "Somasundharam", role: "Secretary, NSCET", img: secretaryImg },
        { name: "Mr. T. Subramani", role: "Joint Secretary, NSCET", img: jointSecretaryImg }
      ]
    },
    {
      title: "Principal / Vice-Principal",
      type: "staff",
      members: [
        { name: "Mathalai Sundharam", role: "Principal, NSCET", img: principalImg },
        { name: "Sathya", role: "Vice-Principal, NSCET", img: vicePrincipalImg }
      ]
    },
    {
      title: "Student Management & Overall Plan",
      type: "staff",
      members: [
        { name: "Mr. L.S. Vignesh", role: "Assigned Faculty", img: vigneshImg }
      ]
    },
    {
      title: "Faculty Management",
      type: "staff",
      members: [
        { name: "Mr. C. Prathap", role: "Assigned Faculty", img: prathapImg },
        { name: "Mrs. R. Archana", role: "Assigned Faculty", img: archanaImg }
      ]
    },
    {
      title: "Admin Module",
      type: "staff",
      members: [
        { name: "Mr. R. UdhayaKumar", role: "Assigned Faculty", img: udhayaImg },
      ]
    },
    {
      title: "Admin (Exam cell , IQAC) Module",
      type: "staff",
      members: [
        { name: "Ms. Abirami Kayathri", role: "Assigned Faculty", img: abiramiImg }
      ]
    },
    {
      title: "Time Table Management",
      type: "staff",
      members: [
        { name: "Mrs. R. Pavithra", role: "Assigned Faculty", img: pavithraImg },
        { name: "Mrs. S. Sai Suganya", role: "Assigned Faculty", img: saisuganyaImg }
      ]
    },
    {
      title: "Attendance & Leave Management Module",
      type: "staff",
      members: [
        { name: "Mr. K. Velkumar", role: "Assigned Faculty", img: velkumarImg },
        { name: "Mrs. M. Bhavani", role: "Assigned Faculty", img: bhavaniImg }
      ]
    }
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setShowHeading(true), 150);
    const t2 = setTimeout(() => setCurrentModule(0), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (currentModule < 0) return;

    if (currentModule >= MODULES.length) {
      if (!showSpecialThanks) {
        const t = setTimeout(() => {
          setShowSpecialThanks(true);
          setCurrentThanksIndex(0);
        }, 600);
        return () => clearTimeout(t);
      }
      return;
    }

    setShowMembers(false);
    const tMembers = setTimeout(() => setShowMembers(true), MEMBERS_SHOW_DELAY);
    const tNext = setTimeout(() => setCurrentModule((p) => p + 1), MODULE_DURATION);
    return () => { clearTimeout(tMembers); clearTimeout(tNext); };
  }, [currentModule, showSpecialThanks, onComplete]);

  useEffect(() => {
    if (currentThanksIndex < 0) return;

    if (currentThanksIndex >= THANKS_DATA.length) {
      const t = setTimeout(() => {
        setExiting(true);
        setTimeout(onComplete, 800);
      }, 1500);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setCurrentThanksIndex(p => p + 1);
    }, 4000); // Increased for better readability/visibility
    return () => clearTimeout(t);
  }, [currentThanksIndex, onComplete]);

  const mod = currentModule >= 0 && currentModule < MODULES.length ? MODULES[currentModule] : null;

  return (
    <motion.div
      className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Heading */}
      <AnimatePresence>
        {showHeading && !showSpecialThanks && (
          <motion.h2
            className="font-orbitron text-lg md:text-2xl tracking-[0.08em] mb-10"
            style={{ color: "rgba(220,235,240,0.95)", textShadow: "0 0 24px rgba(0,200,212,0.4)" }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            Development Team
          </motion.h2>
        )}
      </AnimatePresence>

      {/* Module content or Special Thanks */}
      <div className="relative flex flex-col items-center w-full max-w-4xl px-4" style={{ minHeight: 400 }}>
        <AnimatePresence mode="wait">
          {mod && !showSpecialThanks && (
            <motion.div
              key={`mod-${currentModule}`}
              className="flex flex-col items-center w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
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

              <motion.div
                className="h-px mt-2 mb-6"
                style={{ backgroundColor: "#e09a2a" }}
                initial={{ width: 0 }}
                animate={{ width: 200 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />

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
                        width: 140
                      }}
                      initial={{ opacity: 0, scale: 0.96, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08, ease: "easeInOut" }}
                    >
                      <div
                        className="rounded-xl overflow-hidden mb-3"
                        style={{ width: 90, height: 90, border: "1px solid rgba(0,200,212,0.25)" }}
                      >
                        <img
                          src={member.img}
                          alt={member.name}
                          className="w-full h-full object-cover object-top"
                          loading="eager"
                          // @ts-ignore
                          fetchpriority="high"
                        />
                      </div>
                      <p
                        className="font-orbitron tracking-[0.05em] text-center w-full truncate"
                        title={member.name}
                        style={{ color: "rgba(220,235,240,0.95)", fontSize: "0.75rem" }}
                      >
                        {member.name}
                      </p>
                      <p
                        className="font-space tracking-[0.08em] mt-0.5 text-center"
                        style={{ color: "rgba(180,205,215,0.55)", fontSize: "0.6rem" }}
                      >
                        {member.role}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {showSpecialThanks && currentThanksIndex >= 0 && currentThanksIndex < THANKS_DATA.length && (
            <motion.div
              key={`thanks-${currentThanksIndex}`}
              className="flex flex-col items-center w-full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2
                className="font-orbitron text-xl md:text-2xl tracking-[0.15em] mb-4"
                style={{ color: "#ff5c35", textShadow: "0 0 30px rgba(255,92,53,0.4)" }}
              >
                SPECIAL THANKS
              </motion.h2>

              <motion.div
                className="h-px bg-[#ff5c35] mb-8"
                initial={{ width: 0 }}
                animate={{ width: 250 }}
                transition={{ duration: 0.5 }}
              />

              <div className="flex flex-col items-center text-center w-full">
                <motion.h4
                  className="font-orbitron text-xs md:text-sm tracking-widest text-ev-yellow mb-8 uppercase opacity-80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {THANKS_DATA[currentThanksIndex].title}
                </motion.h4>
                <div className="flex gap-4 md:gap-8 justify-center flex-wrap">
                  {THANKS_DATA[currentThanksIndex].type === "staff" ? (
                    THANKS_DATA[currentThanksIndex].members?.map((member, i) => (
                      <motion.div
                        key={member.name}
                        className="flex flex-col items-center p-5 rounded-[14px]"
                        style={{
                          background: "#0f1520",
                          border: "1px solid rgba(255,92,53,0.2)",
                          boxShadow: "0 0 20px rgba(255,92,53,0.1)",
                          width: 180
                        }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <div
                          className="rounded-xl overflow-hidden mb-4"
                          style={{ width: 110, height: 110, border: "1px solid rgba(255,92,53,0.25)" }}
                        >
                          <img
                            src={member.img}
                            alt={member.name}
                            className="w-full h-full object-cover object-top"
                            loading="eager"
                            // @ts-ignore
                            fetchpriority="high"
                          />
                        </div>
                        <p
                          className="font-orbitron tracking-[0.05em] text-center"
                          style={{ color: "rgba(220,235,240,0.95)", fontSize: "0.85rem" }}
                        >
                          {member.name}
                        </p>
                        <p
                          className="font-space tracking-[0.08em] mt-1 text-center"
                          style={{ color: "rgba(180,205,215,0.6)", fontSize: "0.65rem", lineHeight: 1.3 }}
                        >
                          {member.role}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      {THANKS_DATA[currentThanksIndex].names?.map((name, i) => (
                        <motion.p
                          key={i}
                          className="font-space text-base md:text-xl text-ev-body/90 tracking-wide"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <span className="text-[#ff5c35] mr-3">→</span>
                          {name}
                        </motion.p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DevTeamReveal;
