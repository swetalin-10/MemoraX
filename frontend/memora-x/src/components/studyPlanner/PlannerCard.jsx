import React from "react";
import { Link } from "react-router-dom";
import { Route, Clock, BarChart, CalendarDays, ArrowRight } from "lucide-react";
import moment from "moment";

const PlannerCard = ({ planner }) => {
  const isGenerating = planner.status === "generating";
  const isFailed = planner.status === "failed";

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
    if (!planner.studyPlan || planner.studyPlan.length === 0) return 0;
    const completed = planner.studyPlan.filter((w) => w.isCompleted).length;
    return Math.round((completed / planner.studyPlan.length) * 100);
  };

  return (
    <div className="flex flex-col p-5 rounded-2xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-[#1E3EDC]/20 border border-primary/20">
          <Route className="w-5 h-5 text-primary" />
        </div>
        {!isGenerating && !isFailed && (
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

        {!isGenerating && !isFailed && (
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
                {planner.studyPlan.length} Weeks
              </div>
            )}
          </div>
        )}

        {!isGenerating && !isFailed && (
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
