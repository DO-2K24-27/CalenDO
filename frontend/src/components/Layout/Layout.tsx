import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} CalenDO. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;