import React, { useState } from "react";
import { 
  CalendarDays, 
  Clock, 
  Target, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  Circle,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import studyPlannerService from "../../services/studyPlannerService";
import toast from "react-hot-toast";

const RoadmapViewer = ({ planner, onUpdate }) => {
  const [expandedWeeks, setExpandedWeeks] = useState(
    planner.studyPlan?.reduce((acc, _, i) => ({ ...acc, [i]: true }), {}) || {}
  );
  const [toggling, setToggling] = useState(null);

  if (!planner) return null;

  const toggleWeekExpand = (index) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleToggleComplete = async (index, e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent expanding/collapsing when clicking the checkbox
    
    // Prevent double clicks and focus-stealing
    if (toggling !== null) return;

    try {
      setToggling(index);
      const res = await studyPlannerService.toggleWeekComplete(planner._id, index);
      onUpdate(res.data);
      
      const isCompleted = res.data.studyPlan[index].isCompleted;
      if (isCompleted) {
        toast.success(`Week ${index + 1} marked as completed!`);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update completion status");
    } finally {
      setToggling(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "low": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      default: return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }
  };

  const completedCount = planner.studyPlan?.filter(w => w.isCompleted).length || 0;
  const totalWeeks = planner.studyPlan?.length || 0;
  const progressPercent = totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto pr-3 custom-scrollbar pb-24">
      {/* Premium Dashboard Summary Card */}
      <div className="shrink-0 bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 mb-8 shadow-sm flex flex-col lg:flex-row gap-8 relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>

        {/* Left Side: Content & Progress */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2 tracking-tight truncate">
              {planner.title}
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2 max-w-2xl">
              {planner.overview}
            </p>
          </div>
          
          {/* Integrated Progress Section */}
          <div className="max-w-md">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Overall Progress</span>
              <span className="text-sm font-bold text-white">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/[0.04] shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-primary to-[#1E3EDC] transition-all duration-700 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Side: Stacked Stat Widgets */}
        <div className="flex flex-row lg:flex-col gap-3 shrink-0 lg:w-56">
          {/* Duration Widget */}
          <div className="flex-1 lg:flex-none flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-neutral-900 rounded-md border border-neutral-800">
                <Clock className="w-3.5 h-3.5 text-primary/90" />
              </div>
              <span className="text-xs font-medium text-neutral-400">Duration</span>
            </div>
            <span className="text-sm font-semibold text-white">{planner.estimatedDuration || "N/A"}</span>
          </div>

          {/* Difficulty Widget */}
          <div className="flex-1 lg:flex-none flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-neutral-900 rounded-md border border-neutral-800">
                <Target className="w-3.5 h-3.5 text-primary/90" />
              </div>
              <span className="text-xs font-medium text-neutral-400">Difficulty</span>
            </div>
            <span className="text-sm font-semibold text-white capitalize">{planner.difficulty || "Mixed"}</span>
          </div>
        </div>
      </div>

      {/* Weekly Plan */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h3 className="text-xl font-semibold text-white flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-primary" />
          Study Roadmap
        </h3>
      </div>

      <div className="space-y-5 mb-10">
        {planner.studyPlan?.map((week, index) => (
          <div 
            key={index}
            className={`rounded-[1.25rem] border transition-all duration-300 overflow-hidden ${
              week.isCompleted 
                ? "border-emerald-500/30 bg-[#0d1612]" 
                : "border-neutral-800 bg-[#111113] hover:border-neutral-700"
            }`}
          >
            {/* Week Header */}
            <div 
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => toggleWeekExpand(index)}
            >
              <div className="flex items-center gap-5">
                <button 
                  type="button"
                  onClick={(e) => handleToggleComplete(index, e)}
                  className={`shrink-0 transition-transform ${
                    toggling === index ? "opacity-50" : "hover:scale-110 active:scale-95"
                  }`}
                  aria-label="Toggle completion"
                >
                  {toggling === index ? (
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  ) : week.isCompleted ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  ) : (
                    <Circle className="w-7 h-7 text-neutral-600 hover:text-primary transition-colors" />
                  )}
                </button>
                <div>
                  <h4 className={`font-semibold text-lg tracking-tight ${week.isCompleted ? "text-emerald-400" : "text-white"}`}>
                    {week.week}
                  </h4>
                  <div className="flex items-center gap-4 mt-1.5 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-neutral-500">
                      <Clock className="w-3.5 h-3.5" />
                      {week.estimatedHours || 0} hrs
                    </span>
                    <span className={`px-2.5 py-1 rounded-md capitalize ${getPriorityColor(week.priority)}`}>
                      {week.priority || "Medium"} Priority
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-2 text-neutral-500 bg-neutral-900 rounded-lg">
                {expandedWeeks[index] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {/* Week Content */}
            {expandedWeeks[index] && (
              <div className="p-6 pt-2 border-t border-neutral-800/50 bg-black/20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Topics Container */}
                  <div className="bg-neutral-900/50 rounded-xl p-5 border border-neutral-800/50">
                    <h5 className="text-sm font-semibold text-white flex items-center gap-2.5 mb-4">
                      <div className="p-1.5 rounded-md bg-primary/20">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      Topics to Cover
                    </h5>
                    <ul className="space-y-3">
                      {week.topics?.map((topic, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(61,94,229,0.8)]"></span>
                          <span className="leading-relaxed">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Goals & Revision Container */}
                  <div className="space-y-5">
                    <div className="bg-neutral-900/50 rounded-xl p-5 border border-neutral-800/50">
                      <h5 className="text-sm font-semibold text-white flex items-center gap-2.5 mb-4">
                        <div className="p-1.5 rounded-md bg-emerald-500/20">
                          <Target className="w-4 h-4 text-emerald-400" />
                        </div>
                        Key Goals
                      </h5>
                      <ul className="space-y-3">
                        {week.goals?.map((goal, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                            <span className="leading-relaxed">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {week.revision && (
                      <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">Revision Focus</h5>
                        <p className="text-sm text-amber-200/80 leading-relaxed">{week.revision}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips Section */}
      {planner.tips && planner.tips.length > 0 && (
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-[1.5rem] p-8">
          <h3 className="text-xl font-semibold text-blue-400 flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Lightbulb className="w-6 h-6 text-blue-400" />
            </div>
            Preparation Strategy & Tips
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {planner.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 bg-black/20 p-4 rounded-xl border border-blue-500/10">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-sm text-blue-100/80 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoadmapViewer;
