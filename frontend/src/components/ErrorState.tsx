import React from 'react';
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onOpenSettings: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, onOpenSettings }) => {
  return (
    <div className="py-16 px-4 text-center max-w-lg mx-auto space-y-6">
      
      {/* 3D Warning Visual */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-glass-md">
          <AlertTriangle className="w-8 h-8" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-heading text-2xl font-bold text-white">Google Sheet Connection Issue</h3>
        <p className="text-sm text-slate-300 leading-relaxed font-light">
          {message || 'Unable to sync spreadsheet content. Check your network or Google Sheet sharing permissions.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-accent text-white font-semibold text-sm shadow-glow-violet hover:scale-105 transition-all flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Sync</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full sm:w-auto px-6 py-3 rounded-xl glass-panel text-slate-300 hover:text-white border-white/10 hover:border-aqua/40 text-sm font-semibold transition-all flex items-center justify-center space-x-2"
        >
          <Settings className="w-4 h-4 text-aqua" />
          <span>Sheet Settings</span>
        </button>
      </div>

    </div>
  );
};
