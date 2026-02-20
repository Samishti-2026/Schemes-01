import { useState, useMemo } from 'react';
import type { Recipient } from '../types';
import FilterDropdown from './FilterDropdown';

const CustomersTab = () => {
  // Top Controls
  const [recipientType, setRecipientType] = useState('Customer');
  const [targetMetric, setTargetMetric] = useState('Total Sales');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  // Simulation Controls
  const [durationDays, setDurationDays] = useState(30);
  const [targetThreshold, setTargetThreshold] = useState(50000); // 50k
  const [payoutAmount, setPayoutAmount] = useState(1000); // Flat reward
  const [payoutType, setPayoutType] = useState('Fixed'); // 'Fixed' | 'Calculated'

  // Mock Data (Recipients) - Enriched with Category/Type/Region/PaymentStatus for filtering
  const [recipients] = useState<Recipient[]>([
    { id: 1, name: 'Customer 1', currentTO: 25000, avgDaily: 1500, category: 'Electronics', type: 'Dealer', region: 'North', paymentStatus: 'Completed', products: ['Smartphone', 'Laptop'] },
    { id: 2, name: 'Customer 2', currentTO: 12000, avgDaily: 800, category: 'Home Appliances', type: 'Retailer', region: 'South', paymentStatus: 'Pending', products: ['Mixer Grinder'] },
    { id: 3, name: 'Customer 3', currentTO: 45000, avgDaily: 2000, category: 'Electronics', type: 'Dealer', region: 'East', paymentStatus: 'Completed', products: ['Smart Watch', 'Smartphone'] },
    { id: 4, name: 'Customer 4', currentTO: 5000, avgDaily: 300, category: 'Furniture', type: 'Retailer', region: 'West', paymentStatus: 'Failed', products: ['Office Chair'] },
    { id: 5, name: 'Customer 5', currentTO: 32000, avgDaily: 1200, category: 'Home Appliances', type: 'Dealer', region: 'North', paymentStatus: 'Pending', products: ['Microwave', 'Mixer Grinder'] },
    { id: 6, name: 'Customer 6', currentTO: 18000, avgDaily: 900, category: 'Electronics', type: 'Retailer', region: 'South', paymentStatus: 'Completed', products: ['Laptop'] },
    { id: 7, name: 'Customer 7', currentTO: 55000, avgDaily: 2500, category: 'Furniture', type: 'Dealer', region: 'East', paymentStatus: 'Completed', products: ['Sofa Set', 'Dining Table'] },
    { id: 8, name: 'Customer 8', currentTO: 8000, avgDaily: 400, category: 'Electronics', type: 'Retailer', region: 'West', paymentStatus: 'Pending', products: ['Smartphone', 'Smart Watch'] },
    { id: 9, name: 'Customer 9', currentTO: 28000, avgDaily: 1400, category: 'Fashion', type: 'Dealer', region: 'North', paymentStatus: 'Completed', products: ['T-Shirt', 'Jeans'] },
    { id: 10, name: 'Customer 10', currentTO: 15000, avgDaily: 700, category: 'Footwear', type: 'Retailer', region: 'South', paymentStatus: 'Pending', products: ['Sneakers'] },
    { id: 11, name: 'Customer 11', currentTO: 42000, avgDaily: 1900, category: 'Fashion', type: 'Dealer', region: 'East', paymentStatus: 'Completed', products: ['Jacket', 'Jeans'] },
    { id: 12, name: 'Customer 12', currentTO: 9000, avgDaily: 450, category: 'Footwear', type: 'Retailer', region: 'West', paymentStatus: 'Failed', products: ['Formal Shoes'] },
  ]);

  // Computations
  const simulatedData = useMemo(() => {
    return recipients.map(r => {
      const projectedTO = r.avgDaily * durationDays;
      const totalTO = r.currentTO + projectedTO;
      return {
        ...r,
        projectedTO,
        totalTO,
        isQualifying: totalTO >= targetThreshold
      };
    });
  }, [recipients, durationDays, targetThreshold]);

  // Multi-Filter Logic
  const filteredData = useMemo(() => {
    let data = simulatedData;

    // 2. Faceted Filters
    if (activeFilters.length > 0) {
      data = data.filter(r => {
        const filterSet = new Set(activeFilters);
        let matches = true;

        // Category Filters
        const catFilters = ['Electronics', 'Home Appliances', 'Furniture', 'Fashion', 'Footwear'].filter(c => filterSet.has(c));
        const recipientCategory = r.category ?? '';
        if (catFilters.length > 0 && !catFilters.includes(recipientCategory)) matches = false;

        // Region Filters
        const regionFilters = ['North', 'South', 'East', 'West'].filter(c => filterSet.has(c));
        const recipientRegion = r.region ?? '';
        if (regionFilters.length > 0 && !regionFilters.includes(recipientRegion)) matches = false;

        // Product Filters
        const allProducts = ['Smartphone', 'Laptop', 'Smart Watch', 'Mixer Grinder', 'Microwave', 'Office Chair', 'Sofa Set', 'Dining Table', 'T-Shirt', 'Jeans', 'Jacket', 'Sneakers', 'Formal Shoes'];
        const productFilters = allProducts.filter(c => filterSet.has(c));
        const recipientProducts = r.products || [];
        if (productFilters.length > 0) {
          const hasMatch = productFilters.some(p => recipientProducts.includes(p));
          if (!hasMatch) matches = false;
        }

        return matches;
      });
    }

    // 3. Sort by Total Turnover (Desc)
    data = data.sort((a, b) => b.totalTO - a.totalTO);

    return data;
  }, [simulatedData, activeFilters]);

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(prev => prev.filter(f => f !== filter));
    } else {
      setActiveFilters(prev => [...prev, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  const stats = useMemo(() => {
    const qualifyingRows = simulatedData.filter(r => r.isQualifying);
    const qualifiers = qualifyingRows.length;

    let totalBudget = 0;
    if (payoutType === 'Fixed') {
      totalBudget = qualifiers * payoutAmount;
    } else {
      totalBudget = qualifyingRows.reduce((sum, r) => sum + (r.totalTO * (payoutAmount / 100)), 0);
    }

    // "Additional" Scenario: Lower target by 10%
    const stretchThreshold = targetThreshold * 0.9;
    const allQualifiersAtStretch = simulatedData.filter(r => r.totalTO >= stretchThreshold);
    const additionalQualifiersCount = allQualifiersAtStretch.length - qualifiers;

    let additionalBudget = 0;
    if (additionalQualifiersCount > 0) {
      const newQualifiers = allQualifiersAtStretch.filter(r => r.totalTO < targetThreshold);
      if (payoutType === 'Fixed') {
        additionalBudget = newQualifiers.length * payoutAmount;
      } else {
        additionalBudget = newQualifiers.reduce((sum, r) => sum + (r.totalTO * (payoutAmount / 100)), 0);
      }
    }

    return { qualifiers, totalBudget, additionalQualifiers: additionalQualifiersCount, additionalBudget };
  }, [simulatedData, payoutAmount, targetThreshold, payoutType]);

  const filterGroups = [
    { name: 'Region', options: ['North', 'South', 'East', 'West'] },
    { name: 'Category', options: ['Electronics', 'Home Appliances', 'Furniture', 'Fashion', 'Footwear'] },
    { name: 'Products', options: ['Smartphone', 'Laptop', 'Smart Watch', 'Mixer Grinder', 'Microwave', 'Office Chair', 'Sofa Set', 'Dining Table', 'T-Shirt', 'Jeans', 'Jacket', 'Sneakers', 'Formal Shoes'] }
  ];

  return (
    <div className="p-2 md:p-3 flex-1 min-h-[0] flex flex-col gap-2 animate-fadeIn text-white overflow-hidden pb-12 lg:pb-3">

      {/* Scheme Details Inputs */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 flex flex-col gap-0.5">
            <label className="text-[10px] text-gray-400 ml-1 uppercase tracking-wide">Scheme Name</label>
            <input
              type="text"
              placeholder="Enter scheme name..."
              className="bg-[#111318] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm w-full focus:border-cyan-500 outline-none placeholder-gray-600"
            />
          </div>
          <div className="flex-[2] flex flex-col gap-1">
            <label className="text-[10px] text-gray-400 ml-1 uppercase tracking-wide">Description</label>
            <input
              type="text"
              placeholder="Enter scheme description..."
              className="bg-[#111318] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm w-full focus:border-cyan-500 outline-none placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Top Row: Dropdowns */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-start sm:items-end w-full">
        <div className="flex flex-col gap-0.5 min-w-[150px]">
          <label className="text-[10px] text-gray-400 ml-1 uppercase tracking-wide">Recipient</label>
          <div className="relative">
            <select
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
              className="bg-[#111318] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm w-full sm:w-40 appearance-none focus:border-cyan-500 outline-none"
            >
              <option>Customer</option>
              <option>Distributor</option>
              <option>Sales Executive</option>
            </select>
            <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 min-w-[180px]">
          <label className="text-[10px] text-gray-400 ml-1 uppercase tracking-wide">Target Option (T.O)</label>
          <div className="relative">
            <select
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              className="bg-[#111318] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm w-full sm:w-48 appearance-none focus:border-cyan-500 outline-none"
            >
              <option>Sales</option>
              <option>Qty</option>
              <option>CatQty</option>
              <option>Payment</option>
            </select>
            <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* Filters and Load Button Container */}
        <div className="flex-1 w-full sm:w-auto min-w-[250px] flex flex-col gap-2 relative z-20">
          <div className="flex flex-col sm:flex-row gap-2 w-full items-start sm:items-center">

            {/* Filter Dropdown Trigger */}
            <div className="relative w-full sm:max-w-[250px] shrink-0">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`w-full px-3 py-1.5 rounded-lg border border-[#1F2937] flex items-center justify-between gap-2 transition-colors text-sm ${showFilterDropdown || activeFilters.length > 0 ? 'bg-[#1F2937] border-cyan-500/30' : 'bg-[#111318] hover:bg-[#1F2937]'} `}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <svg className={`shrink-0 w-3.5 h-3.5 ${activeFilters.length > 0 ? 'text-cyan-400' : 'text-gray-400'} `} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  <span className={`truncate ${activeFilters.length > 0 ? 'text-cyan-400 font-medium' : 'text-gray-400'}`}>
                    {activeFilters.length > 0 ? `${activeFilters.length} Active Filters` : 'Filter Columns...'}
                  </span>
                </div>
                <svg className="shrink-0 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {/* Faceted Dropdown Menu - Cascading Style */}
              {showFilterDropdown && (
                <FilterDropdown
                  filterGroups={filterGroups}
                  activeFilters={activeFilters}
                  onToggleFilter={toggleFilter}
                  onClose={() => setShowFilterDropdown(false)}
                />
              )}
            </div>

            <button className="bg-[#1F2937] hover:bg-[#2D3748] border border-gray-600 px-6 py-1.5 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto shrink-0 shadow-sm">
              Load
            </button>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(filter => (
                <span key={filter} className="text-[10px] bg-[#1F2937] border border-gray-700 text-gray-300 pl-2 pr-1 py-0.5 rounded-lg flex items-center gap-1 group shadow-sm">
                  {filter}
                  <button onClick={() => removeFilter(filter)} className="hover:bg-gray-700 rounded p-0.5 transition-colors">
                    <svg className="w-3 h-3 text-gray-500 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
              <button onClick={() => setActiveFilters([])} className="text-[10px] text-cyan-500 hover:text-cyan-400 hover:underline px-1">
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-3 lg:flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar lg:overflow-hidden min-h-0 pr-1 lg:pr-0 pb-1 lg:pb-0">

        {/* Left: Data Table */}
        <div className="flex-1 lg:flex-1 min-h-[300px] lg:min-h-0 bg-[#111318] border border-[#1F2937] rounded-xl overflow-hidden flex flex-col shadow-lg">
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 relative">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-[#1F2937] text-gray-400 text-[10px] uppercase sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 sm:px-4 py-2 whitespace-nowrap">Receiptant</th>
                  <th className="px-3 sm:px-4 py-2 text-right whitespace-nowrap">Curr T.O Value</th>
                  <th className="px-3 sm:px-4 py-2 text-right whitespace-nowrap">Prj. T.O Value <span className="normal-case text-gray-500 text-[9px]">(avg*days)</span></th>
                  <th className="px-3 sm:px-4 py-2 text-right text-cyan-400 whitespace-nowrap">Total <span className="normal-case text-gray-500 text-[9px]">(curr+prj)</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]/50 text-xs">
                {filteredData.map(r => (
                  <tr key={r.id} className={`hover:bg-[#1F2937]/30 transition-colors ${r.isQualifying ? 'bg-green-900/20' : ''} `}>
                    <td className="px-3 sm:px-4 py-2.5 font-medium text-gray-200 whitespace-nowrap truncate max-w-[150px] sm:max-w-xs">
                      {r.name}
                      {r.isQualifying && <span className="ml-2 text-[9px] bg-green-500/20 text-green-400 px-1 py-0.5 rounded border border-green-500/30 whitespace-nowrap">QUALIFIED</span>}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-right text-gray-400 font-mono whitespace-nowrap">
                      {r.currentTO.toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-right font-mono text-gray-500 whitespace-nowrap">
                      {r.projectedTO.toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-right font-mono whitespace-nowrap">
                      <span className={r.isQualifying ? 'text-green-400 font-bold' : 'text-gray-400'}>
                        {r.totalTO.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Simulator Controls */}
        <div className="w-full lg:w-[320px] xl:w-[420px] shrink-0 flex flex-col gap-2 overflow-visible lg:overflow-y-auto custom-scrollbar lg:pr-1 pb-4 lg:pb-1 mt-4 lg:mt-0">

          {/* Controls + Duration Block */}
          <div className="flex flex-col gap-1.5 w-full">

            {/* 1. Target Slider */}
            <div className="bg-[#111318] border border-[#1F2937] rounded-xl p-2.5 shadow-sm w-full">
              <div className="flex justify-between items-center mb-0.5">
                <label className="text-sm font-semibold text-gray-200">Target</label>
                <span className="text-xs text-cyan-400 font-mono font-bold bg-[#1F2937] px-1.5 py-0.5 rounded border border-gray-700">
                  {(targetThreshold / 1000).toFixed(0)}k
                </span>
              </div>
              <input
                type="range" min="0" max="100000" step="1000"
                value={targetThreshold}
                onChange={(e) => setTargetThreshold(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 touch-pan-x"
              />
              <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono">
                <span>0</span>
                <span>Based on T.O</span>
                <span>100CR</span>
              </div>
            </div>

            {/* Connection Visualization Line */}
            <div className="flex items-center gap-2 px-2 hidden">
              <div className="h-0 w-px bg-cyan-500/30 mx-auto"></div>
            </div>

            {/* Duration / Settlement Date Slider (Linked) */}
            <div className="flex items-center gap-1 w-full">
              <div className="h-px bg-cyan-500/30 flex-1"></div>
              <div className="flex flex-col items-center w-full min-w-[200px] max-w-[280px]">
                <div className="bg-[#111318] border border-cyan-500/50 p-2 rounded-xl flex flex-col items-center w-full shadow-[0_0_15px_rgba(6,182,212,0.1)]">

                  <div className="flex justify-between w-full mb-1">
                    <label className="text-[9px] text-gray-400 uppercase tracking-wider">Duration</label>
                    <span className="text-cyan-400 font-mono font-bold text-sm">{durationDays} Days</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="365"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 mb-1.5 touch-pan-x"
                  />

                  <div className="flex flex-col items-center bg-[#1F2937]/50 w-full py-1 rounded-lg border border-[#1F2937]">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">Settlement Date</span>
                    <span className="text-sm font-mono font-medium text-white text-center">
                      {new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                </div>
              </div>
              <div className="h-px bg-cyan-500/30 flex-1"></div>
            </div>

            {/* 2. Payout Slider */}
            <div className="bg-[#111318] border border-[#1F2937] rounded-xl p-2.5 shadow-sm w-full">
              <div className="flex justify-between items-center mb-1 gap-2 flex-wrap sm:flex-nowrap">
                <label className="text-sm font-semibold text-gray-200">Payout</label>

                {/* Radio Buttons for Payout Type */}
                <div className="flex bg-[#1F2937] rounded p-0.5 gap-0.5 shrink-0">
                  <button
                    onClick={() => { setPayoutType('Fixed'); setPayoutAmount(1000); }}
                    className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${payoutType === 'Fixed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:text-white'} `}
                  >
                    Fixed
                  </button>
                  <button
                    onClick={() => { setPayoutType('Calculated'); setPayoutAmount(5); }}
                    className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${payoutType === 'Calculated' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:text-white'} `}
                  >
                    Calc(%)
                  </button>
                </div>

                <span className="text-xs text-green-400 font-mono font-bold bg-[#1F2937] px-1.5 py-0.5 rounded border border-gray-700 min-w-[50px] text-center shrink-0">
                  {payoutType === 'Fixed' ? `Rs.${payoutAmount} ` : `${payoutAmount}% `}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={payoutType === 'Fixed' ? 5000 : 25}
                step={payoutType === 'Fixed' ? 100 : 0.5}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 touch-pan-x"
              />
              <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono">
                <span>0</span>
                <span>Based on R.B</span>
                <span>{payoutType === 'Fixed' ? '5K' : '25%'}</span>
              </div>
            </div>
          </div>

          {/* Stats Outputs (Stacked Blocks) */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full">

            {/* Primary Budget Block */}
            <div className="bg-[#111318] border border-[#1F2937] rounded-xl p-2 flex flex-1 flex-col gap-1.5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-10 pointer-events-none">
                <svg className="w-8 h-8 text-cyan-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.35 0 2.53-.86 2.53-1.91s-1.18-1.91-2.53-1.91l-1.66-.05c-2.47-.07-4.33-1.85-4.33-4.15 0-2.12 1.55-3.83 3.74-4.2V2h2.67v1.93c1.71.36 3.15 1.46 3.27 3.4h-1.96c-.1-1.05-1.18-1.91-2.53-1.91-1.35 0-2.53.86-2.53 1.91s1.18 1.91 2.53 1.91l1.66.05c2.47.07 4.33 1.85 4.33 4.15 0 2.12-1.55 3.83-3.74 4.2z" /></svg>
              </div>

              {/* Budget Sub-Block */}
              <div className="bg-[#1F2937]/40 rounded-lg p-1.5 border border-[#1F2937] flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-1">
                <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Budget Req.</span>
                <span className="text-sm font-bold text-white font-mono break-all">
                  {(stats.totalBudget / 1000).toFixed(1)}k
                </span>
              </div>

              {/* Qualifier Count Sub-Block */}
              <div className="bg-cyan-900/20 rounded-lg p-1.5 border border-cyan-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-1">
                <span className="text-cyan-200/70 text-[10px] uppercase tracking-wider font-semibold">Total Qualifiers</span>
                <span className="text-base font-bold text-cyan-400 font-mono break-all">{stats.qualifiers}</span>
              </div>
            </div>

            {/* Additional Budget Block */}
            <div className="bg-[#111318] border border-[#1F2937] rounded-xl p-2 flex flex-1 flex-col gap-1.5 opacity-80 border-dashed relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-5 pointer-events-none">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
              </div>

              {/* Add. Budget Sub-Block */}
              <div className="bg-[#1F2937]/20 rounded-lg p-1.5 border border-[#1F2937]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-1">
                <span className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Add. Budget</span>
                <span className="text-sm font-bold text-gray-300 font-mono break-all">
                  +{(stats.additionalBudget / 1000).toFixed(1)}k
                </span>
              </div>

              {/* Add. Qualifier Count Sub-Block */}
              <div className="bg-[#1F2937]/20 rounded-lg p-1.5 border border-[#1F2937]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-1">
                <span className="text-gray-500/70 text-[10px] uppercase tracking-wider font-semibold">Add. Qualifiers</span>
                <span className="text-sm font-bold text-gray-400 font-mono break-all">+{stats.additionalQualifiers}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomersTab;
