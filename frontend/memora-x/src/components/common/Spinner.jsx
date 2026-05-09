import React from "react";

const Spinner = ({ size = "md", label }) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-[2.5px]",
    lg: "h-8 w-8 border-3",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-primary/20 border-t-primary rounded-full animate-spin`}
      />
      {label && (
        <p className="text-sm text-neutral-500 animate-pulseSubtle">{label}</p>
      )}
    </div>
  );
};

/* ── Skeleton Loader Components ── */

export const SkeletonCard = () => (
  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
    <div className="flex items-start justify-between">
      <div className="skeleton w-12 h-12 rounded-xl" />
      <div className="skeleton-line w-16 h-3" />
    </div>
    <div className="space-y-2">
      <div className="skeleton-line w-3/4 h-4" />
      <div className="skeleton-line w-1/2 h-3" />
    </div>
    <div className="flex gap-2">
      <div className="skeleton-line w-20 h-6 rounded-lg" />
      <div className="skeleton-line w-16 h-6 rounded-lg" />
    </div>
    <div className="pt-4 border-t border-neutral-800">
      <div className="skeleton-line w-24 h-3" />
    </div>
  </div>
);

export const SkeletonCardGrid = ({ count = 4, cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" }) => (
  <div className={`grid ${cols} gap-5`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonStatCard = () => (
  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <div className="skeleton-line w-16 h-8" />
        <div className="skeleton-line w-24 h-3" />
      </div>
      <div className="skeleton w-11 h-11 rounded-xl" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="skeleton w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-line w-2/3 h-4" />
          <div className="skeleton-line w-1/3 h-3" />
        </div>
      </div>
    ))}
  </div>
);

export default Spinner;