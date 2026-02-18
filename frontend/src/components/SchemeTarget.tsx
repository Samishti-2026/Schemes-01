import { useState, useMemo } from 'react';

interface Customer {
  id: string;
  name: string;
  value: number;
  avgValue: number; // Added per-customer average
}

// Initial data can still be used as default state
const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Customer A', value: 40, avgValue: 10 },
  { id: 'c2', name: 'Customer B', value: 60, avgValue: 7 },
  { id: 'c3', name: 'Customer C', value: 50, avgValue: 10 },
  { id: 'c4', name: 'Customer D', value: 20, avgValue: 8 },
];

const SchemeTarget = () => {
  const [target, setTarget] = useState<number>(100);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [newCustomerNamme, setNewCustomerName] = useState('');
  const [newCustomerValue, setNewCustomerValue] = useState('');
  const [newCustomerAvg, setNewCustomerAvg] = useState('');

  // Sort customers by value (descending)
  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => b.value - a.value);
  }, [customers]);

  const addCustomer = () => {
    if (newCustomerNamme && newCustomerValue && newCustomerAvg) {
      setCustomers([
        ...customers,
        {
          id: Date.now().toString(),
          name: newCustomerNamme,
          value: Number(newCustomerValue),
          avgValue: Number(newCustomerAvg)
        }
      ]);
      setNewCustomerName('');
      setNewCustomerValue('');
      setNewCustomerAvg('');
    }
  };

  const removeCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#111318] text-white p-0 font-sans select-none">

      {/* Header Section inside Card */}
      <div className="p-6 border-b border-[#1F2937] flex gap-4 items-center">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">Target Qualifiers</h2>
          <p className="text-sm text-gray-500">Manage customer thresholds and bonuses</p>
        </div>

        {/* Quick Add - Inline */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New Customer..."
            value={newCustomerNamme}
            onChange={(e) => setNewCustomerName(e.target.value)}
            className="bg-[#0B0C10] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 w-40 transition-all placeholder-gray-600"
          />
          <input
            type="number"
            placeholder="Base"
            value={newCustomerValue}
            onChange={(e) => setNewCustomerValue(e.target.value)}
            className="bg-[#0B0C10] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm w-20 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600"
          />
          <input
            type="number"
            placeholder="Avg"
            value={newCustomerAvg}
            onChange={(e) => setNewCustomerAvg(e.target.value)}
            className="bg-[#0B0C10] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm w-20 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600"
          />
          <button
            onClick={addCustomer}
            disabled={!newCustomerNamme || !newCustomerValue || !newCustomerAvg}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Customer List Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

        {/* Table Header */}
        <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">
          <div className="col-span-6">Customer</div>
          <div className="col-span-3 text-right">Progress</div>
          <div className="col-span-3 text-right">Total Score</div>
        </div>

        <div className="space-y-3">
          {sortedCustomers.map((customer) => {
            // Updated Formula: Base + (Avg * Slider)
            const currentValue = customer.value + (customer.avgValue * sliderValue);
            const isTargetReached = currentValue >= target;
            const progressPercent = Math.min((currentValue / (target || 1)) * 100, 100);

            return (
              <div
                key={customer.id}
                className={`relative rounded-xl overflow-hidden group border transition-all duration-300 ${isTargetReached
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-[#0B0C10] border-[#1F2937] hover:border-gray-600'
                  }`}
              >
                {/* Progress Bar Background */}
                <div
                  className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ease-out ${isTargetReached ? 'bg-green-500' : 'bg-cyan-500'
                    }`}
                  style={{ width: `${progressPercent}%`, opacity: isTargetReached ? 1 : 0.4 }}
                />

                <div className="relative grid grid-cols-12 items-center p-4 z-10">
                  <div className="col-span-6 flex flex-col">
                    <span className={`text-sm font-medium transition-colors ${isTargetReached ? 'text-white' : 'text-gray-300'}`}>
                      {customer.name}
                    </span>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                      <span>Base: {customer.value}</span>
                      <span className="text-gray-600">|</span>
                      <span>Avg: {customer.avgValue}</span>
                      {sliderValue > 0 && <span className="text-cyan-400 ml-1">+{Math.round(customer.avgValue * sliderValue)} Bonus</span>}
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center justify-end">
                    <div className="text-xs font-mono text-gray-500">
                      {Math.round(progressPercent)}%
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center justify-end gap-3">
                    <span className={`text-sm font-bold px-3 py-1 rounded-md transition-all duration-300 ${isTargetReached
                      ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                      : 'bg-[#1F2937] text-gray-400'
                      }`}>
                      {currentValue.toLocaleString()}
                    </span>

                    <button
                      onClick={() => removeCustomer(customer.id)}
                      className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Remove Customer"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls Footer */}
      <div className="bg-[#0B0C10] border-t border-[#1F2937] p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-400">Bonus Adjustment (Multiplier)</label>
              <span className="text-2xl font-bold text-cyan-400">x{sliderValue}</span>
            </div>
            <div className="relative h-2 bg-[#1F2937] rounded-full">
              <div
                className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full"
                style={{ width: `${(sliderValue / 100) * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="100" // Kept as 100 for granularity, assuming user wants this range
                value={sliderValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSliderValue(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Target & Stats */}
          <div className="flex justify-between items-center bg-[#111318] p-4 rounded-xl border border-[#1F2937] gap-8">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-bold">Target Threshold</div>
              <div className="relative group">
                <input
                  type="text"
                  value={target}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) {
                      setTarget(val === '' ? 0 : Number(val));
                    }
                  }}
                  className="bg-transparent text-xl font-bold text-white focus:outline-none w-24 placeholder-gray-700"
                  placeholder="0"
                />
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-700 group-focus-within:bg-cyan-500 transition-colors" />
              </div>
            </div>

            {/* Total Value Metric (Sum of all individual totals) */}
            {/* <div className="text-right space-y-1">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-bold">Total Network Value</div>
              <div className="text-xl font-bold text-blue-400">
                {Math.round(customers.reduce((acc, curr) => acc + (curr.value + (curr.avgValue * sliderValue)), 0)).toLocaleString()}
              </div>
            </div> */}

            <div className="text-right space-y-1">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-bold">Qualifiers</div>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-2xl font-bold text-green-500">
                  {sortedCustomers.filter(c => (c.value + (c.avgValue * sliderValue)) >= target).length}
                </span>
                <span className="text-sm text-gray-600">/ {sortedCustomers.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeTarget;
