// src/Components/Vendor/SalesChart.js
import React from "react";

function formatDay(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { weekday: "short" });
}

const SalesChart = ({ points = [] }) => {
  // points: [{ date: '2025-11-20', value: 250 }, ...]
  const max = Math.max(...points.map(p => p.value), 1);
  return (
    <div style={{ padding: 8 }}>
      <svg className="sales-chart" viewBox="0 0 500 120" preserveAspectRatio="none" style={{ width: "100%", height: 120 }}>
        {points.map((p, i) => {
          const x = (i * (500 / points.length)) + 10;
          const w = (500 / points.length) - 20;
          const h = (p.value / max) * 80;
          const y = 100 - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} rx="6" ry="6" fill="#34D399" />
              <text x={x + w/2} y={115} fontSize="10" textAnchor="middle" fill="#374151">{formatDay(p.date)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SalesChart;