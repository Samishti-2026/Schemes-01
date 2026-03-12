import { useState, useEffect } from 'react';
import { createScheme } from '../api';

// ── Rule type ──
interface Rule {
  id: number;
  field: string;
  operator: string;
  value: string;
}

// ── Step definitions ──
const STEPS = [
  { id: 1, label: 'Identity', icon: '✏️' },
  { id: 2, label: 'Target', icon: '🎯' },
  { id: 3, label: 'Budget', icon: '💰' },
  { id: 4, label: 'Audience', icon: '👥' },
  { id: 5, label: 'Review', icon: '✅' },
];

const CreateSchemeTab = () => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Step 1 — Identity
  const [schemeName, setSchemeName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Step 2 — Target
  const [targetType, setTargetType] = useState('total_sales');
  const [selectedTargetItem, setSelectedTargetItem] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetUnit, setTargetUnit] = useState('amount');
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, field: 'recipients.currentTO', operator: '>=', value: '' }
  ]);

  // Rule helpers
  const addRule = () => {
    setRules(prev => [...prev, { id: Date.now(), field: 'recipients.currentTO', operator: '>=', value: '' }]);
  };
  const removeRule = (id: number) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };
  const updateRule = (id: number, key: keyof Rule, val: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));
  };

  // Step 3 — Budget
  const [totalBudget, setTotalBudget] = useState('');
  const [maxQualifiers, setMaxQualifiers] = useState('');

  // Step 3 — Payout Terms
  const [payoutType, setPayoutType] = useState('Fixed Amount');
  const [payoutAmount, setPayoutAmount] = useState(1000);
  const [interestFreePeriod, setInterestFreePeriod] = useState(0);
  const [interestAboveTarget, setInterestAboveTarget] = useState<number | ''>('');

  // Step 4 — Audience
  const [recipientType, setRecipientType] = useState('customer');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Computed
  const [payoutPerPerson, setPayoutPerPerson] = useState(0);

  useEffect(() => {
    // Estimating payout per person based on target value if it's a percentage or per item
    const target = parseFloat(targetValue) || 10000; // Using scheme target as baseline for estimation if applicable
    let estimated = 0;
    if (payoutType === 'Fixed Amount') {
      estimated = payoutAmount;
    } else if (payoutType === 'Fixed Calculated') {
      estimated = target * (payoutAmount / 100);
    } else if (payoutType === 'Per Item Discount') {
      // rough estimation
      estimated = Math.floor(target / 100) * payoutAmount;
    }
    setPayoutPerPerson(estimated);
  }, [payoutType, payoutAmount, targetValue]);

  const estimatedTotalPayout = payoutPerPerson * (parseInt(maxQualifiers) || 0);
  const budgetUtilization = parseFloat(totalBudget) > 0
    ? Math.min(100, (estimatedTotalPayout / parseFloat(totalBudget)) * 100)
    : 0;

  const canProceed = () => {
    switch (step) {
      case 1: return schemeName.trim().length > 0;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await createScheme({
        schemeName,
        description,
        startDate,
        endDate,
        targetType,
        selectedTargetItem,
        targetValue: targetValue ? parseFloat(targetValue) : undefined,
        targetUnit,
        rules: rules.filter(r => r.value).map(r => ({ field: r.field, operator: r.operator, value: r.value })),
        totalBudget: totalBudget ? parseFloat(totalBudget) : undefined,
        maxQualifiers: maxQualifiers ? parseInt(maxQualifiers) : undefined,
        payoutType,
        payoutAmount,
        interestFreePeriod,
        interestAboveTarget: interestAboveTarget !== '' ? interestAboveTarget : undefined,
        payoutPerPerson,
        recipientType,
        regionFilter,
      });
      setSaved(true);
    } catch (err) {
      console.error('Failed to create scheme:', err);
      alert('Failed to create scheme. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSaved(false);
    setSchemeName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setTargetType('total_sales');
    setSelectedTargetItem('');
    setTargetValue('');
    setTargetUnit('amount');
    setRules([{ id: 1, field: 'recipients.currentTO', operator: '>=', value: '' }]);
    setTotalBudget('');
    setMaxQualifiers('');
    setPayoutType('Fixed Amount');
    setPayoutAmount(1000);
    setInterestFreePeriod(0);
    setInterestAboveTarget('');
    setRecipientType('customer');
    setRegionFilter('all');
    setCategoryFilter('all');
  };

  // ── Success Screen ──
  if (saved) {
    return (
      <div className="flex-1 flex items-center justify-center animate-fadeIn">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Scheme Created!</h2>
          <p className="text-gray-400 mb-2 text-lg font-medium">{schemeName}</p>
          <p className="text-gray-500 text-sm mb-8">Your scheme has been saved and is ready to go.</p>
          <button
            onClick={resetForm}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20"
          >
            + Create Another Scheme
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden animate-fadeIn">
      {/* Top Bar — Step Progress */}
      <div className="px-8 pt-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  onClick={() => s.id <= step && setStep(s.id)}
                  className={`flex items-center gap-2.5 group transition-all ${s.id <= step ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold transition-all
                    ${step === s.id
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 scale-110'
                      : s.id < step
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'bg-[#1F2937] text-gray-600'
                    }`}>
                    {s.id < step ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span>{s.icon}</span>
                    )}
                  </div>
                  <span className={`text-sm font-medium hidden md:block ${step === s.id ? 'text-cyan-400' : s.id < step ? 'text-gray-300' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${s.id < step ? 'bg-cyan-500/40' : 'bg-[#1F2937]'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
        <div className="max-w-3xl mx-auto">

          {/* ── STEP 1: Identity ── */}
          {step === 1 && (
            <div className="animate-fadeIn space-y-6">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-white">Name Your Scheme</h2>
                <p className="text-gray-500 text-sm mt-1">Give your scheme an identity and set its schedule.</p>
              </div>

              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Scheme Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={schemeName}
                    onChange={e => setSchemeName(e.target.value)}
                    placeholder="e.g., Monsoon Dhamaka 2026"
                    className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3.5 text-white text-lg font-medium focus:outline-none focus:border-cyan-500 transition-all placeholder-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What's the goal of this scheme?"
                    className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition-all h-28 resize-none placeholder-gray-700"
                  />
                </div>
              </div>

              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
                {startDate && endDate && (
                  <div className="mt-4 px-4 py-2.5 bg-purple-500/8 rounded-xl border border-purple-500/15 text-sm text-purple-300 flex items-center gap-2">
                    <span>📅</span>
                    <span>Duration: <strong>{Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days</strong></span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2: Target ── */}
          {step === 2 && (
            <div className="animate-fadeIn space-y-6">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-white">Define the Target</h2>
                <p className="text-gray-500 text-sm mt-1">Set the metric, threshold, and qualifying rules.</p>
              </div>

              {/* Target Metric Selector */}
              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                <label className="block text-sm font-medium text-gray-300 mb-4">Target Metric</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'total_sales', label: 'Total Sales', icon: '💰', desc: 'Revenue target' },
                    { id: 'product_qty', label: 'Product Qty', icon: '📦', desc: 'Units sold' },
                    { id: 'category_qty', label: 'Category Qty', icon: '🏷️', desc: 'Category units' },
                    { id: 'adv_payment', label: 'Adv Payment', icon: '💳', desc: 'Advance paid' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setTargetType(opt.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${targetType === opt.id
                          ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                          : 'bg-[#0B0C10] border-[#1F2937] hover:border-gray-600'
                        }`}
                    >
                      <span className="text-2xl block mb-2">{opt.icon}</span>
                      <div className={`text-sm font-semibold ${targetType === opt.id ? 'text-cyan-400' : 'text-white'}`}>{opt.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product/Category Selector */}
              {(targetType === 'product_qty' || targetType === 'category_qty') && (
                <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6 animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select {targetType === 'product_qty' ? 'Product' : 'Category'}
                  </label>
                  <select
                    value={selectedTargetItem}
                    onChange={e => setSelectedTargetItem(e.target.value)}
                    className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select...</option>
                    <option>XYZ Insecticide 1L</option>
                    <option>ABC Fertilizer 50kg</option>
                    <option>Fungicides Group</option>
                    <option>Herbicides Group</option>
                  </select>
                </div>
              )}

              {/* Target Value & Threshold — dynamic per metric */}
              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  {targetType === 'total_sales' && 'Sales Threshold'}
                  {targetType === 'product_qty' && 'Product Quantity Threshold'}
                  {targetType === 'category_qty' && 'Category Quantity Threshold'}
                  {targetType === 'adv_payment' && 'Advance Payment Threshold'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      {targetType === 'total_sales' && 'Minimum Revenue'}
                      {targetType === 'product_qty' && 'Minimum Units Sold'}
                      {targetType === 'category_qty' && 'Minimum Category Units'}
                      {targetType === 'adv_payment' && 'Minimum Advance Amount'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                        {(targetType === 'total_sales' || targetType === 'adv_payment') ? '₹' : '#'}
                      </span>
                      <input
                        type="number"
                        value={targetValue}
                        onChange={e => setTargetValue(e.target.value)}
                        placeholder={
                          targetType === 'total_sales' ? '50000' :
                            targetType === 'product_qty' ? '500' :
                              targetType === 'category_qty' ? '200' :
                                '25000'
                        }
                        className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl pl-8 pr-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Unit</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(targetType === 'total_sales' ? [
                        { id: 'amount', label: '₹ Revenue' },
                        { id: 'percentage', label: '% Growth' },
                        { id: 'quantity', label: '# Invoices' },
                      ] : targetType === 'product_qty' ? [
                        { id: 'quantity', label: 'Units' },
                        { id: 'amount', label: '₹ Value' },
                        { id: 'percentage', label: '% Growth' },
                      ] : targetType === 'category_qty' ? [
                        { id: 'quantity', label: 'Units' },
                        { id: 'amount', label: '₹ Value' },
                        { id: 'percentage', label: '% Growth' },
                      ] : [
                        { id: 'amount', label: '₹ Amount' },
                        { id: 'percentage', label: '% of Total' },
                        { id: 'quantity', label: '# Payments' },
                      ]).map(u => (
                        <button
                          key={u.id}
                          onClick={() => setTargetUnit(u.id)}
                          className={`py-2.5 rounded-lg border text-xs font-medium transition-all
                            ${targetUnit === u.id
                              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                              : 'bg-[#0B0C10] border-[#1F2937] text-gray-500 hover:text-gray-300 hover:border-gray-600'
                            }`}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {targetValue && (
                  <div className="mt-4 px-4 py-3 bg-cyan-500/5 rounded-xl border border-cyan-500/15 text-sm text-cyan-300 flex items-center gap-2">
                    <span>🎯</span>
                    <span>
                      {targetType === 'total_sales' && <>Recipients must achieve at least <strong>{targetUnit === 'amount' ? '₹' : ''}{Number(targetValue).toLocaleString()}{targetUnit === 'percentage' ? '% growth' : ''}{targetUnit === 'quantity' ? ' invoices' : ''}</strong> in total sales.</>}
                      {targetType === 'product_qty' && <>Recipients must sell at least <strong>{targetUnit === 'quantity' ? '' : targetUnit === 'amount' ? '₹' : ''}{Number(targetValue).toLocaleString()}{targetUnit === 'percentage' ? '% growth' : ''}{targetUnit === 'quantity' ? ' units' : ''}</strong> of <strong>{selectedTargetItem || 'selected product'}</strong>.</>}
                      {targetType === 'category_qty' && <>Recipients must sell at least <strong>{targetUnit === 'quantity' ? '' : targetUnit === 'amount' ? '₹' : ''}{Number(targetValue).toLocaleString()}{targetUnit === 'percentage' ? '% growth' : ''}{targetUnit === 'quantity' ? ' units' : ''}</strong> in <strong>{selectedTargetItem || 'selected category'}</strong>.</>}
                      {targetType === 'adv_payment' && <>Recipients must pay at least <strong>{targetUnit === 'amount' ? '₹' : ''}{Number(targetValue).toLocaleString()}{targetUnit === 'percentage' ? '% of total' : ''}{targetUnit === 'quantity' ? ' payments' : ''}</strong> as advance.</>}
                    </span>
                  </div>
                )}
              </div>

              {/* Qualifying Rules — dynamic per metric */}
              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    {targetType === 'total_sales' && 'Sales Qualifying Rules'}
                    {targetType === 'product_qty' && 'Product Qualifying Rules'}
                    {targetType === 'category_qty' && 'Category Qualifying Rules'}
                    {targetType === 'adv_payment' && 'Payment Qualifying Rules'}
                  </h3>
                  <span className="text-[10px] text-gray-600 bg-[#1F2937] px-2 py-1 rounded-full">
                    {rules.length} {rules.length === 1 ? 'rule' : 'rules'}
                  </span>
                </div>

                <div className="space-y-3">
                  {rules.map((rule, idx) => (
                    <div key={rule.id} className="flex items-center gap-2 animate-fadeIn">
                      {/* Row number */}
                      <span className="w-6 h-6 rounded-full bg-[#1F2937] text-gray-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {idx + 1}
                      </span>

                      {/* IF label */}
                      {idx === 0 && <span className="text-[10px] text-orange-400 font-bold uppercase w-8 flex-shrink-0">IF</span>}
                      {idx > 0 && <span className="text-[10px] text-gray-500 font-bold uppercase w-8 flex-shrink-0">AND</span>}

                      {/* Field — dynamic per targetType */}
                      <select
                        value={rule.field}
                        onChange={e => updateRule(rule.id, 'field', e.target.value)}
                        className="flex-1 bg-[#0B0C10] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-orange-500 min-w-0"
                      >
                        {targetType === 'total_sales' && (
                          <>
                            <optgroup label="💰 Sales Fields">
                              <option value="recipients.currentTO">Current Turnover</option>
                              <option value="recipients.avgDaily">Avg Daily Sales</option>
                              <option value="billings.amount">Invoice Amount</option>
                              <option value="billings.status">Billing Status</option>
                            </optgroup>
                            <optgroup label="👥 Recipient Filters">
                              <option value="recipients.region">Region</option>
                              <option value="recipients.category">Category</option>
                              <option value="recipients.type">Recipient Type</option>
                              <option value="recipients.paymentStatus">Payment Status</option>
                            </optgroup>
                            <optgroup label="📋 Scheme Params">
                              <option value="schemes.totalBudget">Total Budget</option>
                              <option value="schemes.rewardRate">Reward Rate</option>
                              <option value="schemes.maxQualifiers">Max Qualifiers</option>
                            </optgroup>
                          </>
                        )}
                        {targetType === 'product_qty' && (
                          <>
                            <optgroup label="📦 Product Fields">
                              <option value="recipients.products">Products Sold</option>
                              <option value="products.category">Product Category</option>
                              <option value="products.unitPrice">Unit Price</option>
                              <option value="products.subCategory">Sub-Category</option>
                            </optgroup>
                            <optgroup label="💰 Value Fields">
                              <option value="recipients.currentTO">Current Turnover</option>
                              <option value="billings.amount">Invoice Amount</option>
                              <option value="recipients.avgDaily">Avg Daily Sales</option>
                            </optgroup>
                            <optgroup label="👥 Recipient Filters">
                              <option value="recipients.region">Region</option>
                              <option value="recipients.category">Recipient Category</option>
                              <option value="recipients.type">Recipient Type</option>
                            </optgroup>
                          </>
                        )}
                        {targetType === 'category_qty' && (
                          <>
                            <optgroup label="🏷️ Category Fields">
                              <option value="products.category">Product Category</option>
                              <option value="products.subCategory">Sub-Category</option>
                              <option value="recipients.category">Recipient Category</option>
                              <option value="recipients.products">Products Handled</option>
                            </optgroup>
                            <optgroup label="💰 Value Fields">
                              <option value="recipients.currentTO">Current Turnover</option>
                              <option value="billings.amount">Invoice Amount</option>
                              <option value="recipients.avgDaily">Avg Daily Sales</option>
                            </optgroup>
                            <optgroup label="👥 Recipient Filters">
                              <option value="recipients.region">Region</option>
                              <option value="recipients.type">Recipient Type</option>
                              <option value="recipients.paymentStatus">Payment Status</option>
                            </optgroup>
                          </>
                        )}
                        {targetType === 'adv_payment' && (
                          <>
                            <optgroup label="💳 Payment Fields">
                              <option value="payments.amount">Payment Amount</option>
                              <option value="payments.mode">Payment Mode</option>
                              <option value="payments.status">Payment Status</option>
                              <option value="recipients.paymentStatus">Recipient Payment Status</option>
                            </optgroup>
                            <optgroup label="💰 Financial Fields">
                              <option value="recipients.currentTO">Current Turnover</option>
                              <option value="billings.amount">Invoice Amount</option>
                              <option value="billings.status">Billing Status</option>
                              <option value="payout_masters.payoutAmount">Payout Amount</option>
                            </optgroup>
                            <optgroup label="👥 Recipient Filters">
                              <option value="recipients.region">Region</option>
                              <option value="recipients.category">Category</option>
                              <option value="recipients.type">Recipient Type</option>
                            </optgroup>
                          </>
                        )}
                      </select>

                      {/* Operator */}
                      <select
                        value={rule.operator}
                        onChange={e => updateRule(rule.id, 'operator', e.target.value)}
                        className="w-20 bg-[#0B0C10] border border-[#1F2937] rounded-lg px-2 py-2 text-sm text-center text-gray-300 focus:outline-none focus:border-orange-500 font-mono flex-shrink-0"
                      >
                        <option value=">=">≥</option>
                        <option value="<=">≤</option>
                        <option value=">">{'>'}</option>
                        <option value="<">{'<'}</option>
                        <option value="==">= =</option>
                        <option value="!=">≠</option>
                        <option value="contains">contains</option>
                      </select>

                      {/* Value */}
                      <input
                        type="text"
                        value={rule.value}
                        onChange={e => updateRule(rule.id, 'value', e.target.value)}
                        placeholder="Value..."
                        className="w-32 bg-[#0B0C10] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500 flex-shrink-0"
                      />

                      {/* Remove */}
                      <button
                        onClick={() => removeRule(rule.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                          ${rules.length > 1 ? 'text-gray-600 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-800 cursor-default'}`}
                        disabled={rules.length <= 1}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Rule */}
                <button
                  onClick={addRule}
                  className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed border-[#1F2937] text-gray-500 hover:text-orange-400 hover:border-orange-500/30 transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Rule
                </button>
              </div>

              {/* Rules Summary */}
              {rules.some(r => r.value) && (
                <div className="bg-gradient-to-br from-[#111318] to-[#1a1c23] rounded-2xl border border-orange-500/15 p-5 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">📜</span>
                    <h4 className="text-sm font-bold text-white">Rule Summary</h4>
                  </div>
                  <div className="space-y-1.5">
                    {targetValue && (
                      <p className="text-xs text-gray-400">
                        <span className="text-cyan-400 font-semibold">Target:</span> Achieve
                        {targetUnit === 'amount' ? ' ₹' : ' '}{Number(targetValue).toLocaleString()}{targetUnit === 'percentage' ? '%' : ''}{targetUnit === 'quantity' ? ' units' : ''} in {targetType.replace('_', ' ')}
                      </p>
                    )}
                    {rules.filter(r => r.value).map((rule, i) => (
                      <p key={rule.id} className="text-xs text-gray-400">
                        <span className="text-orange-400 font-semibold">{i === 0 ? 'If' : 'And'}:</span>{' '}
                        <span className="text-gray-500 font-mono text-[10px]">{rule.field.split('.')[0]}</span>
                        <span className="text-gray-600 mx-0.5">.</span>
                        <span className="text-gray-300">{rule.field.split('.')[1]?.replace(/([A-Z])/g, ' $1').trim() || rule.field}</span>{' '}
                        <span className="text-gray-500 font-mono">{rule.operator}</span>{' '}
                        <span className="text-white font-medium">{rule.value}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Budget ── */}
          {step === 3 && (
            <div className="animate-fadeIn space-y-6">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-white">Set the Budget</h2>
                <p className="text-gray-500 text-sm mt-1">Define financial limits and reward logic for this scheme.</p>
              </div>

              {/* Budget Allocation */}
              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Budget Allocation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Total Budget</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">₹</span>
                      <input
                        type="number"
                        value={totalBudget}
                        onChange={e => setTotalBudget(e.target.value)}
                        placeholder="1,00,000"
                        className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl pl-8 pr-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-green-500 transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1">Maximum amount allocated for this scheme</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Max Qualifiers</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">#</span>
                      <input
                        type="number"
                        value={maxQualifiers}
                        onChange={e => setMaxQualifiers(e.target.value)}
                        placeholder="100"
                        className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl pl-8 pr-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-green-500 transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1">Max recipients who can earn rewards</p>
                  </div>
                </div>
                {totalBudget && maxQualifiers && (
                  <div className="mt-4 px-4 py-2.5 bg-green-500/5 rounded-xl border border-green-500/15 text-xs text-green-300 flex items-center gap-2">
                    <span>💡</span>
                    <span>Budget per qualifier: <strong>₹{(parseFloat(totalBudget) / parseInt(maxQualifiers)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></span>
                  </div>
                )}

                {/* Interest Controls */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 hidden">
                  {/* Interest Free Period Textbox */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="block text-xs font-medium text-gray-500">Interest Free Period</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={interestFreePeriod === 0 ? '' : interestFreePeriod}
                        onChange={(e) => setInterestFreePeriod(e.target.value ? parseInt(e.target.value) : 0)}
                        placeholder="0"
                        className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-green-500 transition-all pr-12"
                      />
                      <span className="absolute right-4 text-gray-500 text-sm font-bold pointer-events-none">Days</span>
                    </div>
                  </div>

                  {/* Interest Above Target Textbox */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="block text-xs font-medium text-gray-500">Interest Above Target</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={interestAboveTarget === '' ? '' : interestAboveTarget}
                        onChange={(e) => setInterestAboveTarget(e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="1.5"
                        className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-green-500 transition-all pr-8"
                      />
                      <span className="absolute right-4 text-gray-500 text-sm font-bold pointer-events-none">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward Logic */}
              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6 mt-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Reward Logic
                </h3>

                <div className="bg-[#0B0C10] border border-[#1F2937] rounded-xl p-4 w-full">
                  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <label className="text-sm font-semibold text-gray-200">Payout Structure</label>

                    <div className="flex bg-[#1F2937] rounded p-0.5 gap-0.5 overflow-x-auto custom-scrollbar flex-nowrap hide-scrollbar">
                      <button
                        onClick={() => { setPayoutType('Fixed Amount'); setPayoutAmount(1000); }}
                        className={`text-xs px-3 py-1.5 rounded transition-colors whitespace-nowrap ${payoutType === 'Fixed Amount' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium' : 'text-gray-400 hover:text-white'} `}
                      >
                        Fixed
                      </button>
                      <button
                        onClick={() => { setPayoutType('Fixed Calculated'); setPayoutAmount(5); }}
                        className={`text-xs px-3 py-1.5 rounded transition-colors whitespace-nowrap ${payoutType === 'Fixed Calculated' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium' : 'text-gray-400 hover:text-white'} `}
                      >
                        %
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Value ({payoutType === 'Fixed Amount' ? '₹' : '%'})</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max={payoutType === 'Fixed Amount' ? 50000 : payoutType === 'Fixed Calculated' ? 25 : 5000}
                        step={payoutType === 'Fixed Amount' ? 500 : payoutType === 'Fixed Calculated' ? 0.5 : 50}
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 touch-pan-x"
                      />
                      <div className="relative min-w-[100px]">
                        {payoutType !== 'Fixed Calculated' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>}
                        <input
                          type="number"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value ? parseFloat(e.target.value) : 0)}
                          className={`w-full bg-[#111318] border border-[#1F2937] rounded-lg py-2 ${payoutType !== 'Fixed Calculated' ? 'pl-7' : 'pl-3'} pr-3 text-white font-mono text-sm focus:outline-none focus:border-emerald-500`}
                        />
                        {payoutType === 'Fixed Calculated' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                      <span>0</span>
                      <span>Max: {payoutType === 'Fixed Amount' ? '50,000' : payoutType === 'Fixed Calculated' ? '25%' : '5,000'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Dashboard */}
              <div className="bg-gradient-to-br from-[#111318] to-[#1a1c23] rounded-2xl border border-green-500/20 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Live Budget Preview
                </h3>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="bg-[#0B0C10] rounded-xl p-3.5 border border-[#1F2937]">
                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider mb-1">Payout / Person</p>
                    <p className="text-xl font-bold text-white font-mono">
                      ₹{payoutPerPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-[#0B0C10] rounded-xl p-3.5 border border-[#1F2937]">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Est. Total Payout</p>
                    <p className="text-xl font-bold text-gray-300 font-mono">
                      ₹{estimatedTotalPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-[#0B0C10] rounded-xl p-3.5 border border-[#1F2937]">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Budget Remaining</p>
                    <p className={`text-xl font-bold font-mono ${parseFloat(totalBudget) > 0 && estimatedTotalPayout > parseFloat(totalBudget)
                      ? 'text-red-400' : 'text-gray-300'
                      }`}>
                      ₹{(Math.max(0, (parseFloat(totalBudget) || 0) - estimatedTotalPayout)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-[#0B0C10] rounded-xl p-3.5 border border-[#1F2937]">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Cost Per ₹1 Sale</p>
                    <p className="text-xl font-bold text-gray-300 font-mono">
                      ₹{payoutType === 'Fixed Calculated' ? (payoutAmount / 100).toFixed(3) :
                        (payoutAmount / (parseFloat(targetValue) || 10000)).toFixed(3)}
                    </p>
                  </div>
                </div>

                {/* Budget Utilization Bar */}
                {parseFloat(totalBudget) > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">Budget Utilization</span>
                      <span className={`font-bold ${budgetUtilization > 100 ? 'text-red-400' :
                        budgetUtilization > 90 ? 'text-orange-400' :
                          budgetUtilization > 70 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                        {budgetUtilization.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#1F2937] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${budgetUtilization > 100 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                          budgetUtilization > 90 ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                            budgetUtilization > 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                              'bg-gradient-to-r from-green-500 to-emerald-400'
                          }`}
                        style={{ width: `${Math.min(100, budgetUtilization)}%` }}
                      ></div>
                    </div>

                    {/* Status Messages */}
                    {budgetUtilization > 100 && (
                      <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/8 rounded-lg px-3 py-2 border border-red-500/15">
                        <span>⚠️</span>
                        <span>Estimated payout <strong>exceeds budget</strong> by ₹{(estimatedTotalPayout - parseFloat(totalBudget)).toLocaleString(undefined, { maximumFractionDigits: 0 })}. Reduce qualifiers or reward rate.</span>
                      </div>
                    )}
                    {budgetUtilization > 70 && budgetUtilization <= 100 && (
                      <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/5 rounded-lg px-3 py-2 border border-yellow-500/10">
                        <span>💡</span>
                        <span>{budgetUtilization > 90 ? 'Budget is nearly fully allocated.' : 'Good budget utilization.'} {(100 - budgetUtilization).toFixed(0)}% headroom remaining.</span>
                      </div>
                    )}
                    {budgetUtilization > 0 && budgetUtilization <= 70 && (
                      <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/5 rounded-lg px-3 py-2 border border-green-500/10">
                        <span>✅</span>
                        <span>Healthy budget margin. ₹{((parseFloat(totalBudget) || 0) - estimatedTotalPayout).toLocaleString(undefined, { maximumFractionDigits: 0 })} available as buffer.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 4: Audience ── */}
          {step === 4 && (
            <div className="animate-fadeIn space-y-6">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-white">Choose the Audience</h2>
                <p className="text-gray-500 text-sm mt-1">Define who qualifies for this scheme.</p>
              </div>

              {/* Recipient Type */}
              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Recipient Type
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'customer', label: 'Customer', icon: '🏪', desc: 'Retail buyers & shop owners who purchase directly', count: '2,400+' },
                    { id: 'distributor', label: 'Distributor', icon: '🚛', desc: 'Wholesale partners managing regional supply', count: '350+' },
                    { id: 'sales_exec', label: 'Sales Team', icon: '👔', desc: 'Internal sales reps & field executives', count: '120+' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setRecipientType(opt.id)}
                      className={`p-5 rounded-xl border-2 text-left transition-all duration-200
                        ${recipientType === opt.id
                          ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                          : 'bg-[#0B0C10] border-[#1F2937] hover:border-gray-600'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{opt.icon}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${recipientType === opt.id ? 'bg-purple-500/20 text-purple-400' : 'bg-[#1F2937] text-gray-500'
                          }`}>{opt.count}</span>
                      </div>
                      <div className={`text-sm font-semibold mb-1 ${recipientType === opt.id ? 'text-purple-400' : 'text-white'}`}>{opt.label}</div>
                      <div className="text-[10px] text-gray-500 leading-relaxed">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Region Selection */}
              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Geography
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { id: 'all', label: 'All India', icon: '🇮🇳', desc: 'Pan-India' },
                    { id: 'north', label: 'North', icon: '⬆️', desc: 'UP, Delhi, Punjab...' },
                    { id: 'south', label: 'South', icon: '⬇️', desc: 'TN, KA, KL, AP...' },
                    { id: 'east', label: 'East', icon: '➡️', desc: 'WB, Bihar, Odisha...' },
                    { id: 'west', label: 'West', icon: '⬅️', desc: 'MH, GJ, Rajasthan...' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setRegionFilter(opt.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all duration-200
                        ${regionFilter === opt.id
                          ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                          : 'bg-[#0B0C10] border-[#1F2937] hover:border-gray-600'
                        }`}
                    >
                      <span className="text-xl block mb-1">{opt.icon}</span>
                      <div className={`text-xs font-semibold ${regionFilter === opt.id ? 'text-indigo-400' : 'text-white'}`}>{opt.label}</div>
                      <div className="text-[9px] text-gray-600 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                  Category Filter
                  <span className="text-[10px] text-gray-600 font-normal normal-case ml-1">(optional)</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    { id: 'all', label: 'All Categories', icon: '📊' },
                    { id: 'gold', label: 'Gold', icon: '🥇' },
                    { id: 'silver', label: 'Silver', icon: '🥈' },
                    { id: 'bronze', label: 'Bronze', icon: '🥉' },
                    { id: 'platinum', label: 'Platinum', icon: '💎' },
                    { id: 'new', label: 'New Joiners', icon: '🌱' },
                    { id: 'active', label: 'Active Only', icon: '✅' },
                    { id: 'dormant', label: 'Dormant', icon: '💤' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left
                        ${categoryFilter === cat.id
                          ? 'bg-violet-500/10 border-violet-500/40 text-violet-400'
                          : 'bg-[#0B0C10] border-[#1F2937] text-gray-400 hover:border-gray-600 hover:text-gray-300'
                        }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience Summary */}
              <div className="bg-gradient-to-br from-[#111318] to-[#1a1c23] rounded-2xl border border-purple-500/15 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base">👥</span>
                  <h4 className="text-sm font-bold text-white">Audience Summary</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0B0C10] rounded-xl p-3.5 border border-[#1F2937] text-center">
                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">Type</p>
                    <p className="text-sm font-bold text-white capitalize">{recipientType.replace('_', ' ') || 'All'}</p>
                  </div>
                  <div className="bg-[#0B0C10] rounded-xl p-3.5 border border-[#1F2937] text-center">
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Region</p>
                    <p className="text-sm font-bold text-white capitalize">{regionFilter === 'all' ? 'All India' : regionFilter || 'All'}</p>
                  </div>
                  <div className="bg-[#0B0C10] rounded-xl p-3.5 border border-[#1F2937] text-center">
                    <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mb-1">Category</p>
                    <p className="text-sm font-bold text-white capitalize">{categoryFilter === 'all' ? 'All' : categoryFilter}</p>
                  </div>
                </div>
                <div className="mt-3 px-4 py-2.5 bg-purple-500/5 rounded-xl border border-purple-500/10 text-xs text-purple-300 flex items-center gap-2">
                  <span>📢</span>
                  <span>
                    This scheme targets <strong>{recipientType === 'customer' ? 'customers' : recipientType === 'distributor' ? 'distributors' : recipientType === 'sales_exec' ? 'sales team members' : 'all recipients'}</strong>
                    {categoryFilter !== 'all' && <> in the <strong>{categoryFilter}</strong> category</>}
                    {regionFilter && regionFilter !== 'all' ? <> in the <strong>{regionFilter}</strong> region</> : <> across <strong>all regions</strong></>}.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Review ── */}
          {step === 5 && (
            <div className="animate-fadeIn space-y-5">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-white">Review & Launch</h2>
                <p className="text-gray-500 text-sm mt-1">Verify all details before launching your scheme.</p>
              </div>

              {/* Hero — Scheme Identity */}
              <div className="bg-gradient-to-br from-[#111318] to-[#1a1c23] rounded-2xl border border-cyan-500/20 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-2xl border border-cyan-500/20">
                        📋
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{schemeName || 'Untitled Scheme'}</h3>
                        {description && <p className="text-sm text-gray-400 mt-1 max-w-md">{description}</p>}
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                      Draft
                    </span>
                  </div>
                  {(startDate || endDate) && (
                    <div className="mt-4 flex items-center gap-3 text-sm">
                      <span className="text-gray-600">📅</span>
                      {startDate && <span className="text-gray-300">{new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {startDate && endDate && <span className="text-gray-600">→</span>}
                      {endDate && <span className="text-gray-300">{new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {startDate && endDate && (
                        <span className="text-xs text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full font-medium">
                          {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Two-Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Target & Rules */}
                <div className="bg-[#111318] rounded-2xl border border-[#1F2937] overflow-hidden">
                  <div className="p-4 border-b border-[#1F2937] flex items-center gap-2.5 bg-gradient-to-r from-cyan-500/5 to-transparent">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-sm">🎯</div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Target & Rules</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Metric</p>
                        <p className="text-sm font-semibold text-cyan-400">{targetType.replace('_', ' ').toUpperCase()}</p>
                      </div>
                      {targetValue && (
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Threshold</p>
                          <p className="text-sm font-semibold text-white font-mono">
                            {targetUnit === 'amount' ? '₹' : ''}{Number(targetValue).toLocaleString()}{targetUnit === 'percentage' ? '%' : ''}{targetUnit === 'quantity' ? ' units' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedTargetItem && (
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Target Item</p>
                        <p className="text-sm font-semibold text-white">{selectedTargetItem}</p>
                      </div>
                    )}
                    {rules.some(r => r.value) && (
                      <div className="bg-[#0B0C10] rounded-xl border border-[#1F2937] p-3 mt-2">
                        <p className="text-[9px] text-orange-400 font-bold uppercase tracking-wider mb-2">Rules</p>
                        <div className="space-y-1">
                          {rules.filter(r => r.value).map((rule, i) => (
                            <p key={rule.id} className="text-[11px] text-gray-400 leading-relaxed">
                              <span className="text-orange-400 font-bold">{i === 0 ? 'IF' : 'AND'}</span>{' '}
                              <span className="text-gray-500 font-mono text-[9px]">{rule.field.split('.')[0]}</span>
                              <span className="text-gray-600">.</span>
                              <span className="text-gray-300">{rule.field.split('.')[1]?.replace(/([A-Z])/g, ' $1').trim() || rule.field}</span>{' '}
                              <span className="text-gray-500 font-mono">{rule.operator}</span>{' '}
                              <span className="text-white font-semibold">{rule.value}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget & Rewards */}
                <div className="bg-[#111318] rounded-2xl border border-[#1F2937] overflow-hidden">
                  <div className="p-4 border-b border-[#1F2937] flex items-center gap-2.5 bg-gradient-to-r from-green-500/5 to-transparent">
                    <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center text-sm">💰</div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Budget & Rewards</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {totalBudget && (
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Budget</p>
                          <p className="text-sm font-semibold text-green-400 font-mono">₹{Number(totalBudget).toLocaleString()}</p>
                        </div>
                      )}
                      {maxQualifiers && (
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Max Qualifiers</p>
                          <p className="text-sm font-semibold text-white">{maxQualifiers}</p>
                        </div>
                      )}
                      {payoutType && (
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Payout Type</p>
                          <p className="text-sm font-semibold text-white">{payoutType}</p>
                        </div>
                      )}
                      {payoutAmount !== undefined && (
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Payout Value</p>
                          <p className="text-sm font-semibold text-white">
                            {payoutType === 'Fixed Amount' || payoutType === 'Per Item Discount' ? `₹${payoutAmount.toLocaleString()}` : `${payoutAmount}%`}
                          </p>
                        </div>
                      )}
                    </div>
                    {payoutPerPerson > 0 && (
                      <div className="bg-green-500/5 rounded-xl border border-green-500/15 p-3 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-green-400 font-bold uppercase tracking-widest">Per Person</p>
                          <p className="text-lg font-bold text-white font-mono">₹{payoutPerPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Est. Total</p>
                          <p className="text-base font-bold text-gray-300 font-mono">₹{estimatedTotalPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                      </div>
                    )}
                    {parseFloat(totalBudget) > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-[#1F2937] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${budgetUtilization > 100 ? 'bg-red-500' :
                              budgetUtilization > 90 ? 'bg-orange-500' :
                                budgetUtilization > 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                            style={{ width: `${Math.min(100, budgetUtilization)}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold ${budgetUtilization > 100 ? 'text-red-400' :
                          budgetUtilization > 70 ? 'text-yellow-400' : 'text-green-400'
                          }`}>{budgetUtilization.toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Audience (full width) */}
              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] overflow-hidden">
                <div className="p-4 border-b border-[#1F2937] flex items-center gap-2.5 bg-gradient-to-r from-purple-500/5 to-transparent">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-sm">👥</div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Audience</h4>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Recipient Type</p>
                      <p className="text-sm font-semibold text-purple-400 capitalize">{recipientType === 'sales_exec' ? 'Sales Team' : recipientType}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Region</p>
                      <p className="text-sm font-semibold text-white capitalize">{regionFilter === 'all' ? 'All India' : regionFilter}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Category</p>
                      <p className="text-sm font-semibold text-white capitalize">{categoryFilter === 'all' ? 'All Categories' : categoryFilter}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Readiness Checklist */}
              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  Launch Checklist
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Scheme Named', ok: !!schemeName },
                    { label: 'Dates Set', ok: !!startDate && !!endDate },
                    { label: 'Target Defined', ok: !!targetType && !!targetValue },
                    { label: 'Budget Set', ok: !!totalBudget },
                    { label: 'Rules Added', ok: rules.some(r => r.value) },
                    { label: 'Audience Selected', ok: !!recipientType },
                    { label: 'Region Picked', ok: !!regionFilter },
                    { label: 'Within Budget', ok: budgetUtilization <= 100 },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${item.ok
                      ? 'bg-green-500/5 border-green-500/20 text-green-400'
                      : 'bg-[#0B0C10] border-[#1F2937] text-gray-500'
                      }`}>
                      <span>{item.ok ? '✅' : '⬜'}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-8 py-4 border-t border-[#1F2937] bg-[#111318]/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2
              ${step === 1 ? 'text-gray-700 cursor-default' : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'}`}
            disabled={step === 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map(s => (
              <div key={s.id} className={`w-2 h-2 rounded-full transition-all ${step === s.id ? 'bg-cyan-400 w-6' : s.id < step ? 'bg-cyan-500/40' : 'bg-[#1F2937]'}`}></div>
            ))}
          </div>

          {step < 5 ? (
            <button
              onClick={() => setStep(s => Math.min(5, s + 1))}
              disabled={!canProceed()}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                ${canProceed()
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-[#1F2937] text-gray-600 cursor-not-allowed'
                }`}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Launching...
                </>
              ) : (
                <>
                  🚀 Launch Scheme
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div >
  );
};

export default CreateSchemeTab;
