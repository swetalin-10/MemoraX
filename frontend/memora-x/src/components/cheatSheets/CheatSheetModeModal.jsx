import React, { useState } from "react";
import {
  BookOpen,
  Briefcase,
  Baby,
  FileText,
  LayoutGrid,
  Zap,
  Flame,
  Rocket,
  Loader2,
} from "lucide-react";
import cheatSheetService from "../../services/cheatSheetService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";

const MODES = [
  {
    key: "exam_revision",
    label: "Exam Revision",
    description: "Definitions, formulas, theory questions & revision bullets",
    icon: BookOpen,
    gradient: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
  },
  {
    key: "interview_prep",
    label: "Interview Prep",
    description: "Comparisons, common questions, traps & concise explanations",
    icon: Briefcase,
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
  },
  {
    key: "beginner_friendly",
    label: "Beginner Friendly",
    description: "Simplified explanations, analogies & step-by-step breakdowns",
    icon: Baby,
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
  {
    key: "one_page",
    label: "One-Page Revision",
    description: "Ultra compressed, maximum density, last-minute revision",
    icon: FileText,
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/20",
  },
  {
    key: "visual_learning",
    label: "Visual Learning",
    description: "Categorized sections, tables, hierarchy & structured breakdowns",
    icon: LayoutGrid,
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
];

const COMPRESSION_LEVELS = [
  {
    key: "standard",
    label: "Standard",
    description: "~60% compression",
    icon: Zap,
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
  },
  {
    key: "aggressive",
    label: "Aggressive",
    description: "~75% compression",
    icon: Flame,
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
  },
  {
    key: "ultra",
    label: "Ultra Compressed",
    description: "~90% compression",
    icon: Rocket,
    color: "text-rose-400",
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
  },
];

const CheatSheetModeModal = ({ isOpen, onClose, documentId, onGenerated }) => {
  const [selectedMode, setSelectedMode] = useState("exam_revision");
  const [compressionLevel, setCompressionLevel] = useState("standard");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await cheatSheetService.generateCheatSheet(documentId, {
        mode: selectedMode,
        compressionLevel,
      });
      toast.success("Cheat sheet generated!");
      onClose();
      if (onGenerated) onGenerated();
      // Navigate to the detail page
      if (res.data?._id) {
        navigate(`/cheatsheets/${res.data._id}`);
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate cheat sheet");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedModeData = MODES.find((m) => m.key === selectedMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm backdrop-enter"
        onClick={!loading ? onClose : undefined}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-10 modal-enter overflow-hidden">
        {/* HEADER */}
        <div className="p-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                Generate Cheat Sheet
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Choose a mode and compression level for your revision notes
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-neutral-400 hover:text-white disabled:opacity-50 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* MODE SELECTION */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wider">
              Cheat Sheet Mode
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    onClick={() => setSelectedMode(mode.key)}
                    disabled={loading}
                    className={`
                      relative p-4 rounded-xl border text-left transition-all duration-200
                      ${
                        isSelected
                          ? `border-transparent bg-gradient-to-br ${mode.gradient} bg-opacity-10 shadow-lg ${mode.glow}`
                          : "border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900"
                      }
                      disabled:opacity-50
                    `}
                  >
                    {/* selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                          ${isSelected ? "bg-white/20" : "bg-neutral-800"}
                        `}
                      >
                        <Icon
                          className={`w-4.5 h-4.5 ${
                            isSelected ? "text-white" : "text-neutral-400"
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold ${
                            isSelected ? "text-white" : "text-neutral-200"
                          }`}
                        >
                          {mode.label}
                        </p>
                        <p
                          className={`text-xs mt-0.5 leading-relaxed ${
                            isSelected ? "text-white/70" : "text-neutral-500"
                          }`}
                        >
                          {mode.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMPRESSION LEVEL */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wider">
              Compression Level
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {COMPRESSION_LEVELS.map((level) => {
                const Icon = level.icon;
                const isSelected = compressionLevel === level.key;
                return (
                  <button
                    key={level.key}
                    onClick={() => setCompressionLevel(level.key)}
                    disabled={loading}
                    className={`
                      p-3 rounded-xl border text-center transition-all duration-200
                      ${
                        isSelected
                          ? `${level.border} ${level.bg}`
                          : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                      }
                      disabled:opacity-50
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 mx-auto mb-1.5 ${
                        isSelected ? level.color : "text-neutral-500"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        isSelected ? "text-white" : "text-neutral-300"
                      }`}
                    >
                      {level.label}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {level.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            {selectedModeData && (
              <span>
                Mode:{" "}
                <span className="text-neutral-300 font-medium">
                  {selectedModeData.label}
                </span>
                {" · "}
                <span className="text-neutral-300 font-medium capitalize">
                  {compressionLevel}
                </span>{" "}
                compression
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={onClose}
              disabled={loading}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              loading={loading}
              variant="primary"
              icon={!loading && <Zap className="w-4 h-4" />}
            >
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheatSheetModeModal;
