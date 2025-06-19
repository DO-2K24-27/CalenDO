import React from 'react';
import { Download, X, RefreshCw } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

const PWAPrompt: React.FC = () => {
  const { isInstallable, isUpdateAvailable, installApp, updateApp } = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = React.useState(false);

  React.useEffect(() => {
    if (isInstallable) {
      // Show install prompt after a delay
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  React.useEffect(() => {
    if (isUpdateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [isUpdateAvailable]);

  const handleInstall = async () => {
    await installApp();
    setShowInstallPrompt(false);
  };

  const handleUpdate = () => {
    updateApp();
    setShowUpdatePrompt(false);
  };

  if (!showInstallPrompt && !showUpdatePrompt) {
    return null;
  }

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Install CalenDO
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Install CalenDO as an app for quick access and offline use.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Update Available</h3>
              <p className="text-sm opacity-90 mt-1">
                A new version of CalenDO is available. Update now for the latest features.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowUpdatePrompt(false)}
                  className="px-3 py-1.5 text-white/80 text-sm font-medium rounded-md hover:bg-white/10 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="flex-shrink-0 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAPrompt;
