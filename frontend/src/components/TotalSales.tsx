

const TotalSales = () => {
  return (
    <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6 flex flex-col justify-center">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Sales (Q3)</h3>
        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">+12.5% vs Q2</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-bold text-white tracking-tight">$2,450,000</span>
        <span className="text-sm text-gray-500">Target: $2.2M</span>
      </div>

      {/* Simple Progress Bar */}
      <div className="mt-4 relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[85%]" />
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
