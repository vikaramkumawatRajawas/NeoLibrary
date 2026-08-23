import React from 'react';
import { SearchX, RefreshCw, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
  hasActiveFilters?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, onClearSearch, hasActiveFilters }) => {
  const isFiltered = Boolean(searchQuery || hasActiveFilters);

  return (
    <div className="py-16 px-4 text-center max-w-md mx-auto space-y-6">
      
      {/* 3D floating visual */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-gradient-accent opacity-20 blur-xl animate-pulse-glow" />
        <div className="relative w-20 h-20 rounded-2xl glass-panel border border-violet-accent/40 flex items-center justify-center shadow-glass-md animate-float">
          <SearchX className="w-10 h-10 text-aqua" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-heading text-2xl font-bold text-white">
          {isFiltered ? 'No content found' : 'No articles available.'}
        </h3>
        <p className="text-sm text-slate-400">
          {searchQuery 
            ? `We couldn't find any articles or resources matching "${searchQuery}".` 
            : isFiltered 
              ? 'No items match your active category or author filters.'
              : 'There are currently no articles available.'}
        </p>
      </div>

      {isFiltered && (
        <div className="pt-2">
          <button
            onClick={onClearSearch}
            className="px-6 py-3 rounded-xl bg-gradient-accent text-white font-semibold text-sm shadow-glow-violet hover:scale-105 active:scale-95 transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear Search & Filters</span>
          </button>
        </div>
      )}

    </div>
  );
};

