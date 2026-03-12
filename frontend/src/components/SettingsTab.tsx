import { useState, useEffect } from 'react';
import { fetchSettings, updateSettings } from '../api';

interface Settings {
  displayName: string;
  email: string;
  emailAlerts: boolean;
  weeklyReports: boolean;
  systemUpdates: boolean;
  [key: string]: string | boolean;
}

const SettingsTab = () => {
  const [settings, setSettings] = useState<Settings>({
    displayName: '',
    email: '',
    emailAlerts: true,
    weeklyReports: true,
    systemUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="p-6 h-full max-w-4xl flex items-center justify-center">
        <span className="text-gray-500 animate-pulse">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="p-6 h-full max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${saved
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-[#111318] rounded-xl border border-[#1F2937] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profile Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Display Name</label>
              <input
                type="text"
                value={settings.displayName}
                onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-[#111318] rounded-xl border border-[#1F2937] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
          <div className="space-y-4">
            {[
              { label: 'Email Alerts for New Schemes', key: 'emailAlerts' },
              { label: 'Weekly Performance Reports', key: 'weeklyReports' },
              { label: 'System Updates', key: 'systemUpdates' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-gray-300">{item.label}</span>
                <div
                  onClick={() => toggleNotification(item.key)}
                  className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${settings[item.key] ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                >
                  <span
                    className={`absolute inline-block w-6 h-6 bg-white rounded-full shadow transform transition-transform ${settings[item.key] ? 'translate-x-6' : 'translate-x-0'
                      }`}
                  ></span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsTab;
