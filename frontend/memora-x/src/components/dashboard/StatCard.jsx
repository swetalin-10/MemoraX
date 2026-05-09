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
      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 transition-all duration-200 hover:border-neutral-700 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold text-white leading-tight tabular-nums">{value}</p>
          <p className="text-sm text-neutral-400 mt-2">{title}</p>
          {trend ? <p className="text-xs text-neutral-500 mt-1">{trend}</p> : null}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
          style={{
            backgroundColor: `${accentColor}12`,
            color: accentColor,
          }}
        >
          {icon}
        </div>
      </div>
      {/* Subtle accent line */}
      <div
        className="mt-4 h-0.5 rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-200"
        style={{ backgroundColor: accentColor, width: '40%' }}
      />
    </div>
  );
};

export default StatCard;