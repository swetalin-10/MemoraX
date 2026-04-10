import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { chartTheme, flashcardData } from "./mockData";

const pieColors = [
  chartTheme.colors.success,
  chartTheme.colors.warning,
  chartTheme.colors.muted,
];

const FlashcardPieChart = () => {
  const totalCards = flashcardData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={flashcardData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="75%"
            paddingAngle={3}
          >
            {flashcardData.map((entry, index) => (
              <Cell key={entry.name} fill={pieColors[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={chartTheme.tooltipStyle}
            labelStyle={{ color: chartTheme.colors.tooltipText }}
            itemStyle={{ color: chartTheme.colors.tooltipText }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ color: chartTheme.colors.axisText, fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-white leading-none">{totalCards}</span>
        <span className="text-xs text-neutral-400 mt-1">Total Cards</span>
      </div>
    </div>
  );
};

export default FlashcardPieChart;