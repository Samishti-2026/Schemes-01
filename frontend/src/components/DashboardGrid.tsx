import { useState } from 'react';
import SchemeTarget from './SchemeTarget';
import UpcomingSchemes from './UpcomingSchemes';
import TotalSales from './TotalSales';
import AnalyticsGraph from './AnalyticsGraph';
// New Tabs
// import SchemesTab from './SchemesTab';
import CustomersTab from './CustomersTab';
import AnalyticsTab from './AnalyticsTab';
import SettingsTab from './SettingsTab';

const DashboardGrid = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderContent = () => {
    switch (activeTab) {
      // case 'Schemes': return <SchemesTab />; // Hidden
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
        {/* <div className="p-6 border-b border-[#1F2937]">
          <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Samishti Admin
          </h1>
        </div> */}

        <nav className="flex-1 p-4 space-y-1">
          {/* Navigation Items */}
          {['Dashboard', 'Scheme', 'Analytics', 'Settings'].map(item => (
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

        <div className="p-4 border-t border-[#1F2937]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500"></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Executive</span>
              <span className="text-xs text-gray-500">executive@samishti.com</span>
            </div>
          </div>
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
