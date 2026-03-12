import { useState, useEffect } from 'react';
import { fetchUpcomingSchemes } from '../api';

interface UpcomingScheme {
  id: number;
  name: string;
  totalBudget: number;
  startDate: string;
}

const UpcomingSchemes = () => {
  const [schemes, setSchemes] = useState<UpcomingScheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUpcomingSchemes();
        setSchemes(data);
      } catch (err) {
        console.error('Failed to load upcoming schemes:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getPotential = (scheme: UpcomingScheme) => {
    const budget = Number(scheme.totalBudget || 0);
    return budget >= 150000 ? 'High' : 'Med';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Upcoming Schemes</h3>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
        {loading ? (
          <div className="text-gray-500 animate-pulse text-center py-8">Loading...</div>
        ) : schemes.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No upcoming schemes</div>
        ) : (
          schemes.map((scheme) => (
            <div key={scheme.id} className="bg-[#0B0C10] p-4 rounded-xl border border-[#1F2937] hover:border-gray-600 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-200 group-hover:text-cyan-400 transition-colors">{scheme.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPotential(scheme) === 'High' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                  {getPotential(scheme)}
                </span>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(scheme.startDate)}
              </div>
            </div>
          ))
        )}
      </div>
      <button className="w-full mt-4 py-2 text-sm text-cyan-500 hover:text-cyan-400 font-medium border border-dashed border-gray-700 rounded-lg hover:bg-[#1F2937] transition-all">
        + View Calendar
      </button>
    </div>
  );
};

export default UpcomingSchemes;
