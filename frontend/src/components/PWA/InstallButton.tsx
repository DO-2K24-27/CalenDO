import React from 'react';
import { Download } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

const InstallButton: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <button
      onClick={installApp}
      className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-md transition-colors text-sm"
      title="Install CalenDO as an app"
    >
      <Download size={16} />
      <span className="hidden sm:inline">Install</span>
    </button>
  );
};

export default InstallButton;
