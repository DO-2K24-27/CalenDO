import { useState, useRef, useEffect } from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { formatTextForDisplay } from '../../utils/textUtils';

export const PlanningMultiSelector = () => {
  const { 
    plannings, 
    selectedPlannings, 
    togglePlanningSelection, 
    selectAllPlannings, 
    clearPlanningSelection 
  } = useCalendar();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      return isMobile ? 'All' : 'All Plannings';
    }
    if (selectedPlannings.length === 1) {
      return isMobile ? selectedPlannings[0].name.substring(0, 15) + (selectedPlannings[0].name.length > 15 ? '...' : '') : selectedPlannings[0].name;
    }
    return isMobile ? `${selectedPlannings.length} Selected` : `${selectedPlannings.length} Plannings Selected`;
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
        <label className={`text-sm font-medium text-purple-100 ${isMobile ? 'hidden' : ''}`}>
          Plannings:
        </label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between bg-white border border-purple-300 rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent ${isMobile ? 'min-w-[120px]' : 'min-w-[180px]'}`}
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
        
        {/* Color indicators - more compact on mobile */}
        {selectedPlannings.length > 0 && (
          <div className="flex gap-1">
            {selectedPlannings.slice(0, isMobile ? 2 : 3).map((planning) => (
              <div
                key={planning.id}
                className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full border border-white shadow-sm`}
                style={{ backgroundColor: planning.color }}
                title={planning.name}
              />
            ))}
            {selectedPlannings.length > (isMobile ? 2 : 3) && (
              <div className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-gray-400 border border-white shadow-sm flex items-center justify-center`}>
                <span className="text-xs text-white font-bold">+</span>
              </div>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <div className={`absolute top-full mt-1 ${isMobile ? 'left-0 right-0' : 'left-0'} bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto ${isMobile ? 'min-w-full' : 'min-w-[400px] max-w-[600px]'}`}>
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
                  className={`flex items-start ${isMobile ? 'px-2 py-2' : 'px-3 py-3'} hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by onClick
                    className={`mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-0.5`}
                  />
                  <div 
                    className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full border border-gray-300 mr-2 mt-0.5 flex-shrink-0`}
                    style={{ backgroundColor: planning.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900 truncate`}>
                        {planning.name}
                        {planning.is_default && (
                          <span className={`ml-2 ${isMobile ? 'text-xs' : 'text-xs'} bg-green-100 text-green-800 px-1 py-0.5 rounded`}>
                            Default
                          </span>
                        )}
                      </div>
                      {planning.event_count !== undefined && (
                        <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400 ml-2 flex-shrink-0`}>
                          {planning.event_count} events
                        </div>
                      )}
                    </div>
                    {planning.description && !isMobile && (
                      <div className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                        {formatTextForDisplay(planning.description)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
