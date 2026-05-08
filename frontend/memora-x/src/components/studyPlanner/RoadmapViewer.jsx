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
  ChevronUp
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
    e.stopPropagation(); // Prevent expanding/collapsing when clicking the checkbox
    if (toggling === index) return;

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
    <div className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar pb-10">
      {/* Overview Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{planner.title}</h2>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl">
              {planner.overview}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 flex items-center gap-2 text-sm text-neutral-300">
              <Clock className="w-4 h-4 text-primary" />
              {planner.estimatedDuration || "N/A"}
            </div>
            <div className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 flex items-center gap-2 text-sm text-neutral-300 capitalize">
              <Target className="w-4 h-4 text-primary" />
              {planner.difficulty || "Mixed"}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-400 font-medium">Overall Progress</span>
            <span className="text-white font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-neutral-950 border border-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-[#1E3EDC] transition-all duration-700 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Weekly Plan */}
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4 px-1">
        <CalendarDays className="w-5 h-5 text-primary" />
        Study Roadmap
      </h3>

      <div className="space-y-4 mb-8">
        {planner.studyPlan?.map((week, index) => (
          <div 
            key={index}
            className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
              week.isCompleted 
                ? "border-emerald-500/30 bg-emerald-500/5" 
                : "border-neutral-800 bg-neutral-900"
            }`}
          >
            {/* Week Header */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => toggleWeekExpand(index)}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => handleToggleComplete(index, e)}
                  disabled={toggling === index}
                  className="shrink-0 transition-transform hover:scale-110 active:scale-95"
                >
                  {week.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-neutral-600 hover:text-primary transition-colors" />
                  )}
                </button>
                <div>
                  <h4 className={`font-semibold text-lg ${week.isCompleted ? "text-emerald-400" : "text-white"}`}>
                    {week.week}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {week.estimatedHours || 0} hrs
                    </span>
                    <span className={`px-2 py-0.5 rounded capitalize ${getPriorityColor(week.priority)}`}>
                      {week.priority || "Medium"} Priority
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-2 text-neutral-500">
                {expandedWeeks[index] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {/* Week Content */}
            {expandedWeeks[index] && (
              <div className="p-5 pt-2 border-t border-neutral-800/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Topics */}
                  <div>
                    <h5 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Topics to Cover
                    </h5>
                    <ul className="space-y-2">
                      {week.topics?.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0"></span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Goals & Revision */}
                  <div className="space-y-5">
                    <div>
                      <h5 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-primary" />
                        Key Goals
                      </h5>
                      <ul className="space-y-2">
                        {week.goals?.map((goal, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/50 shrink-0"></span>
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {week.revision && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <h5 className="text-xs font-semibold text-amber-500 mb-1">Revision Focus</h5>
                        <p className="text-sm text-amber-200/70">{week.revision}</p>
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
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5" />
            Preparation Strategy & Tips
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planner.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm text-blue-100/70 leading-relaxed pt-1">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoadmapViewer;
