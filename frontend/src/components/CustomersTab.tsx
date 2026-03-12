import { useState, useMemo, useEffect, useRef } from 'react';
import type { Recipient } from '../types';
import { fetchRecipients, fetchAllSchemeConfigs, fetchFilterColumnValues, fetchDatasets } from '../api';

const CustomersTab = () => {
  // Load initial state from localStorage
  const savedState = (() => {
    try {
      const saved = localStorage.getItem('schemeSimulatorState');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  })();

  // Top Controls
  const [recipientType, setRecipientType] = useState(savedState.recipientType || 'Customer');
  const [targetMetric, setTargetMetric] = useState(savedState.targetMetric || 'Sales');
  interface FilterRule {
    id: string;
    field: string;
    operator: string;
    value: string;
  }
  const [activeRules, setActiveRules] = useState<FilterRule[]>(savedState.activeRules || []);
  const [appliedRules, setAppliedRules] = useState<FilterRule[]>(savedState.appliedRules || []);
  const [filterOperator] = useState<'AND' | 'OR'>(savedState.filterOperator || 'AND');
  const [fieldValues, setFieldValues] = useState<Record<string, string[]>>({});

  // Date Controls
  const [startDate, setStartDate] = useState(savedState.startDate || '');
  const [endDate, setEndDate] = useState(savedState.endDate || '');
  // Simulation Controls
  const [durationDays, setDurationDays] = useState(savedState.durationDays ?? 0);
  const [isInterestEnabled, setIsInterestEnabled] = useState(savedState.isInterestEnabled || false);
  const [targetThreshold, setTargetThreshold] = useState(savedState.targetThreshold || 500000);
  const [payoutAmount, setPayoutAmount] = useState(savedState.payoutAmount || 1000);
  const [payoutType, setPayoutType] = useState(savedState.payoutType || 'Fixed Amount');
  const [interestFreePeriod, setInterestFreePeriod] = useState(savedState.interestFreePeriod || 0);
  const [interestRate, setinterestRate] = useState<number | ''>(savedState.interestRate ?? '');
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Tiers
  interface Tier {
    id: string;
    targetThreshold: number;
    payoutType: string;
    payoutAmount: number;
    durationDays: number;
  }
  const [tiers, setTiers] = useState<Tier[]>(savedState.tiers || []);

  // API Data
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterGroups, setFilterGroups] = useState<{ name: string; options: string[] }[]>([]);

  // Load recipients from API
  const loadRecipients = async () => {
    setLoading(true);
    try {
      const data = await fetchRecipients({ recipientType: recipientType.toLowerCase() });
      setRecipients(data);
    } catch (err) {
      console.error('Failed to load recipients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load filter options — shows configured table → column names
  const loadFilterOptions = async () => {
    // Prefer localStorage (set by SchemeConfig tab when a config is loaded)
    let config: Record<string, string[]> | null = null;
    try {
      const saved = localStorage.getItem('schemeConfig');
      if (saved) config = JSON.parse(saved);
    } catch { /* ignore */ }

    // Fall back to API if localStorage is empty
    if (!config) {
      try {
        const configs = await fetchAllSchemeConfigs();
        if (configs && configs.length > 0) {
          config = configs[0].config;
        }
      } catch { /* ignore */ }
    }

    if (config && Object.keys(config).length > 0) {
      // Build filter groups: table name → its selected column names
      const groups = Object.entries(config)
        .filter(([, fields]) => fields.length > 0)
        .map(([tableName, fields]) => ({
          name: tableName.charAt(0).toUpperCase() + tableName.slice(1),
          options: fields.filter(f => f !== 'id' && !f.endsWith('Id') && f !== 'createdAt' && f !== 'updatedAt'),
        }))
        .filter(g => g.options.length > 0);

      groups.unshift({
        name: 'Matching Rule',
        options: ['Contains', 'Equals (=)', 'Not Equals (!=)', 'Greater Than (>)', 'Less Than (<)', 'Greater/Equal (≥)', 'Less/Equal (≤)', 'In']
      });

      if (groups.length > 1) {
        setFilterGroups(groups);
        return;
      }
    }

    // Fallback — load from datasets metadata API
    try {
      const datasets = await fetchDatasets();
      if (datasets && datasets.length > 0) {
        const groups = datasets
          .map(ds => ({
            name: ds.name.charAt(0).toUpperCase() + ds.name.slice(1),
            options: ds.fields
              .map(f => f.name)
              .filter(f => f !== 'id' && !f.endsWith('Id') && f !== 'createdAt' && f !== 'updatedAt'),
          }))
          .filter(g => g.options.length > 0);

        groups.unshift({
          name: 'Matching Rule',
          options: ['Contains', 'Equals (=)', 'Not Equals (!=)', 'Greater Than (>)', 'Less Than (<)', 'Greater/Equal (≥)', 'Less/Equal (≤)', 'In']
        });

        setFilterGroups(groups);
      }
    } catch (err) {
      console.error('Failed to load dynamic filter options:', err);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, [recipientType]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    const state = {
      recipientType,
      targetMetric,
      activeRules,
      appliedRules,
      filterOperator,
      startDate,
      endDate,
      durationDays,
      isInterestEnabled,
      targetThreshold,
      payoutAmount,
      payoutType,
      interestFreePeriod,
      interestRate,
      tiers,
    };
    localStorage.setItem('schemeSimulatorState', JSON.stringify(state));
  }, [
    recipientType, targetMetric, activeRules, appliedRules, filterOperator,
    startDate, endDate, durationDays, isInterestEnabled, targetThreshold,
    payoutAmount, payoutType, interestFreePeriod, interestRate, tiers
  ]);

  const fetchValuesForField = async (field: string) => {
    if (!field || fieldValues[field]) return;

    const parts = field.split('.');
    if (parts.length !== 2) return;

    const [table, column] = parts;
    try {
      const values = await fetchFilterColumnValues(table.toLowerCase(), column);
      setFieldValues(prev => ({ ...prev, [field]: values }));
    } catch (err) {
      console.error(`Failed to fetch values for ${field}:`, err);
    }
  };

  // Reload and apply filters
  const handleLoad = () => {
    setAppliedRules([...activeRules]);
    loadRecipients();
  };

  const activeTiers = useMemo(() => {
    if (tiers.length >= 3) return tiers;
    return [...tiers, { id: 'draft', targetThreshold, payoutType, payoutAmount, durationDays }];
  }, [tiers, targetThreshold, payoutType, payoutAmount, durationDays]);

  // Computations
  const simulatedData = useMemo(() => {
    return recipients.map(r => {
      // Find qualifying tier first based on total T.O.
      // Since different tiers can have different durations now, we need to check if they hit the target *for that tier's duration*
      let qualifyingTier: Tier | undefined;
      let finalTotalTO = Number(r.currentTO);
      let finalProjectedTO = 0;

      // Sort tiers shortest duration to longest. Reaching the target in fewer days is harder,
      // so we prioritize the shortest duration (which usually has the highest payout).
      const sortedTiers = [...activeTiers].sort((a, b) => {
        if (a.durationDays !== b.durationDays) return a.durationDays - b.durationDays;
        return b.targetThreshold - a.targetThreshold;
      });

      for (const tier of sortedTiers) {
        let qualifies = false;
        const projected = Number(r.avgDaily) * tier.durationDays;
        const total = Number(r.currentTO) + projected;

        if (targetMetric === 'Payment') {
          if (r.invoiceDate && r.paymentDate) {
            const invDate = new Date(r.invoiceDate);
            const payDate = new Date(r.paymentDate);
            if (payDate >= invDate) {
              const diffTime = payDate.getTime() - invDate.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays <= tier.durationDays && total >= tier.targetThreshold) {
                qualifies = true;
              }
            }
          }
        } else {
          if (total >= tier.targetThreshold) {
            qualifies = true;
          }
        }

        if (qualifies) {
          qualifyingTier = tier;
          finalTotalTO = total;
          finalProjectedTO = projected;
          break; // They qualify for this tier, stop checking smaller ones
        }
      }

      // If they don't qualify for any, use the draft tier's duration for base display
      if (!qualifyingTier) {
        finalProjectedTO = Number(r.avgDaily) * durationDays;
        finalTotalTO = Number(r.currentTO) + finalProjectedTO;
      }

      return {
        ...r,
        projectedTO: finalProjectedTO,
        totalTO: finalTotalTO,
        isQualifying: !!qualifyingTier,
        qualifyingTier
      };
    });
  }, [recipients, durationDays, activeTiers, targetMetric]);

  // Multi-Filter Logic
  const filteredData = useMemo(() => {
    let data = [...simulatedData];

    if (appliedRules.length > 0) {
      data = data.filter(r => {

        const evaluateRule = (rule: FilterRule, row: any) => {
          if (!rule.field || !rule.value) return true; // Ignore incomplete rules

          // Determine the actual field value from the row based on the field name
          let fieldVal: any = null;
          let searchField = rule.field.toLowerCase();

          // If the field has a Table.Column format, strip the table prefix
          if (searchField.includes('.')) {
            searchField = searchField.split('.')[1];
          }

          if (searchField === 'turnover' || searchField === 'currentto') {
            fieldVal = row.currentTO;
          } else if (searchField === 'id') {
            fieldVal = row.id;
          } else if (searchField === 'name' || searchField === 'recipient') {
            fieldVal = row.name;
          } else {
            // Try to find the property on the row (case-insensitive)
            // Also check for camelCase variants if not found
            const rowKeys = Object.keys(row);
            const rowKey = rowKeys.find(k => k.toLowerCase() === searchField) ||
              rowKeys.find(k => k.toLowerCase() === searchField.replace(/_/g, ''));

            if (rowKey) {
              fieldVal = row[rowKey];
            } else {
              fieldVal = row[searchField];
            }
          }

          // Standardize comma-separated values to an array
          const ruleVals = rule.value.split(',').map(v => v.trim()).filter(Boolean);
          if (ruleVals.length === 0) return true;

          let matches = false;

          for (const rv of ruleVals) {
            const rvLower = rv.toLowerCase();
            const checkObj = (obj: any): boolean => {
              if (obj === null || obj === undefined) return false;
              if (Array.isArray(obj)) return obj.some(item => checkObj(item));

              const strObj = String(obj).toLowerCase();

              // If it's a comma-separated string, treat it like an array for matching
              if (strObj.includes(',') && !strObj.includes('-')) { // ignore date strings or negative numbers
                return strObj.split(',').map(s => s.trim()).some(item => {
                  const subNumObj = Number(item);
                  const isSubNum = !isNaN(subNumObj) && !isNaN(numVal) && rv.trim() !== '';

                  switch (rule.operator) {
                    case 'Equals (=)': return isSubNum ? subNumObj === numVal : item === rvLower;
                    case 'Not Equals (!=)': return isSubNum ? subNumObj !== numVal : item !== rvLower;
                    case 'Contains': return item.includes(rvLower);
                    case 'In': return isSubNum ? subNumObj === numVal : item === rvLower;
                    default: return item === rvLower;
                  }
                });
              }

              const numObj = Number(obj);
              const numVal = Number(rv);
              // Only use numeric comparison if both are valid numbers AND it's not simply an empty space check
              const isNum = !isNaN(numObj) && !isNaN(numVal) && rv.trim() !== '';

              switch (rule.operator) {
                case 'Equals (=)': return isNum ? numObj === numVal : strObj === rvLower;
                case 'Not Equals (!=)': return strObj !== rvLower;
                case 'Contains': return strObj.includes(rvLower);
                case 'Greater Than (>)': return isNum ? numObj > numVal : strObj > rvLower;
                case 'Less Than (<)': return isNum ? numObj < numVal : strObj < rvLower;
                case 'Greater/Equal (≥)': return isNum ? numObj >= numVal : strObj >= rvLower;
                case 'Less/Equal (≤)': return isNum ? numObj <= numVal : strObj <= rvLower;
                case 'In': return isNum ? numObj === numVal : strObj === rvLower; // Existing loop handles 'In' behavior (any value match)
                default: return strObj === rvLower;
              }
            };

            if (checkObj(fieldVal)) {
              matches = true;
              break; // One of the comma separated values matched.
            }
          }

          return matches;
        };

        if (filterOperator === 'OR') {
          return appliedRules.some(rule => evaluateRule(rule, r));
        } else {
          return appliedRules.every(rule => evaluateRule(rule, r));
        }
      });
    }

    data = data.sort((a, b) => {
      // Sort qualified customers to the top
      if (a.isQualifying && !b.isQualifying) return -1;
      if (!a.isQualifying && b.isQualifying) return 1;
      // If both have the same qualification status, sort by total turnover
      return b.totalTO - a.totalTO;
    });
    return data;
  }, [simulatedData, appliedRules, filterGroups, filterOperator]);

  const stats = useMemo(() => {
    // We must sort tiers by duration first to properly show consecutive Tier ranges in the table labels
    const sortedActiveTiers = [...activeTiers].sort((a, b) => {
      if (a.durationDays !== b.durationDays) return a.durationDays - b.durationDays;
      return b.targetThreshold - a.targetThreshold;
    });

    const breakdown = sortedActiveTiers.map(tier => {
      const qualifyingRows = filteredData.filter(r => r.qualifyingTier?.id === tier.id);
      const count = qualifyingRows.length;
      let budget = 0;
      qualifyingRows.forEach(recipient => {
        if (tier.payoutType.toLowerCase().includes('fixed')) budget += tier.payoutAmount;
        else if (tier.payoutType.toLowerCase().includes('percent')) budget += recipient.totalTO * (tier.payoutAmount / 100);
        else if (tier.payoutType.toLowerCase().includes('perpiece')) budget += Math.floor(recipient.totalTO / 100) * tier.payoutAmount;
        else if (tier.payoutType.toLowerCase().includes('custom')) budget += tier.payoutAmount;
      });
      return { tier, count, budget };
    });

    const totalBudget = breakdown.reduce((sum, b) => sum + b.budget, 0);
    const totalQualifiers = breakdown.reduce((sum, b) => sum + b.count, 0);

    return { sortedActiveTiers, breakdown, totalBudget, totalQualifiers };
  }, [filteredData, activeTiers]);

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
              <option>Quantity</option>
              <option>CatQuantity</option>
              <option>Payment</option>
            </select>
            <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 min-w-[150px]">
          <label className="text-[10px] text-gray-400 ml-1 uppercase tracking-wide">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[#111318] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm w-full focus:border-cyan-500 outline-none text-white [color-scheme:dark]"
          />
        </div>

        <div className="flex flex-col gap-0.5 min-w-[150px]">
          <label className="text-[10px] text-gray-400 ml-1 uppercase tracking-wide">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[#111318] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm w-full focus:border-cyan-500 outline-none text-white [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Filter Rules Builder - Full Width */}
      <div className="w-full flex flex-col gap-2 relative z-20 bg-[#111318]/40 p-3 rounded-xl border border-[#1F2937]">

        {/* Active Rules Builder */}
        <div className="flex flex-col gap-2 w-full">
          {activeRules.map((rule, idx) => (
            <div key={rule.id} className="flex flex-wrap lg:flex-nowrap gap-3 items-end bg-[#1F2937]/50 p-2.5 rounded-lg border border-[#1F2937] w-full animate-fadeIn">
              <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Collection.Field</label>
                <select
                  value={rule.field}
                  onChange={(e) => {
                    const newRules = [...activeRules];
                    newRules[idx].field = e.target.value;
                    setActiveRules(newRules);
                  }}
                  className="bg-[#111318] border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-300 outline-none focus:border-cyan-500 appearance-none h-[34px]"
                >
                  <option value="">Select field</option>
                  {filterGroups.filter(g => g.name !== 'Matching Rule').map(group => (
                    <optgroup key={group.name} label={group.name}>
                      {group.options.map(opt => (
                        <option key={`${group.name}.${opt}`} value={`${group.name}.${opt}`}>
                          {`${group.name}.${opt}`}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Operator</label>
                <select
                  value={rule.operator}
                  onChange={(e) => {
                    const newRules = [...activeRules];
                    newRules[idx].operator = e.target.value;
                    setActiveRules(newRules);
                  }}
                  className="bg-[#111318] border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-300 outline-none focus:border-cyan-500 appearance-none h-[34px]"
                >
                  <option value="Equals (=)">Equals (=)</option>
                  <option value="Not Equals (!=)">Not Equals (!=)</option>
                  <option value="Contains">Contains</option>
                  <option value="Greater Than (>)">Greater Than (&gt;)</option>
                  <option value="Less Than (<)">Less Than (&lt;)</option>
                  <option value="Greater/Equal (≥)">Greater/Equal (≥)</option>
                  <option value="Less/Equal (≤)">Less/Equal (≤)</option>
                  <option value="In">In</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-[3] min-w-[250px]">
                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Value</label>
                <div className="flex flex-col gap-1.5 relative" ref={openDropdownId === rule.id ? dropdownRef : null}>
                  <button
                    onClick={() => {
                      if (openDropdownId === rule.id) {
                        setOpenDropdownId(null);
                      } else {
                        setOpenDropdownId(rule.id);
                        fetchValuesForField(rule.field);
                      }
                    }}
                    className="bg-[#111318] border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-500 w-full h-[34px] flex items-center justify-between group transition-colors hover:border-gray-500"
                  >
                    <span className="truncate max-w-[90%] text-gray-300">
                      {rule.value || <span className="text-gray-600 italic">Select value...</span>}
                    </span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${openDropdownId === rule.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {openDropdownId === rule.id && (
                    <div className="absolute top-[38px] left-0 right-0 z-[100] bg-[#111318] border border-[#1F2937] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col min-w-[280px] animate-fadeIn border-cyan-500/30">
                      {/* Search Input */}
                      <div className="p-2 border-b border-[#1F2937] bg-[#1F2937]/30 sticky top-0 z-10 rounded-t-xl">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search values..."
                          value={searchQueries[rule.id] || ''}
                          onChange={(e) => setSearchQueries(prev => ({ ...prev, [rule.id]: e.target.value }))}
                          className="w-full bg-[#0B0C10] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500 placeholder-gray-600"
                        />
                      </div>

                      {/* Values List */}
                      <div className="max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                        {fieldValues[rule.field] ? (() => {
                          const query = searchQueries[rule.id]?.toLowerCase() || '';
                          const filteredOptions = fieldValues[rule.field].filter(v => String(v).toLowerCase().includes(query));
                          const currentVals = rule.value.split(',').map(v => v.trim()).filter(Boolean);

                          if (filteredOptions.length === 0) {
                            return <div className="p-4 text-center text-xs text-gray-600 italic">No values found</div>;
                          }

                          return filteredOptions.map(val => {
                            const isSelected = currentVals.includes(String(val));
                            return (
                              <div
                                key={val}
                                onClick={() => {
                                  const valStr = String(val);
                                  let nextVals;
                                  if (isSelected) {
                                    nextVals = currentVals.filter(v => v !== valStr);
                                  } else {
                                    nextVals = [...currentVals, valStr];
                                  }
                                  const newRules = [...activeRules];
                                  newRules[idx].value = nextVals.join(', ');
                                  setActiveRules(newRules);
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 hover:bg-cyan-500/10 rounded-lg cursor-pointer transition-colors group/item ${isSelected ? 'bg-cyan-500/5' : ''}`}
                              >
                                <div className={`w-4 h-4 rounded border flex flex-shrink-0 justify-center items-center transition-all ${isSelected ? 'bg-cyan-500 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'border-gray-600 bg-transparent group-hover/item:border-gray-500'}`}>
                                  {isSelected && <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={`text-xs truncate flex-1 ${isSelected ? 'text-cyan-400 font-bold' : 'text-gray-300 group-hover/item:text-white'}`}>{val}</span>
                              </div>
                            );
                          });
                        })() : (
                          <div className="p-4 text-center text-xs text-gray-500 animate-pulse">Loading data...</div>
                        )}
                      </div>

                      {/* Footer / Summary */}
                      {rule.value && (
                        <div className="p-2 border-t border-[#1F2937] bg-black/20 flex justify-between items-center rounded-b-xl">
                          <span className="text-[9px] text-gray-500 uppercase tracking-tighter truncate max-w-[150px]">
                            {rule.value.split(',').length} selected
                          </span>
                          <button
                            onClick={() => {
                              const newRules = [...activeRules];
                              newRules[idx].value = '';
                              setActiveRules(newRules);
                            }}
                            className="text-[9px] text-red-500/70 hover:text-red-400 font-bold tracking-wider"
                          >
                            CLEAR ALL
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveRules(activeRules.filter(r => r.id !== rule.id))}
                className="px-4 py-1.5 border border-red-500/50 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors shrink-0 h-[34px]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveRules([...activeRules, { id: Date.now().toString(), field: '', operator: 'Equals (=)', value: '' }])}
              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all shadow-sm"
              title="Add new filter"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Add Filters
            </button>

            {activeRules.length > 0 && (
              <button
                onClick={() => { setActiveRules([]); setAppliedRules([]); }}
                className="text-red-400/60 hover:text-red-400 text-[10px] uppercase font-bold tracking-wider hover:bg-red-500/5 px-2 py-1 rounded transition-all ml-1"
                title="Remove all filters"
              >
                Clear Filters
              </button>
            )}

          </div>

          <button
            onClick={handleLoad}
            className="bg-[#1F2937] hover:bg-[#2D3748] border border-gray-600 px-8 py-1.5 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto shrink-0 shadow-sm"
          >
            {loading ? 'Loading...' : 'Apply & Load'}
          </button>
        </div>

        {appliedRules.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1 py-1 border-t border-[#1F2937]/50 mt-2">
            <div className="flex items-center gap-1.5 self-center">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Active Filters:</span>
              <button
                onClick={() => { setActiveRules([]); setAppliedRules([]); }}
                className="text-[10px] text-red-400/60 hover:text-red-400 px-1 py-0.5 rounded border border-red-500/10 hover:bg-red-500/10 transition-colors uppercase font-bold"
                title="Clear all filters"
              >
                Clear All
              </button>
            </div>

            {appliedRules.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 group animate-fadeIn">
                <span className="text-[10px]">
                  {r.field.split('.').pop()} {r.operator} <span className="font-bold text-gray-200">{r.value}</span>
                </span>
                <button
                  onClick={() => {
                    const newRules = appliedRules.filter((_, idx) => idx !== i);
                    setAppliedRules(newRules);
                    setActiveRules(newRules);
                  }}
                  className="hover:text-white text-cyan-400/50 transition-colors leading-none"
                  title="Remove filter"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <span className="text-[10px] text-gray-500 italic ml-1 self-center">({filterOperator} match)</span>

            <div className="ml-auto text-[10px] text-gray-600 self-center border-l border-gray-700/50 pl-3">
              Matching <span className="text-white font-bold">{filteredData.length}</span> / {recipients.length} total
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-3 lg:flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar lg:overflow-hidden min-h-0 pr-1 lg:pr-0 pb-1 lg:pb-0">

        {/* Left: Data Table */}
        <div className="flex-1 lg:flex-1 min-h-[300px] lg:min-h-0 bg-[#111318] border border-[#1F2937] rounded-xl overflow-hidden flex flex-col shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 animate-pulse">Loading recipients...</div>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 relative">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="bg-[#1F2937] text-gray-500 text-[10px] uppercase font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 text-left whitespace-nowrap">Recipient</th>
                    <th className="px-3 sm:px-4 py-2 text-center whitespace-nowrap">Inv. Date</th>
                    <th className="px-3 sm:px-4 py-2 text-center whitespace-nowrap">Pay Date</th>
                    {targetMetric.toLowerCase().includes('quantity') && (
                      <th className="px-3 sm:px-4 py-2 text-right whitespace-nowrap text-cyan-400">Quantity</th>
                    )}
                    <th className="px-3 sm:px-4 py-2 text-right text-cyan-400 whitespace-nowrap">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]/50 text-xs">
                  {filteredData.length > 0 ? (
                    filteredData.map(r => (
                      <tr key={r.id} className={`hover:bg-[#1F2937]/30 transition-colors ${r.isQualifying ? 'bg-green-900/20' : ''}`}>
                        <td className="px-3 sm:px-4 py-2.5 text-left font-medium text-gray-200 whitespace-nowrap truncate max-w-[150px] sm:max-w-xs">
                          {r.name}
                          {r.isQualifying && (
                            <span className="ml-2 text-[9px] bg-green-500/20 text-green-400 px-1 py-0.5 rounded border border-green-500/30 whitespace-nowrap">
                              {r.qualifyingTier?.id === 'draft' ? `TIER ${tiers.length + 1}` : `TIER ${tiers.findIndex(t => t.id === r.qualifyingTier?.id) + 1}`}
                            </span>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 text-center font-mono text-gray-400 whitespace-nowrap">
                          {r.invoiceDate ? new Date(r.invoiceDate).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 text-center font-mono text-gray-400 whitespace-nowrap">
                          {r.paymentDate ? new Date(r.paymentDate).toLocaleDateString('en-GB') : '-'}
                        </td>
                        {targetMetric.toLowerCase().includes('quantity') && (
                          <td className="px-3 sm:px-4 py-2.5 text-right text-cyan-400 font-mono whitespace-nowrap">
                            {r.totalTO.toLocaleString()}
                          </td>
                        )}
                        <td className="px-3 sm:px-4 py-2.5 text-right font-mono whitespace-nowrap group-hover:text-green-400">
                          <span className={r.isQualifying ? 'text-green-400 font-bold' : 'text-gray-400'}>{targetMetric.toLowerCase().includes('quantity') ? '-' : r.totalTO.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={targetMetric.toLowerCase().includes('quantity') ? 5 : 4} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl opacity-20">🔍</span>
                          <p className="text-gray-500 text-sm">
                            {recipients.length === 0
                              ? 'Click "Apply & Load" to fetch latest data.'
                              : `No ${recipientType.toLowerCase()}s match your current filter rules.`}
                          </p>
                          {recipients.length > 0 && (
                            <button
                              onClick={() => { setActiveRules([]); setAppliedRules([]); }}
                              className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Simulator Controls */}
        <div className="w-full lg:w-[320px] xl:w-[420px] shrink-0 flex flex-col gap-2 overflow-visible lg:overflow-y-auto custom-scrollbar lg:pr-1 pb-4 lg:pb-1 mt-4 lg:mt-0">

          {/* Controls + Duration Block (Hidden if 3 tiers are added) */}
          {tiers.length < 3 && (
            <div className="flex flex-col gap-1.5 w-full animate-fadeIn">

              {/* Interest Toggle */}
              <div
                onClick={() => setIsInterestEnabled(!isInterestEnabled)}
                className="flex justify-between items-center bg-[#111318] border border-[#1F2937] hover:border-gray-600 transition-colors rounded-xl px-3 py-2.5 shadow-sm w-full cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md transition-colors ${isInterestEnabled ? 'bg-amber-500/20 text-amber-500' : 'bg-[#1F2937] text-gray-500 group-hover:text-gray-400'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isInterestEnabled ? 'text-amber-500' : 'text-gray-500 group-hover:text-gray-400'}`}>
                    Apply Interest Penalty
                  </span>
                </div>

                {/* Custom Toggle Switch */}
                <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isInterestEnabled ? 'bg-amber-500' : 'bg-[#1F2937]'}`}>
                  <div className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white transition-transform duration-300 ${isInterestEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Interest Controls (Below Toggle) */}
              <div className={`bg-[#111318] border border-[#1F2937] rounded-xl p-2.5 shadow-sm w-full ${isInterestEnabled ? '' : 'hidden'}`}>
                <div className="flex gap-3">
                  {/* Interest Free Period Textbox */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] text-gray-400 uppercase tracking-wider">Interest Free Period</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={interestFreePeriod === 0 ? '' : interestFreePeriod}
                        onChange={(e) => setInterestFreePeriod(e.target.value ? parseInt(e.target.value) : 0)}
                        placeholder="0"
                        className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-lg px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-all pr-12"
                      />
                      <span className="absolute right-2 text-gray-500 text-[10px] font-bold pointer-events-none">Days</span>
                    </div>
                  </div>

                  {/* Interest Above Target Textbox */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] text-gray-400 uppercase tracking-wider">Interest Rate</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={interestRate === '' ? '' : interestRate}
                        onChange={(e) => setinterestRate(e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="1.5"
                        className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-lg px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-all pr-6"
                      />
                      <span className="absolute right-2 text-gray-500 text-[10px] font-bold pointer-events-none">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Target Section */}
              <div className="bg-[#111318] border border-[#1F2937] rounded-xl p-2 shadow-md w-full mb-1">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[13px] font-bold text-gray-400 tracking-wide">
                    {targetMetric.toLowerCase().includes('quantity') ? 'Quantity' : 'Amount'}
                  </label>
                  <div className="flex items-center bg-[#0B0C10] rounded-lg border border-cyan-800/40 px-2.5 py-1 focus-within:border-cyan-400/60 transition-all shadow-inner">
                    <input
                      type="number"
                      min="0"
                      max={targetMetric.toLowerCase().includes('quantity') ? 100000 : 10000000}
                      value={targetThreshold}
                      onChange={(e) => setTargetThreshold(parseInt(e.target.value) || 0)}
                      className="text-lg text-white font-mono font-bold bg-transparent outline-none w-[120px] text-right appearance-none"
                    />
                  </div>
                </div>
                <div className="px-1">
                  <input
                    type="range"
                    min="0"
                    max={targetMetric.toLowerCase().includes('quantity') ? 100000 : 10000000}
                    step={targetMetric.toLowerCase().includes('quantity') ? 100 : 10000}
                    value={targetThreshold}
                    onChange={(e) => setTargetThreshold(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-400 touch-pan-x"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono uppercase tracking-tighter italic">
                    <span>0</span>
                    <span className="text-gray-600">Min Qualification</span>
                    <span>{targetMetric.toLowerCase().includes('quantity') ? (100000).toLocaleString() : (10000000).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 2. Duration Section */}
              <div className="bg-[#111318] border border-[#1F2937] rounded-xl p-2 shadow-md w-full mb-1">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[13px] font-bold text-gray-400 tracking-wide">Duration</label>
                  <div className="flex items-center gap-1.5 bg-[#0B0C10] rounded-lg border border-cyan-800/40 px-2.5 py-1 shadow-inner">
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={durationDays}
                      onChange={(e) => setDurationDays(Math.max(0, parseInt(e.target.value) || 0))}
                      className="text-lg text-white font-mono font-bold bg-transparent outline-none w-[45px] text-right appearance-none"
                    />
                    <span className="text-[13px] font-bold text-gray-500 uppercase">Days</span>
                  </div>
                </div>
                <div className="px-1">
                  <input
                    type="range"
                    min="0"
                    max="365"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-400 touch-pan-x"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono uppercase tracking-tighter italic">
                    <span>0 Days</span>
                    <span className="text-cyan-400/60 lowercase font-bold">
                      Settlement: {new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span>1 Year</span>
                  </div>
                </div>
              </div>

              {/* 3. Payout Section */}
              <div className="bg-[#111318] border border-[#1F2937] rounded-xl p-2 shadow-md w-full mb-1">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-bold text-gray-400 tracking-wide shrink-0">Payout</label>
                    <div className="flex items-center bg-[#0B0C10] rounded-lg border border-emerald-800/40 px-2.5 py-1 shadow-inner min-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        step={payoutType === 'Percent' ? 0.5 : 1}
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                        className="text-lg text-white font-mono font-bold bg-transparent outline-none w-full text-right appearance-none"
                      />
                      <span className="ml-1 text-md font-bold text-emerald-500/80">
                        {payoutType === 'Percent' ? '%' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex bg-[#0B0C10] rounded-lg p-0.5 gap-1 border border-[#1F2937]">
                    {['Fixed', 'Percent', 'perPiece', 'Custom'].map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setPayoutType(type);
                          if (type === 'Percent' && payoutAmount > 100) setPayoutAmount(5);
                        }}
                        className={`flex-1 py-0.5 px-0.5 rounded-md text-[9px] font-bold uppercase transition-all whitespace-nowrap ${payoutType === type
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-gray-500 hover:text-gray-300'
                          }`}
                      >
                        {type === 'perPiece' ? 'Piece' : type}
                      </button>
                    ))}
                  </div>

                  <div className="px-1 mt-0.5">
                    <input
                      type="range"
                      min="0"
                      max={payoutType === 'Percent' ? 100 : 100000}
                      step={payoutType === 'Percent' ? 0.5 : 100}
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-emerald-500 touch-pan-x"
                    />
                    <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono uppercase tracking-tighter italic">
                      <span>0</span>
                      <span className="text-emerald-500/60 lowercase font-bold">{payoutType === 'perPiece' ? 'Piece' : payoutType} value</span>
                      <span>{payoutType === 'Percent' ? '100%' : '100k'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Added Tiers List */}
          {tiers.length > 0 && (
            <div className="flex flex-col gap-1 w-full my-1">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold ml-1">Added Tiers</span>
              <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto custom-scrollbar pr-1">
                {tiers.map((tier, idx) => (
                  <div
                    key={tier.id}
                    className="bg-[#1F2937]/50 border border-[#1F2937] hover:border-cyan-500/50 rounded-lg p-1.5 px-2 flex justify-between items-center group cursor-pointer transition-colors"
                    onClick={() => {
                      setTargetThreshold(tier.targetThreshold);
                      setPayoutType(tier.payoutType as 'Fixed Amount' | 'Fixed Calculated' | 'Per Item Discount');
                      setPayoutAmount(tier.payoutAmount);
                      setDurationDays(tier.durationDays);
                      setTiers(tiers.filter(t => t.id !== tier.id));
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-cyan-500/20 text-cyan-400 text-[8px] px-1 py-0.5 rounded font-mono font-bold">T{idx + 1}</span>
                      <span className="text-[10px] text-white font-mono font-medium">
                        {tier.targetThreshold >= 10000000 ? `${(tier.targetThreshold / 10000000).toFixed(1)}Cr` : tier.targetThreshold >= 100000 ? `${(tier.targetThreshold / 100000).toFixed(1)}L` : tier.targetThreshold >= 1000 ? `${(tier.targetThreshold / 1000).toFixed(0)}k` : tier.targetThreshold}
                      </span>
                      <span className="text-[8px] text-gray-500">→</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {tier.payoutType === 'Fixed Amount' ? `Rs.${tier.payoutAmount}` : `${tier.payoutAmount}%`}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTiers(tiers.filter(t => t.id !== tier.id));
                      }}
                      className="text-gray-500 hover:text-red-400 opacity-50 hover:opacity-100 transition-opacity p-0.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Outputs as Table */}
          {(targetMetric === 'Payment' || targetMetric.toLowerCase().includes('qty')) && (
            <div className="flex flex-col gap-1 w-full mt-1">
              <div className="bg-[#111318] border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#1F2937]/50 text-gray-500 text-[8px] uppercase tracking-widest">
                    <tr>
                      <th className="px-3 py-1.5 font-semibold">Tier</th>
                      <th className="px-3 py-1.5 text-right font-semibold">Qual.</th>
                      <th className="px-3 py-1.5 text-right font-semibold">Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]/30 text-[10px]">
                    {stats.breakdown.map((b, idx) => (
                      <tr key={b.tier.id} className={b.tier.id === 'draft' ? 'bg-cyan-500/5' : ''}>
                        <td className="px-3 py-1.5 font-mono text-gray-300">
                          {b.tier.id === 'draft' ? (
                            <span className="text-cyan-400 font-bold">T{idx + 1} ({idx === 0 ? 1 : stats.breakdown[idx - 1]?.tier.durationDays + 1} - {b.tier.durationDays} days)</span>
                          ) : (
                            `Tier ${idx + 1} (${idx === 0 ? 1 : stats.breakdown[idx - 1]?.tier.durationDays + 1} - ${b.tier.durationDays} days)`
                          )}
                          <span className="text-[8px] text-gray-600 ml-1">
                            ({b.tier.targetThreshold >= 10000000 ? `${(b.tier.targetThreshold / 10000000).toFixed(1)}Cr` : b.tier.targetThreshold >= 100000 ? `${(b.tier.targetThreshold / 100000).toFixed(1)}L` : b.tier.targetThreshold >= 1000 ? `${(b.tier.targetThreshold / 1000).toFixed(0)}k` : b.tier.targetThreshold})
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right text-gray-400 font-mono">{b.count}</td>
                        <td className="px-3 py-1.5 text-right text-white font-mono font-medium">₹{(b.budget / 1000).toFixed(1)}k</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#1F2937]/30 border-t border-[#1F2937]">
                    <tr>
                      <th className="px-3 py-2 text-[9px] uppercase text-gray-400">Total</th>
                      <th className="px-3 py-2 text-right text-cyan-400 font-bold font-mono">{stats.totalQualifiers}</th>
                      <th className="px-3 py-2 text-right text-emerald-400 font-bold font-mono">₹{(stats.totalBudget / 1000).toFixed(1)}k</th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {tiers.length < 3 && (targetMetric === 'Payment' || targetMetric.toLowerCase().includes('qty')) && (
                <button
                  onClick={() => {
                    setTiers([...tiers, { id: Date.now().toString(), targetThreshold, payoutType, payoutAmount, durationDays }]);
                  }}
                  className="mt-1 bg-[#059669] hover:bg-[#047857] text-white rounded-xl p-2.5 flex w-full items-center justify-center gap-2 shadow-[0_4px_15px_rgba(5,150,105,0.4)] transition-transform active:scale-95 cursor-pointer font-bold tracking-wider"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-xs">ADD TIER {tiers.length + 1}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersTab;
