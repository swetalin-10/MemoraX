import React, { useState } from "react";
import { RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const CheatSheetSection = ({
  section,
  sectionIndex,
  onRegenerate,
  isRegenerating,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Assign colors based on section index for visual variety
  const colors = [
    { border: "border-l-blue-500", badge: "bg-blue-500/10 text-blue-400" },
    { border: "border-l-emerald-500", badge: "bg-emerald-500/10 text-emerald-400" },
    { border: "border-l-amber-500", badge: "bg-amber-500/10 text-amber-400" },
    { border: "border-l-rose-500", badge: "bg-rose-500/10 text-rose-400" },
    { border: "border-l-violet-500", badge: "bg-violet-500/10 text-violet-400" },
    { border: "border-l-cyan-500", badge: "bg-cyan-500/10 text-cyan-400" },
    { border: "border-l-pink-500", badge: "bg-pink-500/10 text-pink-400" },
    { border: "border-l-teal-500", badge: "bg-teal-500/10 text-teal-400" },
  ];

  const color = colors[sectionIndex % colors.length];

  return (
    <div
      className={`
        border-l-4 ${color.border} bg-neutral-900/50 rounded-r-xl
        transition-all duration-300 hover:bg-neutral-900/80
      `}
      style={{ animationDelay: `${sectionIndex * 80}ms` }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 flex-1 text-left group"
        >
          <h4 className="text-base font-semibold text-white group-hover:text-neutral-200 transition-colors">
            {section.heading}
          </h4>
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-neutral-500" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${color.badge}`}>
            {section.points?.length || 0} points
          </span>
          {onRegenerate && (
            <button
              onClick={() => onRegenerate(sectionIndex, section.heading)}
              disabled={isRegenerating}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all disabled:opacity-50"
              title="Regenerate this section"
            >
              {isRegenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Section Points */}
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-1.5">
          {section.points?.map((point, pointIdx) => (
            <div
              key={pointIdx}
              className="flex items-start gap-2.5 text-sm text-neutral-300 leading-relaxed"
            >
              <span className="text-neutral-600 mt-1 select-none flex-shrink-0">•</span>
              <span>{point}</span>
            </div>
          ))}
          {(!section.points || section.points.length === 0) && (
            <p className="text-sm text-neutral-600 italic">No points in this section</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CheatSheetSection;
