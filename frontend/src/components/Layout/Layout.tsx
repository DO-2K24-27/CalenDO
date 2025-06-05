import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Github } from 'lucide-react';
import Header from './Header';

const Layout: React.FC = () => {
  const location = useLocation();
  const isCountdownPage = location.pathname === '/countdown';

  return (
    <div className="flex flex-col min-h-screen bg-purple-50">
      {!isCountdownPage && <Header />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isCountdownPage && (
        <footer className="bg-white py-4 shadow-inner">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} CalenDO. All rights reserved.
              </p>
              <a 
                href="https://github.com/DO-2K24-27/CalenDO" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                title="View on GitHub"
              >
                <Github size={16} />
                <span>View on GitHub</span>
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;