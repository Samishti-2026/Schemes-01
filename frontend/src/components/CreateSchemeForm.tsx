import React, { useState, useEffect } from 'react';

interface CreateSchemeFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
  initialData?: any; // Added for edit mode
}

const CreateSchemeForm: React.FC<CreateSchemeFormProps> = ({ onCancel, onSave, initialData }) => {
  // 1. Basic Scheme Details
  const [schemeName, setSchemeName] = useState('');
  const [description, setDescription] = useState('');

  // 2. Lifecycle (Dates) - New Requirement
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 3. Target Definition
  const [targetType, setTargetType] = useState('total_sales'); // product_qty, category_qty, total_sales, adv_payment
  const [selectedTargetItem, setSelectedTargetItem] = useState(''); // Specific product or category

  // 4. Budget & Constraints
  const [totalBudget, setTotalBudget] = useState('');
  const [maxQualifiers, setMaxQualifiers] = useState('');

  // 5. Individual Rewards
  const [individualTarget, setIndividualTarget] = useState('');
  const [rewardRate, setRewardRate] = useState('');
  const [payoutPerPerson, setPayoutPerPerson] = useState(0);

  // 6. Recipient Logic
  const [recipientType, setRecipientType] = useState('customer'); // customer, distributor, sales_exec
  const [regionFilter, setRegionFilter] = useState('all');

  // Load Initial Data if editing
  useEffect(() => {
    if (initialData) {
      setSchemeName(initialData.name || '');
      setDescription(initialData.description || '');
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || '');
      setTargetType(initialData.type === 'Product Qty' ? 'product_qty' :
        initialData.type === 'Category Qty' ? 'category_qty' : 'total_sales');
      setTotalBudget(initialData.budget ? initialData.budget.replace(/[^0-9]/g, '') : '');
      setIndividualTarget(initialData.individualTarget || ''); // Assuming these fields exist in data model
      setRewardRate(initialData.rewardRate || '');
      // ... map other fields as needed
    }
  }, [initialData]);

  // Auto-Calculate Payout
  useEffect(() => {
    const target = parseFloat(individualTarget) || 0;
    const rate = parseFloat(rewardRate) || 0;
    setPayoutPerPerson(target * (rate / 100));
  }, [individualTarget, rewardRate]);

  const handleSave = () => {
    // Validation Logic
    if (!schemeName) {
      alert("Please fill in Scheme Name.");
      return;
    }

    onSave({
      schemeName,
      description,
      startDate,
      endDate,
      targetType,
      selectedTargetItem,
      totalBudget,
      maxQualifiers,
      individualTarget,
      rewardRate,
      payoutPerPerson,
      recipientType,
      regionFilter
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0C10] animate-fadeIn">
      {/* Top Toolbar */}
      <div className="p-6 border-b border-[#1F2937] flex justify-between items-center bg-[#111318]">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-white leading-none">
              {initialData ? 'Edit Scheme Configuration' : 'New Scheme Configuration'}
            </h2>
            <span className="text-xs text-gray-500">Define rules, budget, and target audience</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Discard</button>
          <button onClick={handleSave} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {initialData ? 'Save Changes' : 'Save & Launch'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* SECTION 1: IDENTITY & LIFECYCLE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none"></div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  1. Scheme Identity
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Scheme Name</label>
                    <input
                      type="text"
                      value={schemeName}
                      onChange={e => setSchemeName(e.target.value)}
                      placeholder="e.g., Monsoon Dhamaka 2026"
                      className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all font-medium text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Description (Internal Note)</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Objectives for this scheme..."
                      className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all h-24 resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 3: TARGET DEFINITION */}
              <section className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  3. Target Metric Logic
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Metric Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { id: 'product_qty', label: 'Product Qty', icon: '📦' },
                        { id: 'category_qty', label: 'Category Qty', icon: '🏷️' },
                        { id: 'total_sales', label: 'Total Sales', icon: '💰' },
                        { id: 'adv_payment', label: 'Adv Payment', icon: '💳' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setTargetType(opt.id)}
                          className={`p - 3 rounded - xl border text - sm font - medium transition - all flex flex - col items - center gap - 2 ${targetType === opt.id
                              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                              : 'bg-[#0B0C10] border-[#1F2937] text-gray-400 hover:border-gray-600'
                            } `}
                        >
                          <span className="text-xl">{opt.icon}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(targetType === 'product_qty' || targetType === 'category_qty') && (
                    <div className="col-span-2 animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select {targetType === 'product_qty' ? 'Specific Product' : 'Product Category'}
                      </label>
                      <select
                        value={selectedTargetItem}
                        onChange={e => setSelectedTargetItem(e.target.value)}
                        className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">Select Item...</option>
                        <option>XYZ Insecticide 1L</option>
                        <option>ABC Fertilizer 50kg</option>
                        <option>Fungicides Group</option>
                        <option>Herbicides Group</option>
                      </select>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              {/* SECTION 2: TIMELINE */}
              <section className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  2. Life Cycle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </section>

              {/* RECIPIENT FILTER */}
              <section className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  Target Audience
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Role</label>
                    <div className="flex bg-[#0B0C10] rounded-lg p-1 border border-[#1F2937]">
                      {['Customer', 'Distributor', 'Sales'].map(r => (
                        <button
                          key={r}
                          onClick={() => setRecipientType(r.toLowerCase())}
                          className={`flex - 1 py - 1.5 text - xs font - medium rounded - md transition - all ${recipientType === r.toLowerCase() ? 'bg-[#1F2937] text-white shadow' : 'text-gray-500 hover:text-gray-300'
                            } `}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Region</label>
                    <select
                      value={regionFilter}
                      onChange={e => setRegionFilter(e.target.value)}
                      className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="all">All India</option>
                      <option value="north">North Zone</option>
                      <option value="south">South Zone</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* SECTION 4: BUDGET & REWARDS CALCULATOR */}
          <section className="bg-gradient-to-br from-[#111318] to-[#1a1c23] rounded-2xl border border-[#1F2937] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center font-mono text-sm border border-green-500/20">$</span>
              Budget & Economy Logic
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Inputs */}
              <div className="space-y-6 md:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Total Budget (Hard Cap)</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors">₹</span>
                      <input
                        type="number"
                        value={totalBudget}
                        onChange={e => setTotalBudget(e.target.value)}
                        placeholder="1,00,000"
                        className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Maximum Qualifiers</label>
                    <input
                      type="number"
                      value={maxQualifiers}
                      onChange={e => setMaxQualifiers(e.target.value)}
                      placeholder="100"
                      className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="h-px bg-[#1F2937] w-full"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Individual Target</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors">₹</span>
                      <input
                        type="number"
                        value={individualTarget}
                        onChange={e => setIndividualTarget(e.target.value)}
                        placeholder="10,000"
                        className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Reward Rate (%)</label>
                    <div className="relative group">
                      <input
                        type="number"
                        value={rewardRate}
                        onChange={e => setRewardRate(e.target.value)}
                        placeholder="10"
                        className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all font-mono"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Card */}
              <div className="md:col-span-1">
                <div className="bg-[#0B0C10] rounded-xl border border-green-500/30 p-4 h-full flex flex-col justify-center items-center shadow-[0_0_20px_rgba(34,197,94,0.1)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                  <span className="text-xs text-green-400 font-bold uppercase tracking-widest mb-2">Payout Per Person</span>
                  <span className="text-3xl font-bold text-white font-mono tracking-tight">
                    ₹{payoutPerPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-2 text-center">Calculated from Target × Rate</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CreateSchemeForm;
