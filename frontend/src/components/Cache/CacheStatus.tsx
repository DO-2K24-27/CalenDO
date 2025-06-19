import React from 'react';
import { Clock, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface CacheStatusProps {
  lastUpdated: Date | null;
  isStale: boolean;
  loading: boolean;
  error: Error | null;
  onRefresh?: () => void;
  className?: string;
}

const CacheStatus: React.FC<CacheStatusProps> = ({
  lastUpdated,
  isStale,
  loading,
  error,
  onRefresh,
  className = ''
}) => {
  const isOnline = useOnlineStatus();

  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (isStale) return 'text-yellow-500';
    if (!isOnline) return 'text-gray-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (loading) return 'Updating...';
    if (error && !lastUpdated) return 'Failed to load';
    if (error && lastUpdated) return 'Using cached data';
    if (isStale) return 'Data may be outdated';
    if (!isOnline) return 'Offline - using cached data';
    return 'Data up to date';
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (error) return <AlertCircle className="w-4 h-4" />;
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
      
      {lastUpdated && (
        <span className="text-gray-500">
          • Updated {formatLastUpdated(lastUpdated)}
        </span>
      )}
      
      {onRefresh && isOnline && !loading && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 ml-2"
          title="Refresh data"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      )}
    </div>
  );
};

export default CacheStatus;
