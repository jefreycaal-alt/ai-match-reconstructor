import { motion } from "framer-motion";

const EVENT_META = {
  GOAL: {
    label: "Goal",
    pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  YELLOW_CARD: {
    label: "Yellow Card",
    pill: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  RED_CARD: {
    label: "Red Card",
    pill: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  SUBSTITUTION: {
    label: "Substitution",
    pill: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  KEY_MOMENT: {
    label: "Key Moment",
    pill: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  },
};

const TEAM_ACCENTS = ["#4F46E5", "#C66B3D", "#0EA5E9", "#DB2777"];

function accentFor(team, teamsInOrder) {
  const idx = Math.max(teamsInOrder.indexOf(team), 0);
  return TEAM_ACCENTS[idx % TEAM_ACCENTS.length];
}

export default function MatchCard({ card, isFirst, teamsInOrder }) {
  return (
    <div className="h-full w-full flex items-center justify-center relative px-6 py-12">
      {card.kind === "summary" && <SummaryCard card={card} />}
      {card.kind === "fan" && (
        <FanCard card={card} accent={accentFor(card.team, teamsInOrder)} />
      )}
      {card.kind === "event" && <EventCard card={card} />}

      {isFirst && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 0.6 },
            y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute bottom-8 text-[11px] uppercase tracking-[0.25em] text-[#F5F1E8]/40"
        >
          Scroll to continue ↓
        </motion.span>
      )}
    </div>
  );
}

function SummaryCard({ card }) {
  const [teamA, teamB] = card.teams;
  const scoreA = card.goalsByTeam[teamA] || 0;
  const scoreB = card.goalsByTeam[teamB] || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-xl rounded-3xl bg-[#F5F1E8] text-[#0B1120] p-8 sm:p-10 shadow-2xl"
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 text-white rounded-full px-3 py-1">
          AI Generated
        </span>
        <span className="text-[10px] uppercase tracking-widest text-[#0B1120]/40">
          Granite match summary
        </span>
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <span className="text-lg sm:text-2xl font-black uppercase tracking-tight text-right flex-1">
          {teamA}
        </span>
        <span className="text-3xl sm:text-4xl font-black bg-indigo-600 text-white rounded-2xl px-4 py-2 tabular-nums whitespace-nowrap">
          {scoreA} – {scoreB}
        </span>
        <span className="text-lg sm:text-2xl font-black uppercase tracking-tight flex-1">
          {teamB}
        </span>
      </div>

      <p className="text-base sm:text-lg leading-relaxed text-[#0B1120]/80">
        {card.summary}
      </p>
    </motion.div>
  );
}

function FanCard({ card, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-xl rounded-3xl bg-[#F5F1E8] text-[#0B1120] p-8 sm:p-10 shadow-2xl relative overflow-hidden"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: accent }}
      />
      <span className="text-[10px] uppercase tracking-widest text-[#0B1120]/40 block mb-2">
        Fan perspective
      </span>
      <h2
        className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-6"
        style={{ color: accent }}
      >
        {card.team}
      </h2>
      <span className="text-6xl font-serif leading-none text-[#0B1120]/15 block -mb-4">
        “
      </span>
      <p className="text-base sm:text-lg leading-relaxed text-[#0B1120]/80">
        {card.text}
      </p>
    </motion.div>
  );
}

function EventCard({ card }) {
  const meta = EVENT_META[card.event_type] || EVENT_META.KEY_MOMENT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-xl flex flex-col items-center text-center text-[#F5F1E8]"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4, ease: "backOut" }}
        className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/40"
      >
        <span className="text-3xl font-black tabular-nums">{card.minute}'</span>
      </motion.div>

      <motion.span
        initial={{ scale: 0.7, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={`text-xs font-bold uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${meta.pill}`}
      >
        {meta.label}
      </motion.span>

      <p className="text-sm uppercase tracking-widest text-[#F5F1E8]/60 mb-4">
        {card.player} — {card.team}
      </p>

      <p className="text-base sm:text-lg leading-relaxed text-[#F5F1E8]/90 max-w-md mb-6">
        {card.narrative}
      </p>

      {card.video_file && (
        <video
          className="w-72 sm:w-80 rounded-2xl shadow-2xl"
          src={`/clips/${card.video_file}`}
          controls
          autoPlay
          muted
          loop
          playsInline
        />
      )}
    </motion.div>
  );
}
