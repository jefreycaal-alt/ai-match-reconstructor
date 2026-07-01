import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import MatchCard from "./MatchCard";

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | kicking | loading | ready | error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const ballControls = useAnimation();

  // gentle idle bob while waiting for a click
  useEffect(() => {
    if (status === "idle") {
      ballControls.start({
        rotate: [0, 6, -6, 0],
        y: [0, -8, 0],
        transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
      });
    }
  }, [status, ballControls]);

  const kickOff = useCallback(async () => {
    if (status !== "idle") return;
    setStatus("kicking");

    // impact squash
    await ballControls.start({
      scaleX: 1.18,
      scaleY: 0.82,
      transition: { duration: 0.09, ease: "easeOut" },
    });

    // roll away: fast spin + arc off-screen
    await ballControls.start({
      scaleX: 1,
      scaleY: 1,
      rotate: 1080,
      x: 260,
      y: -140,
      opacity: 0,
      transition: { duration: 0.65, ease: [0.36, 0, 0.66, -0.56] },
    });

    setStatus("loading");

    try {
      const res = await fetch("http://localhost:8000/timeline");
      if (!res.ok) throw new Error("bad response");
      const json = await res.json();
      setData(json);
      setStatus("ready");
    } catch (e) {
      setError("Failed to load timeline. Is the backend running on :8000?");
      setStatus("error");
    }
  }, [status, ballControls]);

  const retry = () => {
    setError(null);
    ballControls.set({ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 });
    setStatus("idle");
  };

  if (status === "ready" && data) {
    return <CardDeck data={data} />;
  }

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1120] text-[#F5F1E8] relative overflow-hidden px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(79,70,229,0.25), transparent 60%)",
        }}
      />

      <span className="relative text-xs tracking-[0.3em] uppercase text-indigo-300/80 mb-4">
        2022 FIFA World Cup Final · AI Recap
      </span>

      <h1 className="relative text-6xl sm:text-7xl font-black tracking-tighter uppercase mb-4 text-center">
        Relive The Match
      </h1>

      <p className="relative text-[#F5F1E8]/70 max-w-md text-center mb-12">
        Missed Argentina vs France? Kick the ball and get the IBM
        Granite-generated recap in under 3 minutes.
      </p>

      <motion.button
        type="button"
        onClick={kickOff}
        disabled={status !== "idle"}
        animate={ballControls}
        whileHover={status === "idle" ? { scale: 1.05 } : {}}
        whileTap={status === "idle" ? { scale: 0.95 } : {}}
        className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full disabled:cursor-default cursor-pointer"
        aria-label="Kick off and reconstruct the match"
      >
        <Ball />
      </motion.button>

      <AnimatePresence>
        {(status === "kicking" || status === "loading") && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative mt-10 text-sm tracking-wide text-indigo-300"
          >
            {status === "kicking" ? "Kicking off…" : "Generating with IBM Granite…"}
          </motion.p>
        )}
      </AnimatePresence>

      {status !== "kicking" && status !== "loading" && status !== "error" && (
        <span className="relative mt-10 text-xs uppercase tracking-widest text-[#F5F1E8]/40">
          Click the ball to kick off ↓
        </span>
      )}

      {status === "error" && (
        <div className="relative mt-6 flex flex-col items-center gap-3">
          <p className="text-rose-300 text-sm text-center max-w-xs">{error}</p>
          <button
            onClick={retry}
            className="text-xs uppercase tracking-widest border border-[#F5F1E8]/30 rounded-full px-4 py-2 hover:bg-[#F5F1E8]/10 transition"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function Ball() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
    >
      <circle cx="100" cy="100" r="96" fill="#F5F1E8" stroke="#0B1120" strokeWidth="3" />
      <g fill="#0B1120">
        <polygon points="100,58 118,71 111,92 89,92 82,71" />
        <polygon points="100,140 82,127 89,106 111,106 118,127" />
        <polygon points="48,90 66,78 74,98 62,116 44,110" />
        <polygon points="152,90 134,78 126,98 138,116 156,110" />
      </g>
      <g stroke="#0B1120" strokeWidth="2" fill="none">
        <line x1="100" y1="10" x2="100" y2="58" />
        <line x1="100" y1="142" x2="100" y2="190" />
        <line x1="10" y1="100" x2="48" y2="90" />
        <line x1="152" y1="90" x2="190" y2="100" />
      </g>
    </svg>
  );
}

function CardDeck({ data }) {
  const teams = Object.keys(data.fan_reactions || {});

  const goalsByTeam = {};
  (data.timeline || []).forEach((m) => {
    if (m.event_type === "GOAL") {
      goalsByTeam[m.team] = (goalsByTeam[m.team] || 0) + 1;
    }
  });

  const cards = [
    { kind: "summary", summary: data.match_summary, teams, goalsByTeam },
    ...teams.map((team) => ({ kind: "fan", team, text: data.fan_reactions[team] })),
    ...(data.timeline || []).map((m) => ({ kind: "event", ...m })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        { threshold: 0.6 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o && o.disconnect());
  }, [cards.length]);

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-[#0B1120] relative">
      <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        {cards.map((_, i) => (
          <motion.span
            key={i}
            animate={{
              scale: i === activeIndex ? 1.3 : 1,
              backgroundColor: i === activeIndex ? "#4F46E5" : "rgba(245,241,232,0.25)",
            }}
            transition={{ duration: 0.25 }}
            className="w-2 h-2 rounded-full"
          />
        ))}
      </div>

      {cards.map((card, i) => (
        <div
          key={i}
          ref={(el) => (cardRefs.current[i] = el)}
          className="h-screen w-full snap-start"
        >
          <MatchCard card={card} isFirst={i === 0} teamsInOrder={teams} />
        </div>
      ))}
    </div>
  );
}
