import React, { forwardRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({
  value,
  onChange,
  onClear,
  resultCount,
  totalCount,
}, ref) => {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative group">
        
        {/* Glow halo */}
        <div className="absolute -inset-0.5 bg-gradient-accent rounded-2xl opacity-30 group-hover:opacity-75 blur-md transition-opacity duration-300 pointer-events-none" />

        {/* Input bar */}
        <div className="relative flex items-center bg-navy-800/90 rounded-2xl border border-white/10 px-4 py-3.5 shadow-glass-md backdrop-blur-xl">
          <Search className="w-5 h-5 text-slate-400 group-hover:text-aqua transition-colors mr-3 shrink-0" />
          
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search articles, authors, topics, links..."
            className="w-full bg-transparent text-white placeholder-slate-400 font-sans text-base focus:outline-none"
          />

          {value && (
            <button
              onClick={onClear}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors mr-2 shrink-0"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Results Badge */}
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-navy-900 border border-white/10 text-xs font-mono text-slate-300 shrink-0">
            <span className="text-aqua font-bold">{resultCount}</span>
            <span className="text-slate-400">/ {totalCount} items</span>
          </div>

        </div>
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
