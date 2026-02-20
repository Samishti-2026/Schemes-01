import { useState, useRef, useEffect } from 'react';

interface FilterGroup {
  name: string;
  options: string[];
}

interface FilterDropdownProps {
  filterGroups: FilterGroup[];
  activeFilters: string[];
  onToggleFilter: (filter: string) => void;
  onClose: () => void;
}

const FilterDropdown = ({ filterGroups, activeFilters, onToggleFilter, onClose }: FilterDropdownProps) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Reset search when switching groups (optional, but good UX)
  // or keep it if we want to search across groups? 
  // requirement seems to be per-group or global? 
  // "Region -> search -> East, West..." implies searching within the opened group.
  useEffect(() => {
    setSearchText('');
  }, [activeGroup]);

  return (
    <div ref={dropdownRef} className="absolute top-full left-0 mt-2 w-48 bg-[#1F2937] border border-gray-700 rounded-xl shadow-2xl overflow-visible z-50 animate-fadeIn flex flex-col">
      {filterGroups.map((group) => (
        <div
          key={group.name}
          onClick={() => setActiveGroup(activeGroup === group.name ? null : group.name)}
          className="relative group/item px-4 py-3 hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-gray-700 last:border-0 flex-wrap"
        >
          <span className={`text-sm font-medium transition-colors ${activeGroup === group.name ? 'text-white' : 'text-gray-300 group-hover/item:text-white'} `}>{group.name}</span>
          <svg className={`shrink-0 w-4 h-4 transition-colors ${activeGroup === group.name ? 'text-white' : 'text-gray-500 group-hover/item:text-white'} `} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>

          {/* Sub-menu (appears on click) */}
          {activeGroup === group.name && (
            <div
              className="absolute left-full top-0 ml-2 w-56 bg-[#1F2937] border border-gray-700 rounded-xl shadow-2xl flex flex-col max-h-[300px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input Header */}
              <div className="px-3 py-2 border-b border-gray-700 bg-gray-800/50 rounded-t-xl sticky top-0 z-10">
                <input
                  type="text"
                  autoFocus
                  placeholder={`Search ${group.name}...`}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Prevent closing/toggling
                  className="w-full bg-[#111318] border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="overflow-y-auto custom-scrollbar p-1">
                {group.options
                  .filter(opt => opt.toLowerCase().includes(searchText.toLowerCase()))
                  .map(option => (
                    <div
                      key={option}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFilter(option);
                      }}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeFilters.includes(option) ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500'} `}>
                        {activeFilters.includes(option) && <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm ${activeFilters.includes(option) ? 'text-cyan-100' : 'text-gray-300'} `}>{option}</span>
                    </div>
                  ))}
                {group.options.filter(opt => opt.toLowerCase().includes(searchText.toLowerCase())).length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-gray-500">No results found</div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterDropdown;
