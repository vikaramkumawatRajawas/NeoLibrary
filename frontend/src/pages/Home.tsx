import React from 'react';
import { Hero } from '../components/Hero';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { ContentGrid } from '../components/ContentGrid';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ContentItem, SortOption } from '../types/content';
import { Layers } from 'lucide-react';

interface HomeProps {
  items: ContentItem[];
  allItems: ContentItem[];
  categories: string[];
  authors: string[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedAuthor: string;
  setSelectedAuthor: (author: string) => void;
  quickFilter: 'all' | 'latest' | 'popular';
  setQuickFilter: (filter: 'all' | 'latest' | 'popular') => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  clearFilters: () => void;
  onRetry: () => void;
  onOpenSettings: () => void;
  onCardClick: (item: ContentItem) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}

export const Home: React.FC<HomeProps> = ({
  items,
  allItems,
  categories,
  authors,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedAuthor,
  setSelectedAuthor,
  quickFilter,
  setQuickFilter,
  sortOption,
  setSortOption,
  clearFilters,
  onRetry,
  onOpenSettings,
  onCardClick,
  searchRef,
}) => {
  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedAuthor !== 'All' || quickFilter !== 'all';

  const scrollToCollection = () => {
    const section = document.getElementById('collection-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16">
      
      {/* SaaS Hero Section */}
      <Hero
        onExploreClick={scrollToCollection}
        featuredCards={allItems.slice(0, 3)}
        onCardClick={onCardClick}
      />

      {/* Collection Discovery Section */}
      <div id="collection-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-28">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-xs font-mono text-aqua border border-aqua/30">
            <Layers className="w-3.5 h-3.5" />
            <span>3D Interactive Collection</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Explore Content Library
          </h2>

          <p className="text-sm text-slate-300 font-light max-w-xl mx-auto">
            Hover cards for 3D perspective physics. Click any item to launch the full article reader view.
          </p>
        </div>

        {/* Global Search Bar */}
        <SearchBar
          ref={searchRef}
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          resultCount={items.length}
          totalCount={allItems.length}
        />

        {/* Filter Controls Bar */}
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          authors={authors}
          selectedAuthor={selectedAuthor}
          onSelectAuthor={setSelectedAuthor}
          quickFilter={quickFilter}
          onSelectQuickFilter={setQuickFilter}
          sortOption={sortOption}
          onSelectSortOption={setSortOption}
          onResetFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Dynamic State Rendering */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} onOpenSettings={onOpenSettings} />
        ) : items.length === 0 ? (
          <EmptyState searchQuery={searchQuery} onClearSearch={clearFilters} />
        ) : (
          <ContentGrid items={items} onCardClick={onCardClick} />
        )}

      </div>

    </div>
  );
};
