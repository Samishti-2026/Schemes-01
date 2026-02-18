import { useState } from 'react';
import CreateSchemeForm from './CreateSchemeForm';

const SchemesTab = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingScheme, setEditingScheme] = useState<any>(null);

  // Filters State
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterType, setFilterType] = useState('all'); // Acts as Category/Product Type filter
  const [searchQuery, setSearchQuery] = useState('');

  // Lifted scheme data with more details for filtering
  const [schemes, setSchemes] = useState([
    { id: 1, name: 'Diwali Bonanza', status: 'Active', targets: 120, revenue: '$45K', budget: '1.2L', type: 'TOTAL SALES', region: 'North', category: 'All' },
    { id: 2, name: 'Summer Sale', status: 'Expired', targets: 85, revenue: '$32K', budget: '50K', type: 'PRODUCT QTY', region: 'West', category: 'Insecticides', product: 'XYZ Insecticide 1L' },
    { id: 3, name: 'Year End Rush', status: 'Upcoming', targets: 200, revenue: '-', budget: '2.0L', type: 'CATEGORY QTY', region: 'South', category: 'Fertilizers' },
  ]);

  const handleSaveScheme = (newSchemeData: any) => {
    const status = newSchemeData.startDate && new Date(newSchemeData.startDate) > new Date() ? 'Upcoming' : 'Active';

    // Map form data to scheme object
    const mappedScheme = {
      name: newSchemeData.schemeName,
      status: status,
      budget: newSchemeData.totalBudget,
      type: newSchemeData.targetType.toUpperCase().replace('_', ' '),
      region: newSchemeData.regionFilter === 'all' ? 'All Regions' :
        newSchemeData.regionFilter.charAt(0).toUpperCase() + newSchemeData.regionFilter.slice(1),
      // Simplistic mapping for category/product based on type
      category: newSchemeData.targetType === 'category_qty' ? newSchemeData.selectedTargetItem :
        newSchemeData.targetType === 'product_qty' ? 'Specific Product' : 'All',
      product: newSchemeData.targetType === 'product_qty' ? newSchemeData.selectedTargetItem : ''
    };

    if (editingScheme) {
      setSchemes(schemes.map(s => s.id === editingScheme.id ? { ...s, ...mappedScheme } : s));
      setEditingScheme(null);
    } else {
      const newScheme = {
        id: schemes.length + 1,
        targets: 0,
        revenue: '-',
        ...mappedScheme
      };
      setSchemes([newScheme, ...schemes]);
    }
    setIsCreating(false);
  };

  const handleEditClick = (scheme: any) => {
    // Reverse map scheme data to form data structure if needed, or pass as is if form handles it
    // For now passing scheme, CreateSchemeForm should handle partial matches or we refine mapping
    setEditingScheme(scheme);
    setIsCreating(true);
  };

  // Filter Logic
  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      const matchesRegion = filterRegion === 'all' || scheme.region.toLowerCase().includes(filterRegion.toLowerCase()) || scheme.region === 'All Regions';
      const matchesType = filterType === 'all' || scheme.type.toLowerCase() === filterType.toLowerCase() ||
        (filterType === 'Product' && scheme.type.includes('PRODUCT')) ||
        (filterType === 'Category' && scheme.type.includes('CATEGORY'));
      const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRegion && matchesType && matchesSearch;
    });
  }, [schemes, filterRegion, filterType, searchQuery]);

  if (isCreating) {
    return (
      <CreateSchemeForm
        onCancel={() => { setIsCreating(false); setEditingScheme(null); }}
        onSave={handleSaveScheme}
        initialData={editingScheme}
      />
    );
  }

  return (
    <div className="p-6 h-full flex flex-col animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Schemes Management</h2>
            <p className="text-sm text-gray-500 mt-1">Manage, create, and track all loyalty schemes.</p>
          </div>
          <button
            onClick={() => { setEditingScheme(null); setIsCreating(true); }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create New Scheme
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-[#111318] p-3 rounded-xl border border-[#1F2937]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search schemes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0C10] border border-[#1F2937] rounded-lg pl-9 pr-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Region Filter */}
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-[#0B0C10] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Regions</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
          </select>

          {/* Category/Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#0B0C10] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Types</option>
            <option value="total sales">Total Sales</option>
            <option value="Product">Product Based</option>
            <option value="Category">Category Based</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111318] rounded-xl border border-[#1F2937] overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1F2937] text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Scheme Name</th>
                <th className="px-6 py-4">Type / Product</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Budget</th>
                <th className="px-6 py-4 text-right">Perf</th>
                <th className="px-6 py-4 text-right">Revenue</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {filteredSchemes.length > 0 ? (
                filteredSchemes.map((scheme) => (
                  <tr key={scheme.id} className="hover:bg-[#1F2937]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{scheme.name}</div>
                      <div className="text-xs text-gray-600">ID: SCH-{202600 + scheme.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 text-sm font-medium">{scheme.type}</div>
                      {(scheme.category !== 'All' || scheme.product) && (
                        <div className="text-xs text-cyan-500/70">
                          {scheme.product || scheme.category}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{scheme.region}</td>
                    <td className="px-6 py-4">
                      <span className={`px - 2 py - 1 rounded - full text - xs border ${scheme.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          scheme.status === 'Expired' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        } `}>
                        {scheme.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 font-mono">{scheme.budget}</td>
                    <td className="px-6 py-4 text-right text-gray-300">{scheme.targets} <span className='text-xs text-gray-600'>users</span></td>
                    <td className="px-6 py-4 text-right text-cyan-400 font-medium">{scheme.revenue}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditClick(scheme)}
                        className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-[#1F2937] rounded-lg"
                        title="Edit Scheme"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No schemes match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SchemesTab;
