import { useState, useEffect } from 'react';
import { fetchDashboardSummary } from '../api';

interface DashboardSummary {
  quarterLabel: string;
  changePercent: string;
  totalSales: string;
  salesTarget: string;
  progressPercent: number;
}

const TotalSales = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6 flex items-center justify-center">
        <span className="text-gray-500 animate-pulse">Loading sales...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6 flex flex-col justify-center">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Total Sales ({summary?.quarterLabel || 'Q3'})
        </h3>
        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
          {summary?.changePercent || '+0%'}
        </span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-bold text-white tracking-tight">
          {summary?.totalSales || '$0'}
        </span>
        <span className="text-sm text-gray-500">
          Target: {summary?.salesTarget || '$0'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${summary?.progressPercent || 0}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
        <span>0</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default TotalSales;
