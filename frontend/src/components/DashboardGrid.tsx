import { useState } from 'react';
import type { TenantData } from '../api';
import SchemeTarget from './SchemeTarget';
import UpcomingSchemes from './UpcomingSchemes';
import TotalSales from './TotalSales';
import AnalyticsGraph from './AnalyticsGraph';
// New Tabs
// import SchemesTab from './SchemesTab';
import CustomersTab from './CustomersTab';
import AnalyticsTab from './AnalyticsTab';
import SettingsTab from './SettingsTab';
import SchemeConfigTab from './SchemeConfigTab';
// import CreateSchemeTab from './CreateSchemeTab';

interface UserData {
  id: number;
  username: string;
  displayName: string;
  role: string;
}

interface DashboardGridProps {
  tenant: TenantData;
  user: UserData;
  onSwitchTenant: () => void;
  onLogout: () => void;
}

const DashboardGrid = ({ tenant, user, onSwitchTenant, onLogout }: DashboardGridProps) => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderContent = () => {
    switch (activeTab) {
      // case 'Schemes': return <SchemesTab />; // Hidden
      case 'Scheme Config': return <SchemeConfigTab />;
      case 'Scheme': return <CustomersTab />;
      case 'Analytics': return <AnalyticsTab />;
      case 'Settings': return <SettingsTab />;
      case 'Dashboard':
      default:
        return (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[calc(100vh-8rem)]">
              {/* Row 1: Active Schemes (Large) & Upcoming (Small) */}
              <div className="lg:col-span-2 flex flex-col h-[500px]">
                <div className="bg-[#111318] rounded-2xl border border-[#1F2937] flex flex-col h-full overflow-hidden shadow-2xl shadow-black/50">
                  <SchemeTarget />
                </div>
              </div>

              <div className="lg:col-span-1 h-[500px]">
                <UpcomingSchemes />
              </div>

              {/* Row 2: Total Sales (Full Width Bar) */}
              <div className="lg:col-span-3">
                <TotalSales />
              </div>

              {/* Row 3: Analytics Graph (Large Bottom) */}
              <div className="lg:col-span-3 h-[400px]">
                <AnalyticsGraph />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0C10] text-white font-sans overflow-hidden">

      {/* Sidebar */}
      <div className="w-64 border-r border-[#1F2937] flex flex-col hidden lg:flex bg-[#111318]">
        {/* Tenant Brand Header */}
        <div className="p-5 border-b border-[#1F2937]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: `linear-gradient(135deg, ${tenant.color || '#06b6d4'}30, ${tenant.color || '#06b6d4'}10)`,
                border: `1px solid ${tenant.color || '#06b6d4'}40`,
                color: tenant.color || '#06b6d4',
              }}
            >
              {tenant.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-white truncate">{tenant.name}</h1>
              <p className="text-xs text-gray-500 truncate">{tenant.industry || tenant.code}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {/* Navigation Items */}
          {['Dashboard', 'Scheme Config', 'Scheme', 'Analytics', 'Settings'].map(item => (
            <div
              key={item}
              onClick={() => setActiveTab(item)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${activeTab === item
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === item
                ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                : 'border border-gray-600'
                }`}></span>
              <span className="font-medium text-sm">{item}</span>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1F2937] space-y-2">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: `${tenant.color || '#06b6d4'}30`, color: tenant.color || '#06b6d4' }}>
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-red-400 bg-[#0B0C10] border border-[#1F2937] hover:border-red-800 transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
          <button
            onClick={onSwitchTenant}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-[#0B0C10] border border-[#1F2937] hover:border-gray-600 transition-all duration-200 group"
          >
            <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Switch Company
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Header */}
        <header className="h-16 border-b border-[#1F2937] flex items-center justify-between px-6 bg-[#111318]/50 backdrop-blur-md z-10">
          <h2 className="text-lg font-semibold text-gray-200">{activeTab}</h2>
          {/* <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Last updated: Just now</span>

          </div> */}
        </header>

        {/* Dynamic Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardGrid;
