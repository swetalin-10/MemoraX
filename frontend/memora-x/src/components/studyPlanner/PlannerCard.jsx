import React from "react";
import { Link } from "react-router-dom";
import { Route, Clock, CalendarDays, ArrowRight, FileText, Sparkles, Plus } from "lucide-react";
import moment from "moment";

const PlannerCard = ({ item, onGenerate }) => {
  // Determine item type
  const isDocument = item.type === "document";
  const planner = isDocument ? null : item;
  
  const isGenerating = planner?.status === "generating";
  const isFailed = planner?.status === "failed";
  const isReady = planner?.status === "ready";

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "intermediate":
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "advanced":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    }
  };

  const getProgress = () => {
    if (!planner || !planner.studyPlan || planner.studyPlan.length === 0) return 0;
    const completed = planner.studyPlan.filter((w) => w.isCompleted).length;
    return Math.round((completed / planner.studyPlan.length) * 100);
  };

  // State 1: Ready to Generate (Detected Syllabus Document)
  if (isDocument) {
    return (
      <div className="group flex flex-col p-5 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/30 to-[#1E3EDC]/30 border border-primary/40 text-primary shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div className="px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/20 text-primary-dark font-semibold text-xs flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3" />
            Ready to Generate
          </div>
        </div>

        <div className="flex-1 relative z-10">
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2" title={item.title}>
            {item.title}
          </h3>
          <p className="text-xs text-primary/80 mb-5">
            Detected as syllabus/course outline
          </p>
          <div className="text-sm text-neutral-400 mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Uploaded {moment(item.uploadDate).format("MMM D, YYYY")}
          </div>
        </div>

        <div className="pt-4 border-t border-primary/20 relative z-10">
          <button
            onClick={() => onGenerate(item._id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Generate Roadmap
          </button>
        </div>
      </div>
    );
  }

  // State 2: Generated Planner (Ready, Generating, or Failed)
  return (
    <div className="flex flex-col p-5 rounded-2xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 transition-all duration-200 group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-xl bg-neutral-800 group-hover:bg-neutral-700 border border-neutral-700 transition-colors">
          <Route className="w-5 h-5 text-neutral-300" />
        </div>
        
        {isReady && (
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-medium capitalize ${getDifficultyColor(planner.difficulty)}`}>
            {planner.difficulty}
          </div>
        )}
        {isGenerating && (
          <div className="px-2.5 py-1 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500 text-xs font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Generating...
          </div>
        )}
        {isFailed && (
          <div className="px-2.5 py-1 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-medium">
            Failed
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1" title={planner.title}>
          {planner.title}
        </h3>
        {planner.sourceDocumentId && (
          <p className="text-sm text-neutral-500 mb-4 line-clamp-1">
            Source: {planner.sourceDocumentId.title}
          </p>
        )}

        {isReady && (
          <div className="flex flex-wrap gap-3 mb-5 text-xs text-neutral-400">
            {planner.estimatedDuration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {planner.estimatedDuration}
              </div>
            )}
            {planner.studyPlan && planner.studyPlan.length > 0 && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {planner.studyPlan.length} Modules
              </div>
            )}
          </div>
        )}

        {isReady && (
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-neutral-400">Progress</span>
              <span className="text-white font-medium">{getProgress()}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
        <span className="text-xs text-neutral-500">
          Created {moment(planner.createdAt).format("MMM D, YYYY")}
        </span>
        
        {isGenerating ? (
          <button disabled className="text-sm font-medium text-neutral-500 cursor-not-allowed">
            Processing...
          </button>
        ) : isFailed ? (
          <button disabled className="text-sm font-medium text-red-500 cursor-not-allowed">
            Generation Error
          </button>
        ) : (
          <Link
            to={`/study-planner/${planner._id}`}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Open Planner
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default PlannerCard;
