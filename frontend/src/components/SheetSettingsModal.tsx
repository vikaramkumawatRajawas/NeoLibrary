import React, { useState } from 'react';
import { X, Database, Key, Check, RefreshCw, HelpCircle } from 'lucide-react';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSheetUrl: string;
  currentApiKey: string;
  onSave: (sheetUrl: string, apiKey: string) => void;
  sourceType?: string;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSheetUrl,
  currentApiKey,
  onSave,
  sourceType,
}) => {
  const [sheetUrl, setSheetUrl] = useState(currentSheetUrl || '');
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(sheetUrl, apiKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 shadow-glass-lg space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-gradient-accent text-white shadow-glow-violet">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Google Sheet Integration</h3>
            <p className="text-xs text-slate-400">Configure single source of truth for library content</p>
          </div>
        </div>

        {/* Status Banner */}
        <div className="p-3.5 rounded-2xl bg-navy-900 border border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Current Mode:</span>
          <span className="text-aqua font-semibold uppercase">{sourceType || 'Dynamic'}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sheet URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center">
              <Database className="w-3.5 h-3.5 text-aqua mr-1.5" />
              Google Sheet Web Link or Sheet ID
            </label>
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/1KDVGSCjW9CU7..."
              className="w-full bg-navy-900 text-white placeholder-slate-500 text-xs rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-aqua/50"
            />
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span className="flex items-center">
                <Key className="w-3.5 h-3.5 text-violet-accent mr-1.5" />
                Google Sheets API Key (Optional for private sheets)
              </span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-navy-900 text-white placeholder-slate-500 text-xs rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-violet-accent/50"
            />
          </div>

          {/* Note */}
          <div className="p-3 rounded-xl bg-violet-accent/10 border border-violet-accent/20 text-[11px] text-slate-300 space-y-1">
            <div className="font-semibold text-aqua flex items-center">
              <HelpCircle className="w-3.5 h-3.5 mr-1" /> Flexible Data Mapper Active
            </div>
            <p>
              Columns are automatically mapped: <code className="text-aqua font-mono">title</code>, <code className="text-aqua font-mono">author</code>, <code className="text-aqua font-mono">url</code>, <code className="text-aqua font-mono">content</code>, <code className="text-aqua font-mono">category</code>, <code className="text-aqua font-mono">date</code>, <code className="text-aqua font-mono">image</code>.
            </p>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-accent text-white font-semibold text-sm shadow-glow-violet hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Syncing Sheet...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Save & Sync Data</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
