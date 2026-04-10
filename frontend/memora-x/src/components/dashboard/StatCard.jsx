import React from "react";

const StatCard = ({
  title,
  value,
  icon,
  trend,
  accentColor = "var(--tw-color-primary, #3D5EE5)",
}) => {
  return (
    <div
      className="bg-neutral-900 border border-neutral-800 border-l-4 rounded-2xl p-5 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold text-white leading-tight">{value}</p>
          <p className="text-sm text-neutral-400 mt-2">{title}</p>
          {trend ? <p className="text-xs text-neutral-500 mt-1">{trend}</p> : null}
        </div>
        <div className="w-11 h-11 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
          <span className="text-neutral-200">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;