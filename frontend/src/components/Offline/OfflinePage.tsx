import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

const OfflinePage: React.FC = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        <div className="flex justify-center mb-6">
          <WifiOff className="w-24 h-24 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          You're offline
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          It looks like you've lost your internet connection. Don't worry, 
          CalenDO can still work offline with your cached data.
        </p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
};

export default OfflinePage;
