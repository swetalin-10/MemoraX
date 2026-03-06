import React from "react";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="relative border-b-2 border-slate-100">
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`relative pb-4 px-2 md:px-6 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.name
                  ? "text-primary"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="relative z-10">{tab.label}</span>

              {activeTab === tab.name && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-[#1E3EDC] rounded-full shadow-lg shadow-primary/30" />
              )}

              {activeTab === tab.name && (
                <div className="absolute inset-0 bg-gradient-to-b from-primary to-transparent rounded-t-xl -z-10" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tabs Content */}
      <div className="py-6 w-full overflow-visible">
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`w-full ${
              activeTab === tab.name
                ? "block animate-in fade-in duration-300"
                : "hidden"
            }`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
