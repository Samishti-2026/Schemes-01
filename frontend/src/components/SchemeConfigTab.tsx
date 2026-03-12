import { useState, useEffect } from 'react';
import { saveSchemeConfig, fetchDatasets } from '../api';

// ── Types ──────────────────────────────────────────────────────────────────────
interface FieldDef {
  name: string;
  type: string;
}

interface DatasetDef {
  name: string;
  icon: string;
  fields: FieldDef[];
}

// Icon mapping for known table names; fallback to 🗄️
const DATASET_ICONS: Record<string, string> = {
  customer: '🏪',
  product: '📦',
  billing: '🧾',
  payment: '💳',
  order: '📋',
  inventory: '📊',
  user: '👤',
};

const getIcon = (name: string) => DATASET_ICONS[name.toLowerCase()] ?? '🗄️';

// ── Component ──────────────────────────────────────────────────────────────────
const SchemeConfigTab = () => {
  const [datasets, setDatasets] = useState<DatasetDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(new Set());
  const [selectedFields, setSelectedFields] = useState<Record<string, Set<string>>>({});
  const [expandedDataset, setExpandedDataset] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 1. Fetch datasets from DB
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const raw = await fetchDatasets();
        if (cancelled) return;
        setDatasets(raw.map(ds => ({ ...ds, icon: getIcon(ds.name) })));
      } catch {
        if (!cancelled) setLoadError('Failed to load datasets from server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // 2. Restore saved config from localStorage once datasets are loaded
  useEffect(() => {
    if (datasets.length === 0) return;
    try {
      const raw = localStorage.getItem('schemeConfig');
      if (!raw) return;
      const config: Record<string, string[]> = JSON.parse(raw);
      const validNames = new Set(datasets.map(d => d.name));
      const restoredDatasets = new Set<string>();
      const restoredFields: Record<string, Set<string>> = {};
      for (const [dsName, fieldArr] of Object.entries(config)) {
        if (!validNames.has(dsName)) continue;
        const ds = datasets.find(d => d.name === dsName);
        if (!ds) continue;
        const validFields = new Set(ds.fields.map(f => f.name));
        const filtered = fieldArr.filter(f => validFields.has(f));
        if (filtered.length > 0) {
          restoredDatasets.add(dsName);
          restoredFields[dsName] = new Set(filtered);
        }
      }
      setSelectedDatasets(restoredDatasets);
      setSelectedFields(restoredFields);
    } catch { /* ignore corrupt cache */ }
  }, [datasets]);

  // 3. Auto-persist to localStorage
  useEffect(() => {
    const config: Record<string, string[]> = {};
    for (const [dsName, fields] of Object.entries(selectedFields)) {
      if (fields.size > 0) config[dsName] = Array.from(fields);
    }
    localStorage.setItem('schemeConfig', JSON.stringify(config));
  }, [selectedFields]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleDataset = (name: string) => {
    setSelectedDatasets(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        setSelectedFields(pf => { const nf = { ...pf }; delete nf[name]; return nf; });
        if (expandedDataset === name) setExpandedDataset(null);
      } else {
        next.add(name);
        const ds = datasets.find(d => d.name === name);
        if (ds) setSelectedFields(pf => ({ ...pf, [name]: new Set(ds.fields.map(f => f.name)) }));
        setExpandedDataset(name);
      }
      return next;
    });
  };

  const toggleExpand = (name: string) =>
    setExpandedDataset(prev => (prev === name ? null : name));

  const toggleField = (dsName: string, fieldName: string) => {
    setSelectedFields(prev => {
      const current = new Set(prev[dsName] || []);
      current.has(fieldName) ? current.delete(fieldName) : current.add(fieldName);
      return { ...prev, [dsName]: current };
    });
  };

  const selectAllFields = (dsName: string) => {
    const ds = datasets.find(d => d.name === dsName);
    if (!ds) return;
    setSelectedFields(prev => ({ ...prev, [dsName]: new Set(ds.fields.map(f => f.name)) }));
  };

  const clearAllFields = (dsName: string) =>
    setSelectedFields(prev => ({ ...prev, [dsName]: new Set() }));

  const handleSave = async () => {
    const config: Record<string, string[]> = {};
    for (const [dsName, fields] of Object.entries(selectedFields)) {
      if (fields.size > 0) config[dsName] = Array.from(fields);
    }
    setSaving(true);
    try {
      await saveSchemeConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('Failed to save to server. Config is saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const totalSelectedFields = Object.values(selectedFields).reduce((sum, s) => sum + s.size, 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-8 max-w-5xl mx-auto animate-fadeIn">

        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">⚙️</span>
            <h1 className="text-3xl font-bold text-white">Configure Schemes</h1>
          </div>
          <p className="text-gray-400 text-sm">Select datasets and fields to include in your scheme</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fadeIn">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading datasets from database…</p>
          </div>
        )}

        {/* Error */}
        {!loading && loadError && (
          <div className="bg-red-500/8 border border-red-500/25 rounded-xl px-5 py-4 flex items-start gap-3 mb-6 animate-fadeIn">
            <span className="text-red-400 text-lg mt-0.5">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-400">Could not load datasets</p>
              <p className="text-xs text-gray-500 mt-0.5">{loadError}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto text-xs text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main content */}
        {!loading && !loadError && (
          <>
            {/* Summary Bar */}
            {selectedDatasets.size > 0 && (
              <div className="mb-6 bg-cyan-500/5 border border-cyan-500/15 rounded-xl px-5 py-3 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-cyan-400 font-semibold">
                    {selectedDatasets.size} dataset{selectedDatasets.size > 1 ? 's' : ''}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span className="text-sm text-gray-400">
                    {totalSelectedFields} field{totalSelectedFields !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {Array.from(selectedDatasets).map(name => {
                    const ds = datasets.find(d => d.name === name);
                    return (
                      <span key={name} className="text-xs bg-cyan-500/15 text-cyan-400 px-2 py-1 rounded-lg border border-cyan-500/20">
                        {ds?.icon} {name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 1: Select Datasets */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-cyan-500/30">1</span>
                <h2 className="text-lg font-bold text-white">Select Datasets</h2>
                <span className="text-xs text-gray-500 ml-1">(click to toggle)</span>
              </div>
              <div className="bg-[#111318] rounded-2xl border border-[#1F2937] p-6">
                {datasets.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No datasets found in the database.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {datasets.map(ds => {
                      const isSelected = selectedDatasets.has(ds.name);
                      const fieldCount = selectedFields[ds.name]?.size ?? 0;
                      return (
                        <button
                          key={ds.name}
                          onClick={() => toggleDataset(ds.name)}
                          className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left
                            ${isSelected
                              ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.12)]'
                              : 'bg-[#0B0C10] border-[#1F2937] hover:border-gray-600 hover:bg-[#1a1d24]'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all
                            ${isSelected ? 'bg-cyan-500' : 'bg-[#1F2937] border border-gray-600'}`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-sm truncate ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                              {ds.icon} {ds.name}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {isSelected ? `${fieldCount}/${ds.fields.length} fields` : `${ds.fields.length} fields`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: Configure Fields */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg
                  ${selectedDatasets.size > 0 ? 'bg-cyan-500 text-white shadow-cyan-500/30' : 'bg-[#1F2937] text-gray-500'}`}>
                  2
                </span>
                <h2 className="text-lg font-bold text-white">Configure Fields</h2>
                <span className="text-sm text-gray-500 ml-1">for each selected dataset</span>
              </div>

              {selectedDatasets.size > 0 ? (
                <div className="space-y-3">
                  {datasets.filter(ds => selectedDatasets.has(ds.name)).map(ds => {
                    const fieldSet = selectedFields[ds.name] || new Set<string>();
                    const isExpanded = expandedDataset === ds.name;
                    return (
                      <div key={ds.name} className="bg-[#111318] rounded-2xl border border-[#1F2937] overflow-hidden">
                        <button
                          onClick={() => toggleExpand(ds.name)}
                          className="w-full flex items-center justify-between p-4 hover:bg-[#1a1d24] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center text-base border border-cyan-500/20">
                              {ds.icon}
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-wide">{ds.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                              {fieldSet.size}/{ds.fields.length}
                            </span>
                            <svg className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-5 border-t border-[#1F2937] pt-4 animate-fadeIn">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {ds.fields.map(field => {
                                const isChecked = fieldSet.has(field.name);
                                return (
                                  <label
                                    key={field.name}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all duration-150 select-none
                                      ${isChecked
                                        ? 'bg-cyan-500/8 border-cyan-500/30'
                                        : 'bg-[#0B0C10] border-[#1F2937] hover:border-gray-600'
                                      }`}
                                  >
                                    <div className={`w-[18px] h-[18px] rounded flex-shrink-0 flex items-center justify-center transition-all
                                      ${isChecked ? 'bg-cyan-500' : 'bg-[#1F2937] border border-gray-600'}`}>
                                      {isChecked && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                    <input type="checkbox" checked={isChecked} onChange={() => toggleField(ds.name, field.name)} className="hidden" />
                                    <span className={`text-sm truncate ${isChecked ? 'text-white' : 'text-gray-400'}`}>{field.name}</span>
                                    <span className="text-[10px] text-gray-600 font-mono ml-auto flex-shrink-0">{field.type}</span>
                                  </label>
                                );
                              })}
                            </div>
                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#1F2937]">
                              <button onClick={() => selectAllFields(ds.name)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#1F2937] bg-[#0B0C10] text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                                Select All
                              </button>
                              <button onClick={() => clearAllFields(ds.name)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#1F2937] bg-[#0B0C10] text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                                Clear All
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#111318] rounded-2xl border border-dashed border-[#1F2937] flex flex-col items-center justify-center py-14 text-gray-500">
                  <svg className="w-10 h-10 mb-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4 8-4s8 1.79 8 4" />
                  </svg>
                  <p className="text-sm">Select datasets above to configure their fields</p>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSave}
                disabled={selectedDatasets.size === 0 || saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                  ${saved
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : selectedDatasets.size > 0
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                      : 'bg-[#1F2937] text-gray-600 cursor-not-allowed'
                  }`}
              >
                {saving ? 'Saving…' : saved ? '✓ Saved' : '💾 Save Config'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default SchemeConfigTab;