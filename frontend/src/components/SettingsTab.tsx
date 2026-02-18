

const SettingsTab = () => {
  return (
    <div className="p-6 h-full max-w-4xl">
      <h2 className="text-2xl font-bold text-white mb-8">Settings</h2>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-[#111318] rounded-xl border border-[#1F2937] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profile Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Display Name</label>
              <input type="text" defaultValue="Executive" className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Email Address</label>
              <input type="email" defaultValue="executive@samishti.com" className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-[#111318] rounded-xl border border-[#1F2937] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
          <div className="space-y-4">
            {['Email Alerts for New Schemes', 'Weekly Performance Reports', 'System Updates'].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-gray-300">{item}</span>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-cyan-600 cursor-pointer">
                  <span className="absolute left-0 inline-block w-6 h-6 bg-white rounded-full shadow transform translate-x-6 transition-transform"></span>
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
