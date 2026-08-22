import React from 'react';
import { Filter, User, Tag, Sparkles, RefreshCw } from 'lucide-react';
import { SortOption } from '../types/content';
import { SortDropdown } from './SortDropdown';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  authors: string[];
  selectedAuthor: string;
  onSelectAuthor: (author: string) => void;
  quickFilter: 'all' | 'latest' | 'popular';
  onSelectQuickFilter: (filter: 'all' | 'latest' | 'popular') => void;
  sortOption: SortOption;
  onSelectSortOption: (option: SortOption) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  authors,
  selectedAuthor,
  onSelectAuthor,
  quickFilter,
  onSelectQuickFilter,
  sortOption,
  onSelectSortOption,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="w-full space-y-4">
      
      {/* Top Row: Quick Tabs + Sort Dropdown */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-white/10">
        
        {/* Quick Filter Tabs (All / Latest / Popular) */}
        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => onSelectQuickFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition-all whitespace-nowrap ${
              quickFilter === 'all'
                ? 'bg-gradient-accent text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Content
          </button>

          <button
            onClick={() => onSelectQuickFilter('latest')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition-all whitespace-nowrap ${
              quickFilter === 'latest'
                ? 'bg-gradient-accent text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚡ Latest Additions
          </button>

          <button
            onClick={() => onSelectQuickFilter('popular')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition-all whitespace-nowrap ${
              quickFilter === 'popular'
                ? 'bg-gradient-accent text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🔥 Featured
          </button>
        </div>

        {/* Dynamic Category & Author Dropdowns + Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Category Dropdown */}
          <div className="relative flex items-center">
            <Tag className="w-3.5 h-3.5 text-aqua absolute left-3 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="bg-navy-900 text-slate-200 text-xs font-medium pl-8 pr-7 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-aqua/50 appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-navy-900 text-white">
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Author Dropdown */}
          <div className="relative flex items-center">
            <User className="w-3.5 h-3.5 text-violet-accent absolute left-3 pointer-events-none" />
            <select
              value={selectedAuthor}
              onChange={(e) => onSelectAuthor(e.target.value)}
              className="bg-navy-900 text-slate-200 text-xs font-medium pl-8 pr-7 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-violet-accent/50 appearance-none cursor-pointer"
            >
              {authors.map((auth) => (
                <option key={auth} value={auth} className="bg-navy-900 text-white">
                  Author: {auth}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <SortDropdown selected={sortOption} onSelect={onSelectSortOption} />

          {/* Reset Filters CTA */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="p-2 rounded-xl bg-violet-accent/20 text-aqua border border-violet-accent/40 hover:bg-violet-accent/30 transition-all flex items-center space-x-1 text-xs"
              title="Reset all filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
