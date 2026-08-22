import React from 'react';
import { Sparkles, Library, Layers, Info, Settings, Search, ExternalLink } from 'lucide-react';
import { ActiveTab } from '../types/content';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onFocusSearch: () => void;
  sourceType?: string;
  totalItemsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onFocusSearch,
  sourceType = 'google_sheets',
  totalItemsCount,
}) => {
  const getBadgeText = () => {
    if (sourceType === 'sample_fallback') return 'Sample Mode';
    if (sourceType === 'google_sheets_api') return 'API Connected';
    if (sourceType === 'gviz_public' || sourceType === 'csv_public') return 'Live Sheet';
    return 'Dynamic Sync';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-header transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-accent p-[1px] shadow-glow-violet transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-navy-900/90 rounded-[11px] flex items-center justify-center backdrop-blur-md">
              <Library className="w-5 h-5 text-aqua transition-transform duration-300 group-hover:rotate-12" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading text-xl font-bold tracking-tight text-white group-hover:text-aqua transition-colors">
                Neo<span className="text-transparent bg-clip-text bg-gradient-accent">Library</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-violet-accent/20 text-aqua border border-violet-accent/30">
                3D
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans hidden sm:block">Dynamic Content Hub</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 glass-panel p-1.5 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'home'
                ? 'bg-gradient-accent text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('explore');
              setTimeout(onFocusSearch, 100);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'explore'
                ? 'bg-gradient-accent text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Explore</span>
            {totalItemsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 text-white font-mono">
                {totalItemsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'about'
                ? 'bg-gradient-accent text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </button>
        </nav>

        {/* Actions & Settings Trigger */}
        <div className="flex items-center space-x-3">
          
          {/* Quick Search trigger */}
          <button
            onClick={onFocusSearch}
            className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white hover:border-violet-accent/50 transition-all flex items-center space-x-2 group"
            title="Search collection (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-aqua transition-colors" />
            <span className="text-xs text-slate-400 font-mono hidden lg:inline-block">Search...</span>
          </button>

          {/* Sheet Status & Config Button */}
          <button
            onClick={onOpenSettings}
            className="px-3 py-2 rounded-xl glass-panel text-xs font-medium text-slate-300 hover:text-white border-white/10 hover:border-aqua/40 transition-all flex items-center space-x-2 group"
            title="Configure Google Sheet URL or API Key"
          >
            <span className={`w-2 h-2 rounded-full ${sourceType === 'sample_fallback' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="font-mono text-[11px] text-slate-300 group-hover:text-aqua">{getBadgeText()}</span>
            <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
          </button>

        </div>
      </div>
    </header>
  );
};
