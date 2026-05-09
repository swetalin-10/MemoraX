import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, BookOpen, Briefcase, Baby, FileText, LayoutGrid,
  Zap, Flame, Rocket, Trash2,
} from "lucide-react";

const MODE_META = {
  exam_revision: { label: "Exam Revision", icon: BookOpen, color: "text-blue-400 bg-blue-500/10" },
  interview_prep: { label: "Interview Prep", icon: Briefcase, color: "text-emerald-400 bg-emerald-500/10" },
  beginner_friendly: { label: "Beginner", icon: Baby, color: "text-amber-400 bg-amber-500/10" },
  one_page: { label: "One-Page", icon: FileText, color: "text-rose-400 bg-rose-500/10" },
  visual_learning: { label: "Visual", icon: LayoutGrid, color: "text-violet-400 bg-violet-500/10" },
};

const COMP_META = {
  standard: { label: "Standard", icon: Zap },
  aggressive: { label: "Aggressive", icon: Flame },
  ultra: { label: "Ultra", icon: Rocket },
};

const CheatSheetCard = ({ cheatSheet, onDelete, compact = false }) => {
  const navigate = useNavigate();
  const mode = MODE_META[cheatSheet.mode] || MODE_META.exam_revision;
  const comp = COMP_META[cheatSheet.compressionLevel] || COMP_META.standard;
  const ModeIcon = mode.icon;
  const readTime = cheatSheet.metadata?.readingTimeMinutes || 1;
  const date = new Date(cheatSheet.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div
      onClick={() => navigate(`/cheatsheets/${cheatSheet._id}`)}
      className={`
        group bg-neutral-900 border border-neutral-800 rounded-xl cursor-pointer
        hover:border-neutral-700 hover:bg-neutral-900/80 transition-all duration-200
        hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5
        ${compact ? "p-3" : "p-4"}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-white truncate group-hover:text-neutral-100 ${compact ? "text-sm" : "text-base"}`}>
            {cheatSheet.title}
          </h4>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${mode.color}`}>
              <ModeIcon className="w-2.5 h-2.5" />
              {mode.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
              <Clock className="w-2.5 h-2.5" />
              {readTime} min
            </span>
            <span className="text-[10px] text-neutral-600">{date}</span>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(cheatSheet._id); }}
            className="p-1.5 rounded-lg text-neutral-600 hover:text-rose-400 hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CheatSheetCard;
