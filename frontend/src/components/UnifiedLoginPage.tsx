import { useState, useEffect, useRef } from 'react';
import { fetchTenants, createTenant } from '../api';
import type { TenantData } from '../api';

interface UnifiedLoginPageProps {
  onLogin: (user: { id: number; username: string; displayName: string; role: string }) => void;
  onSelectTenant: (tenant: TenantData) => void;
}

const INDUSTRY_ICONS: Record<string, string> = {
  Agrochemicals: '🌾',
  Technology: '💻',
  Retail: '🛒',
  Agriculture: '🌿',
  Pharmaceuticals: '💊',
  Infrastructure: '🏗️',
  Manufacturing: '🏭',
  Finance: '💰',
};

export default function UnifiedLoginPage({ onLogin, onSelectTenant }: UnifiedLoginPageProps) {
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Selected state
  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Create Company state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', code: '', industry: '', color: '#06b6d4' });

  useEffect(() => {
    loadTenants();
    
    // Click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadTenants = async () => {
    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoadingTenants(false);
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTenant = (tenant: TenantData) => {
    setSelectedTenant(tenant);
    setSearchQuery(tenant.name);
    setIsDropdownOpen(false);
    setLoginError('');
    onSelectTenant(tenant); // Let App.tsx know the active tenant for API calls
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(value.length > 0);
    if (selectedTenant && value !== selectedTenant.name) {
      setSelectedTenant(null); // Clear selection if typing again
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) {
      setLoginError('Please select a company first');
      return;
    }

    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, tenantId: selectedTenant.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Invalid credentials');
      }

      const data = await res.json();
      onLogin(data.user);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenant.name || !newTenant.code) return;
    setCreating(true);
    try {
      const created = await createTenant({ ...newTenant, isActive: true });
      setNewTenant({ name: '', code: '', industry: '', color: '#06b6d4' });
      setShowCreateModal(false);
      await loadTenants();
      // Auto-select the newly created tenant
      if (created) {
         handleSelectTenant(created);
      }
    } catch (err) {
      console.error('Failed to create tenant:', err);
      alert('Failed to create tenant. Code may already exist.');
    } finally {
      setCreating(false);
    }
  };

  const activeColor = selectedTenant?.color || '#06b6d4';
  const getInitials = (name: string) => name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0a] font-sans">
      
      {/* Dynamic Background Elements based on selection */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none transition-colors duration-1000">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-[100px] transition-all duration-1000"
          style={{ background: activeColor }} />
        <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full opacity-10 blur-[120px] transition-all duration-1000"
          style={{ background: activeColor }} />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-6" style={{ animation: 'scaleIn 0.4s ease-out' }}>
        
        {/* Header Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 shadow-lg"
               style={{ 
                 background: `linear-gradient(135deg, ${activeColor}dd, ${activeColor}88)`,
                 boxShadow: `0 10px 25px -5px ${activeColor}40`
               }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Samishti <span className="text-gray-400 font-light">Schemes</span></h1>
          <p className="text-sm text-gray-500">Sign in to your enterprise portal</p>
        </div>

        <div className="space-y-6">
          {/* 1. Company Search / Selection */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Company</label>
            <div className="relative">
              {!selectedTenant && (
                 <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
              )}
              {selectedTenant && (
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                      style={{ background: `${activeColor}22`, color: activeColor, border: `1px solid ${activeColor}40` }}>
                    {selectedTenant.logoUrl ? (
                      <img src={selectedTenant.logoUrl} alt="Logo" className="w-4 h-4 object-contain" />
                    ) : getInitials(selectedTenant.name)}
                 </div>
              )}
              <input
                type="text"
                value={searchQuery}
                readOnly={!!selectedTenant}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (!selectedTenant && searchQuery.length > 0) {
                    setIsDropdownOpen(true);
                  }
                }}
                placeholder="Search your company name..."
                className={`w-full py-3.5 pr-10 rounded-xl text-white placeholder-gray-500 outline-none transition-all focus:ring-2 cursor-pointer
                  ${selectedTenant ? 'pl-11 bg-[#111827]/80 cursor-default' : 'pl-11 bg-white/5'}
                `}
                style={{
                  border: `1px solid ${selectedTenant ? `${activeColor}50` : 'rgba(255, 255, 255, 0.1)'}`,
                  '--tw-ring-color': activeColor,
                  boxShadow: selectedTenant ? `0 0 20px ${activeColor}15` : 'none'
                } as any}
              />
              {selectedTenant && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedTenant(null); setSearchQuery(''); setIsDropdownOpen(true); setTimeout(() => dropdownRef.current?.querySelector('input')?.focus(), 10); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                  title="Change company"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && !selectedTenant && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111318] border border-[#1F2937] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-20 max-h-64 overflow-y-auto custom-scrollbar" style={{ animation: 'fadeInUp 0.15s ease-out' }}>
                 {loadingTenants ? (
                    <div className="p-4 text-center text-sm text-gray-500">Loading companies...</div>
                 ) : filteredTenants.length > 0 ? (
                    <div className="py-2">
                      {filteredTenants.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTenant(t)}
                          className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                        >
                           <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105"
                                style={{ background: `${t.color || '#06b6d4'}22`, color: t.color || '#06b6d4', border: `1px solid ${t.color || '#06b6d4'}40` }}>
                             {t.logoUrl ? <img src={t.logoUrl} alt="Logo" className="w-5 h-5 object-contain" /> : getInitials(t.name)}
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">{t.name}</div>
                             <div className="text-xs text-gray-500 truncate">{t.code}</div>
                           </div>
                           {t.industry && <div className="text-gray-500 text-xs px-2 py-0.5 rounded bg-white/5 border border-white/5 hidden sm:block">{INDUSTRY_ICONS[t.industry]} {t.industry}</div>}
                        </button>
                      ))}
                    </div>
                 ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-400 mb-3">No companies found matching "{searchQuery}"</p>
                      <button onClick={() => { setIsDropdownOpen(false); setShowCreateModal(true); setNewTenant(prev => ({ ...prev, name: searchQuery, code: searchQuery.toLowerCase().replace(/\s+/g, '-') })); }} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                        Register new company
                      </button>
                    </div>
                 )}
              </div>
            )}
          </div>

          {/* 2. Login Form Card */}
          <div className={`rounded-2xl transition-all duration-500 overflow-hidden ${selectedTenant ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none translate-y-2'}`}
               style={{
                 background: 'rgba(17, 24, 39, 0.6)',
                 backdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255, 255, 255, 0.08)',
                 boxShadow: selectedTenant ? `0 20px 40px -10px rgba(0,0,0,0.5)` : 'none'
               }}>
            
            {/* Top accent bar */}
            <div className="h-1 w-full transition-colors duration-500" style={{ background: `linear-gradient(90deg, ${activeColor}, transparent)` }} />

            <div className="p-6 sm:p-8">
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={!selectedTenant}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all focus:ring-2 disabled:opacity-50"
                    style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', '--tw-ring-color': activeColor } as any}
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={!selectedTenant}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all focus:ring-2 disabled:opacity-50"
                    style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', '--tw-ring-color': activeColor } as any}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {loginError && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedTenant || loggingIn || !username || !password}
                  className="w-full py-3.5 mt-2 rounded-xl text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden group"
                  style={{
                    background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`,
                    boxShadow: selectedTenant && username && password ? `0 8px 20px -5px ${activeColor}60` : 'none',
                  }}>
                  {/* Hover shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  
                  {loggingIn ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" /></svg>
                      Authenticating...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>
              
              {/* Demo Hint */}
              {selectedTenant && (
                 <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center text-xs text-gray-500" style={{ animation: 'fadeIn 0.5s ease-out 0.2s both' }}>
                    <span>Demo Access</span>
                    <span className="font-mono bg-white/5 px-2 py-1 rounded">admin / admin123</span>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Footer Actions */}
        <div className="mt-8 flex justify-center">
            <button onClick={() => setShowCreateModal(true)} className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 hover:bg-white/5 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Register a new company
            </button>
        </div>

      </div>

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-[#111318] border border-[#1F2937] rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]" style={{ animation: 'scaleIn 0.2s ease-out' }}>
            <div className="p-6 border-b border-[#1F2937] shrink-0">
              <h3 className="text-lg font-semibold text-white">Add New Company</h3>
              <p className="text-sm text-gray-500 mt-1">Register an organization to issue schemes</p>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400 font-medium">Company Name <span className="text-red-400">*</span></label>
                <input type="text" value={newTenant.name} onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })} placeholder="e.g. Samishti India"
                  className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400 font-medium">Code <span className="text-red-400">*</span></label>
                <input type="text" value={newTenant.code} onChange={(e) => setNewTenant({ ...newTenant, code: e.target.value.toLowerCase().replace(/\s/g, '-') })} placeholder="e.g. samishti-india"
                  className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-2.5 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400 font-medium">Industry</label>
                  <select value={newTenant.industry} onChange={(e) => setNewTenant({ ...newTenant, industry: e.target.value })}
                    className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                    <option value="">Select...</option>
                    {Object.keys(INDUSTRY_ICONS).map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400 font-medium">Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={newTenant.color} onChange={(e) => setNewTenant({ ...newTenant, color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-[#1F2937] bg-transparent cursor-pointer p-1" />
                    <span className="text-xs font-mono text-gray-500">{newTenant.color}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#1F2937] flex justify-end gap-3 shrink-0 bg-[#111318] rounded-b-2xl">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleCreateTenant} disabled={!newTenant.name || !newTenant.code || creating}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20">
                {creating ? 'Creating...' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
