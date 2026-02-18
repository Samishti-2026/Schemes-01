import React from 'react';

// Using a simple SVG implementation to avoid unknown dependencies
const AnalyticsGraph = () => {
  // Mock data points
  const points = [20, 45, 30, 60, 55, 85, 70];
  const max = 100;

  // Generate path d attribute
  const width = 100; // percent
  const height = 100; // percent units roughly

  // Create points for SVG polyline
  // We map index 0..6 to x=0..100%
  // and value 0..100 to y=100..0%
  const svgPoints = points.map((val, i) => {
    const x = (i / (points.length - 1)) * 100; // 0 to 100
    const y = 100 - val; // Invert y because SVG origin is top-left
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6 flex flex-col h-full relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 z-10">
        <h3 className="text-lg font-semibold text-white">Analytics Overview</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg bg-[#1F2937] text-xs text-white hover:bg-gray-700 transition-colors">Weekly</button>
          <button className="px-3 py-1 rounded-lg bg-transparent text-xs text-gray-500 hover:text-white transition-colors">Monthly</button>
        </div>
      </div>

      <div className="flex-1 w-full h-full relative flex items-end px-2 pb-2">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-700 pointer-events-none">
          <div className="border-b border-gray-800 w-full h-px"></div>
          <div className="border-b border-gray-800 w-full h-px"></div>
          <div className="border-b border-gray-800 w-full h-px"></div>
          <div className="border-b border-gray-800 w-full h-px"></div>
          <div className="border-b border-gray-800 w-full h-px"></div>
        </div>

        {/* Graph */}
        <svg className="w-full h-[80%] overflow-visible z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Line */}
          <polyline
            points={svgPoints}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Gradient Def */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan 400 */}
              <stop offset="100%" stopColor="#a78bfa" /> {/* Violet 400 */}
            </linearGradient>
          </defs>

          {/* Area under curve (simplified for now, just line is cleaner) */}
        </svg>
      </div>
    </div>
  );
};

export default AnalyticsGraph;
