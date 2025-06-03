import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';

const Header: React.FC = () => {
  const { view, setView } = useCalendar();
  
  return (
    <header className="bg-purple-700 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar size={24} className="text-purple-200" />
            <h1 className="text-2xl font-bold">CalenDO</h1>
          </Link>
          
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-4">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  view === 'month' ? 'bg-purple-800' : 'hover:bg-purple-600'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  view === 'week' ? 'bg-purple-800' : 'hover:bg-purple-600'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  view === 'day' ? 'bg-purple-800' : 'hover:bg-purple-600'
                }`}
              >
                Day
              </button>
            </nav>
            
            <Link 
              to="/countdown" 
              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-md transition-colors"
            >
              <Clock size={18} />
              <span className="hidden sm:inline">Countdown</span>
            </Link>
          </div>
        </div>
        
        <div className="md:hidden pb-3 flex space-x-2">
          <button
            onClick={() => setView('month')}
            className={`flex-1 px-2 py-1 rounded-md text-sm transition-colors ${
              view === 'month' ? 'bg-purple-800' : 'hover:bg-purple-600'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`flex-1 px-2 py-1 rounded-md text-sm transition-colors ${
              view === 'week' ? 'bg-purple-800' : 'hover:bg-purple-600'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('day')}
            className={`flex-1 px-2 py-1 rounded-md text-sm transition-colors ${
              view === 'day' ? 'bg-purple-800' : 'hover:bg-purple-600'
            }`}
          >
            Day
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;