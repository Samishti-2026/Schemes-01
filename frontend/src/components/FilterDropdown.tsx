import { useState, useRef, useEffect } from 'react';
import { fetchFilterColumnValues } from '../api';

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
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [columnSearchText, setColumnSearchText] = useState('');
  const [columnValues, setColumnValues] = useState<string[]>([]);
  const [loadingValues, setLoadingValues] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic column values when active column changes
  useEffect(() => {
    if (activeGroup && activeColumn) {
      setLoadingValues(true);
      fetchFilterColumnValues(activeGroup, activeColumn)
        .then(values => {
          // Filter out falsy values like null/undefined
          setColumnValues(values.filter(Boolean).map(v => String(v)));
        })
        .catch(err => {
          console.error('Failed to fetch column values:', err);
          setColumnValues([]);
        })
        .finally(() => {
          setLoadingValues(false);
        });
    } else {
      setColumnValues([]);
    }
  }, [activeGroup, activeColumn]);

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

  const handleGroupClick = (groupName: string) => {
    setActiveGroup(activeGroup === groupName ? null : groupName);
    setActiveColumn(null);
    setSearchText(''); // Reset search when switching groups
    setColumnSearchText('');
  };

  return (
    <div ref={dropdownRef} className="absolute top-full left-0 mt-2 w-48 bg-[#1F2937] border border-gray-700 rounded-xl shadow-2xl overflow-visible z-50 animate-fadeIn flex flex-col">
      {filterGroups.map((group) => (
        <div
          key={group.name}
          onClick={() => handleGroupClick(group.name)}
          className="relative group/item px-4 py-3 hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-gray-700 last:border-0 flex-wrap"
        >
          <span className={`text-sm font-medium transition-colors ${activeGroup === group.name ? 'text-white' : 'text-gray-300 group-hover/item:text-white'} `}>{group.name}</span>
          <svg className={`shrink-0 w-4 h-4 transition-colors ${activeGroup === group.name ? 'text-white' : 'text-gray-500 group-hover/item:text-white'} `} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>

          {/* Sub-menu (appears on click) */}
          {activeGroup === group.name && (
            <div
              className="absolute left-full top-0 ml-2 w-64 bg-[#1F2937] border border-gray-700 rounded-xl shadow-2xl flex flex-col max-h-[350px] overflow-hidden z-50"
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
                  onClick={(e) => e.stopPropagation()}
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
                        if (activeColumn === option) {
                          setActiveColumn(null);
                        } else {
                          setActiveColumn(option);
                          setColumnSearchText('');
                        }
                      }}
                      className={`relative flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors ${activeColumn === option ? 'bg-gray-700' : ''}`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${activeFilters.includes(option) ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500'} `}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFilter(option);
                        }}
                      >
                        {activeFilters.includes(option) && <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm flex-1 ${activeFilters.includes(option) ? 'text-cyan-100' : 'text-gray-300'} `}>{option}</span>
                      <svg className={`shrink-0 w-3 h-3 transition-colors ${activeColumn === option ? 'text-white' : 'text-transparent group-hover/item:text-gray-500'} `} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>


                    </div>
                  ))}
                {group.options.filter(opt => opt.toLowerCase().includes(searchText.toLowerCase())).length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-gray-500">No results found</div>
                )}
              </div>

              {/* Third-level Sub-menu (Drill-down Overlay) */}
              {activeColumn && (
                <div
                  className="absolute inset-0 bg-[#1F2937] flex flex-col z-20 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Action Bar */}
                  <div className="flex items-center px-3 py-3 bg-[#1A2332] border-b border-gray-700 sticky top-0 z-20 cursor-pointer hover:bg-[#2A3441] transition-colors" onClick={(e) => { e.stopPropagation(); setActiveColumn(null); }}>
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    <span className="text-sm text-gray-300 font-medium">Back to {group.name}</span>
                  </div>

                  {/* Search Input Header */}
                  <div className="px-3 py-2 border-b border-gray-700 bg-gray-800/50 sticky top-[45px] z-10">
                    <input
                      type="text"
                      autoFocus
                      placeholder={`Search ${activeColumn}...`}
                      value={columnSearchText}
                      onChange={(e) => setColumnSearchText(e.target.value)}
                      className="w-full bg-[#111318] border border-gray-600 rounded-lg px-2 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div className="overflow-y-auto custom-scrollbar p-1 flex-1">
                    {loadingValues ? (
                      <div className="px-3 py-4 text-center text-xs text-gray-400 animate-pulse">Loading {activeColumn}...</div>
                    ) : (
                      <>
                        {columnValues
                          .filter(v => v.toLowerCase().includes(columnSearchText.toLowerCase()))
                          .map(val => (
                            <div
                              key={val}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFilter(val);
                              }}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                            >
                              <div className={`w-4 h-4 rounded appearance-none border flex flex-shrink-0 justify-center items-center focus-within:border-cyan-500 ${activeFilters.includes(val) ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500 bg-transparent'}`}>
                                {activeFilters.includes(val) && <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className={`text-[13px] truncate flex-1 ${activeFilters.includes(val) ? 'text-cyan-100' : 'text-blue-100/90'}`}>{val}</span>
                            </div>
                          ))}
                        {columnValues.filter(v => v.toLowerCase().includes(columnSearchText.toLowerCase())).length === 0 && (
                          <div className="px-3 py-4 text-center text-xs text-gray-500">No results found</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterDropdown;
