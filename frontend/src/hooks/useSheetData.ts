import { useState, useEffect, useMemo, useCallback } from 'react';
import { ContentItem, SheetApiResponse, SortOption } from '../types/content';
import { fetchSheetData } from '../services/api';

export function useSheetData(customSheetUrl?: string, customApiKey?: string) {
  const [data, setData] = useState<SheetApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search, Filter & Sort state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('All');
  const [quickFilter, setQuickFilter] = useState<'all' | 'latest' | 'popular'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSheetData(customSheetUrl, customApiKey);
      setData(res);
    } catch (err: any) {
      console.error('[useSheetData error]', err);
      if (err instanceof TypeError || err.name === 'TypeError' || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Unable to load articles. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [customSheetUrl, customApiKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract unique categories & authors dynamically
  const categories = useMemo(() => {
    if (!data?.items) return ['All'];
    const set = new Set(data.items.map(item => item.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [data]);

  const authors = useMemo(() => {
    if (!data?.items) return ['All'];
    const set = new Set(data.items.map(item => item.author).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [data]);

  // Process Search, Filter and Sorting
  const filteredAndSortedItems = useMemo(() => {
    if (!data?.items) return [];

    let items = [...data.items];

    // 1. Category Filter
    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 2. Author Filter
    if (selectedAuthor !== 'All') {
      items = items.filter(item => item.author.toLowerCase() === selectedAuthor.toLowerCase());
    }

    // 3. Quick Filter (Latest / Popular)
    if (quickFilter === 'latest') {
      items = items.slice(0, 10);
    }

    // 4. Search Filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    const parseSafeDate = (dateStr?: string): number => {
      if (!dateStr) return 0;
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) return parsed;
      const match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (match) {
        const d = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
        if (!isNaN(d.getTime())) return d.getTime();
      }
      return 0;
    };

    items.sort((a, b) => {
      if (sortOption === 'newest') {
        return parseSafeDate(b.date) - parseSafeDate(a.date);
      }
      if (sortOption === 'oldest') {
        return parseSafeDate(a.date) - parseSafeDate(b.date);
      }
      if (sortOption === 'a-z') {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === 'z-a') {
        return b.title.localeCompare(a.title);
      }
      if (sortOption === 'author') {
        return a.author.localeCompare(b.author);
      }
      return 0;
    });

    return items;
  }, [data, searchQuery, selectedCategory, selectedAuthor, quickFilter, sortOption]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedAuthor('All');
    setQuickFilter('all');
    setSortOption('newest');
  }, []);

  return {
    items: filteredAndSortedItems,
    allItems: data?.items || [],
    rawApiResponse: data,
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
    refresh: loadData,
  };
}
