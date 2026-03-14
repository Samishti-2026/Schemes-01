import { useState, useEffect } from 'react';
import DashboardGrid from './components/DashboardGrid';
import UnifiedLoginPage from './components/UnifiedLoginPage';
import { setActiveTenantId } from './api';
import type { TenantData } from './api';

interface UserData {
  id: number;
  username: string;
  displayName: string;
  role: string;
}

function App() {
  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<UserData | null>(null);

  // Keep the API tenant context in sync
  useEffect(() => {
    setActiveTenantId(selectedTenant?.id ?? null);
  }, [selectedTenant]);

  // Unified Login (Step 1 & 2 combined)
  if (!loggedInUser) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-black text-white">
        <UnifiedLoginPage 
          onSelectTenant={setSelectedTenant} 
          onLogin={setLoggedInUser} 
        />
      </div>
    );
  }

  // Step 3: Dashboard (Once logged in)
  if (!selectedTenant) {
    // This shouldn't normally happen, but handles the TypeScript constraint
    // and edge cases where loggedInUser is set without a selectedTenant
    return null;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white">
      <DashboardGrid
        tenant={selectedTenant}
        user={loggedInUser}
        onSwitchTenant={() => {
          setSelectedTenant(null);
          setLoggedInUser(null);
        }}
        onLogout={() => setLoggedInUser(null)}
      />
    </div>
  );
}

export default App;
