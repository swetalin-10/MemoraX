import React from 'react'

const PageHeader = ({ title, subtitle, description, children }) => {
  const sub = subtitle || description;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
          {title}
        </h1>
        {sub && (
          <p className="text-neutral-400 text-sm mt-1.5 leading-relaxed">
            {sub}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}

export default PageHeader