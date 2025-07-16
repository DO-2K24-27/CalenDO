import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, WifiOff, Menu, X } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { PlanningMultiSelector } from '../Planning/PlanningMultiSelector';
import SearchBar from '../Search/SearchBar';
import InstallButton from '../PWA/InstallButton';

const Header: React.FC = () => {
  const { view, setView } = useCalendar();
  const isOnline = useOnlineStatus();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-purple-700 text-white shadow-md">
      <div className="container mx-auto px-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between py-3">
          {/* Mobile: Burger Menu + Logo */}
          <div className="flex items-center space-x-3 md:space-x-2">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-1 rounded-md hover:bg-purple-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <Calendar size={20} className="text-purple-200 md:block hidden" />
              <h1 className="text-xl md:text-2xl font-bold">CalenDO</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isOnline && (
              <div className="flex items-center space-x-1 text-red-300">
                <WifiOff size={16} />
                <span className="text-sm font-medium">Offline</span>
              </div>
            )}
            
            <nav className="flex space-x-4">
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
            
            <InstallButton />
            
            <Link 
              to="/countdown" 
              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-md transition-colors"
            >
              <Clock size={18} />
              <span>Countdown</span>
            </Link>
          </div>

          {/* Mobile: Offline indicator */}
          {!isOnline && (
            <div className="flex items-center md:hidden">
              <WifiOff size={16} className="text-red-300" />
            </div>
          )}
        </div>
        
        {/* Desktop Planning Selector Row */}
        <div className="hidden md:block border-t border-purple-600 pt-3 pb-4">
          <div className="flex flex-col gap-3">
            <SearchBar />
            <PlanningMultiSelector />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-purple-800 border-t border-purple-600">
          <div className="px-4 py-3 space-y-3">
            {/* Search Bar */}
            <div className="pt-2 border-b border-purple-700 pb-3">
              <SearchBar inMobileMenu={true} />
            </div>
            
            {/* View Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setView('month');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${
                  view === 'month' ? 'bg-purple-900' : 'hover:bg-purple-700'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => {
                  setView('week');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${
                  view === 'week' ? 'bg-purple-900' : 'hover:bg-purple-700'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => {
                  setView('day');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${
                  view === 'day' ? 'bg-purple-900' : 'hover:bg-purple-700'
                }`}
              >
                Day
              </button>
            </div>
            
            {/* Planning Selector */}
            <div className="pt-2 border-t border-purple-700">
              <PlanningMultiSelector />
            </div>
            
            {/* Menu Items */}
            <div className="pt-2 border-t border-purple-700 space-y-2">
              <Link 
                to="/countdown" 
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Clock size={18} />
                <span>Countdown</span>
              </Link>
              
              <div className="flex items-center justify-center pt-2">
                <InstallButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;