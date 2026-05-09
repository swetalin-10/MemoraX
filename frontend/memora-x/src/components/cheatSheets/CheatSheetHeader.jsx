import React from "react";
import {
  Clock, Copy, Download, FileText, ArrowLeft, Zap, Flame, Rocket,
  BookOpen, Briefcase, Baby, LayoutGrid,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MODE_LABELS = {
  exam_revision: { label: "Exam Revision", icon: BookOpen, color: "bg-blue-500/15 text-blue-400" },
  interview_prep: { label: "Interview Prep", icon: Briefcase, color: "bg-emerald-500/15 text-emerald-400" },
  beginner_friendly: { label: "Beginner Friendly", icon: Baby, color: "bg-amber-500/15 text-amber-400" },
  one_page: { label: "One-Page", icon: FileText, color: "bg-rose-500/15 text-rose-400" },
  visual_learning: { label: "Visual Learning", icon: LayoutGrid, color: "bg-violet-500/15 text-violet-400" },
};

const COMPRESSION_LABELS = {
  standard: { label: "Standard", icon: Zap, color: "bg-blue-500/10 text-blue-400" },
  aggressive: { label: "Aggressive", icon: Flame, color: "bg-amber-500/10 text-amber-400" },
  ultra: { label: "Ultra", icon: Rocket, color: "bg-rose-500/10 text-rose-400" },
};

const CheatSheetHeader = ({ cheatSheet, onCopyAll, onExportMarkdown, onExportPDF }) => {
  const navigate = useNavigate();
  if (!cheatSheet) return null;

  const modeInfo = MODE_LABELS[cheatSheet.mode] || MODE_LABELS.exam_revision;
  const compInfo = COMPRESSION_LABELS[cheatSheet.compressionLevel] || COMPRESSION_LABELS.standard;
  const ModeIcon = modeInfo.icon;
  const CompIcon = compInfo.icon;
  const readTime = cheatSheet.metadata?.readingTimeMinutes || 1;
  const date = new Date(cheatSheet.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="mb-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-4 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white leading-tight mb-3">{cheatSheet.generatedContent?.title || cheatSheet.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${modeInfo.color}`}><ModeIcon className="w-3 h-3" />{modeInfo.label}</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${compInfo.color}`}><CompIcon className="w-3 h-3" />{compInfo.label}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400"><Clock className="w-3 h-3" />{readTime} min read</span>
              <span className="text-xs text-neutral-600">{date}</span>
            </div>
            {cheatSheet.document?.title && <p className="text-xs text-neutral-500 mt-2">Source: <span className="text-neutral-400">{cheatSheet.document.title}</span></p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onCopyAll} className="p-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all" title="Copy"><Copy className="w-4 h-4" /></button>
            <button onClick={onExportMarkdown} className="p-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all" title="Markdown"><FileText className="w-4 h-4" /></button>
            <button onClick={onExportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors" title="PDF"><Download className="w-4 h-4" />PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheatSheetHeader;
