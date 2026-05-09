import React, { useRef, useEffect, useState } from "react";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeEl = tabRefs.current[activeTab];
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="relative border-b border-neutral-800">
        <nav className="flex gap-1 tabs-scroll">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              ref={(el) => (tabRefs.current[tab.name] = el)}
              onClick={() => setActiveTab(tab.name)}
              className={`relative pb-3.5 px-4 md:px-5 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeTab === tab.name
                  ? "text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon && <tab.icon size={15} />}
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Animated underline indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      </div>

      {/* Tabs Content */}
      <div className="py-6 w-full overflow-visible">
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`w-full ${
              activeTab === tab.name
                ? "block animate-fadeIn"
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
