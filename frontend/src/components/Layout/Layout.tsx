import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Github } from 'lucide-react';
import Header from './Header';
import { useFullscreen } from '../../hooks/useFullscreen';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFullscreen = useFullscreen();
  const isCountdownPage = location.pathname === '/countdown';
  const isDisplayPage = location.pathname === '/display';
  const hideChrome = isCountdownPage || isDisplayPage;

  // Going fullscreen on the main calendar switches to the chrome-less /display
  // page, and leaving fullscreen goes back. The `fromFullscreen` state ensures
  // we only leave /display when we got there this way, so a kiosk opening
  // /display directly (not fullscreen) isn't redirected away.
  const cameFromFullscreen = (location.state as { fromFullscreen?: boolean } | null)?.fromFullscreen;
  useEffect(() => {
    if (isFullscreen && location.pathname === '/') {
      navigate('/display', { replace: true, state: { fromFullscreen: true } });
    } else if (!isFullscreen && isDisplayPage && cameFromFullscreen) {
      navigate('/', { replace: true });
    }
  }, [isFullscreen, location.pathname, isDisplayPage, cameFromFullscreen, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-purple-50">
      {!hideChrome && <Header />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {!hideChrome && (
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