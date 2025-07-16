import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { SearchFilters } from '../../types';

interface SearchBarProps {
  inMobileMenu?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ inMobileMenu = false }) => {
  const { searchFilters, setSearchFilters } = useCalendar();
  const [localKeyword, setLocalKeyword] = useState(searchFilters.keyword);
  
  useEffect(() => {
    const timerId = setTimeout(() => {
      setSearchFilters({ ...searchFilters, keyword: localKeyword });
    }, 300);
    
    return () => clearTimeout(timerId);
  }, [localKeyword, searchFilters, setSearchFilters]);
  
  const handleFieldChange = (field: SearchFilters['field']) => {
    setSearchFilters({ ...searchFilters, field });
  };
  
  const clearSearch = () => {
    setLocalKeyword('');
    setSearchFilters({ ...searchFilters, keyword: '' });
  };

  const containerClass = inMobileMenu 
    ? "mb-0" 
    : "bg-white rounded-lg shadow-md p-3 mb-2";

  return (
    <div className={containerClass}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className={inMobileMenu ? "text-purple-200" : "text-gray-400"} />
        </div>
        <input
          type="text"
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          placeholder="Search events..."
          className={`block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
            inMobileMenu 
              ? "bg-white border-purple-300 text-gray-700 placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-700 placeholder-gray-500"
          }`}
        />
        {localKeyword && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Clear search"
          >
            <X size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={() => handleFieldChange('all')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            searchFilters.field === 'all'
              ? 'bg-purple-100 text-purple-700'
              : inMobileMenu 
                ? 'bg-purple-600 text-white hover:bg-purple-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All fields
        </button>
        <button
          onClick={() => handleFieldChange('summary')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            searchFilters.field === 'summary'
              ? 'bg-purple-100 text-purple-700'
              : inMobileMenu 
                ? 'bg-purple-600 text-white hover:bg-purple-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Title
        </button>
        <button
          onClick={() => handleFieldChange('description')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            searchFilters.field === 'description'
              ? 'bg-purple-100 text-purple-700'
              : inMobileMenu 
                ? 'bg-purple-600 text-white hover:bg-purple-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => handleFieldChange('location')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            searchFilters.field === 'location'
              ? 'bg-purple-100 text-purple-700'
              : inMobileMenu 
                ? 'bg-purple-600 text-white hover:bg-purple-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Location
        </button>
      </div>
    </div>
  );
};

export default SearchBar;