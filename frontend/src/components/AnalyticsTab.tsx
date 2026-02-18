import React from 'react';
import AnalyticsGraph from './AnalyticsGraph'; // Reuse existing component

const AnalyticsTab = () => {
  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: '$124,500', change: '+12%', color: 'text-green-400' },
          { label: 'Active Schemes', value: '4', change: '0%', color: 'text-blue-400' },
          { label: 'Avg Order Value', value: '$845', change: '-2%', color: 'text-red-400' },
        ].map((kpi, i) => (
          <div key={i} className="bg-[#111318] p-6 rounded-xl border border-[#1F2937]">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-white">{kpi.value}</h3>
              <span className={`text-sm font-medium ${kpi.color}`}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Graph */}
      <div className="h-96">
        <AnalyticsGraph />
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111318] p-6 rounded-xl border border-[#1F2937] h-64 flex flex-col justify-center items-center">
          <p className="text-gray-500">Customer Acquisition (Placeholder)</p>
          <div className="w-32 h-32 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 mt-4 animate-spin-slow"></div>
        </div>
        <div className="bg-[#111318] p-6 rounded-xl border border-[#1F2937] h-64 flex flex-col justify-center items-center">
          <p className="text-gray-500">Regional Distribution (Placeholder)</p>
          <div className="w-full h-4 bg-gray-800 rounded-full mt-4 overflow-hidden flex">
            <div className="bg-blue-500 w-1/3"></div>
            <div className="bg-purple-500 w-1/4"></div>
            <div className="bg-green-500 w-1/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
