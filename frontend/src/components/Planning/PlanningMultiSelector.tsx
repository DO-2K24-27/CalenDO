import { useState, useRef, useEffect } from 'react';
import { useCalendar } from '../../contexts/CalendarContext';

export const PlanningMultiSelector = () => {
  const { 
    plannings, 
    selectedPlannings, 
    togglePlanningSelection, 
    selectAllPlannings, 
    clearPlanningSelection 
  } = useCalendar();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (plannings.length === 0) {
    return null;
  }

  const isAllSelected = selectedPlannings.length === plannings.length;
  const isNoneSelected = selectedPlannings.length === 0;

  const getButtonText = () => {
    if (isAllSelected || isNoneSelected) {
      return 'All Plannings';
    }
    if (selectedPlannings.length === 1) {
      return selectedPlannings[0].name;
    }
    return `${selectedPlannings.length} Plannings Selected`;
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearPlanningSelection();
    } else {
      selectAllPlannings();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-purple-100">
          Plannings:
        </label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between bg-white border border-purple-300 rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent min-w-[180px]"
        >
          <span className="truncate">{getButtonText()}</span>
          <svg 
            className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Color indicators */}
        {selectedPlannings.length > 0 && (
          <div className="flex gap-1">
            {selectedPlannings.slice(0, 3).map((planning) => (
              <div
                key={planning.id}
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: planning.color }}
                title={planning.name}
              />
            ))}
            {selectedPlannings.length > 3 && (
              <div className="w-3 h-3 rounded-full bg-gray-400 border border-white shadow-sm flex items-center justify-center">
                <span className="text-xs text-white font-bold">+</span>
              </div>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {/* Select All / Clear All */}
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={handleSelectAll}
              className="w-full text-left px-2 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded"
            >
              {isAllSelected ? 'Clear All' : 'Select All'}
            </button>
          </div>
          
          {/* Planning options */}
          <div className="py-1">
            {plannings.map((planning) => {
              const isSelected = selectedPlannings.some(p => p.id === planning.id);
              return (
                <div
                  key={planning.id}
                  onClick={() => togglePlanningSelection(planning)}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by onClick
                    className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300 mr-3"
                    style={{ backgroundColor: planning.color }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {planning.name}
                      {planning.is_default && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    {planning.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {planning.description}
                      </div>
                    )}
                  </div>
                  {planning.event_count !== undefined && (
                    <div className="text-xs text-gray-400">
                      {planning.event_count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
