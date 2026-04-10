import React from "react";

const AnalyticsCard = ({
  title,
  subtitle,
  children,
  height = "h-72",
  className = "",
}) => {
  return (
    <section
      className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl overflow-visible ${className}`}
    >
      <header>
        <h3 className="text-base font-medium text-white">{title}</h3>
        {subtitle ? <p className="text-sm text-neutral-400 mt-1">{subtitle}</p> : null}
      </header>
      <div className="border-t border-neutral-800 my-4" />
      <div className={`${height} overflow-visible`}>{children}</div>
    </section>
  );
};

export default AnalyticsCard;