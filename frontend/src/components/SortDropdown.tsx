import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { SortOption } from '../types/content';

interface SortDropdownProps {
  selected: SortOption;
  onSelect: (option: SortOption) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ selected, onSelect }) => {
  return (
    <div className="relative flex items-center">
      <ArrowUpDown className="w-3.5 h-3.5 text-cyber-blue absolute left-3 pointer-events-none" />
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value as SortOption)}
        className="bg-navy-900 text-slate-200 text-xs font-medium pl-8 pr-7 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyber-blue/50 appearance-none cursor-pointer"
      >
        <option value="newest" className="bg-navy-900 text-white">Sort: Newest First</option>
        <option value="oldest" className="bg-navy-900 text-white">Sort: Oldest First</option>
        <option value="a-z" className="bg-navy-900 text-white">Sort: Title A &rarr; Z</option>
        <option value="z-a" className="bg-navy-900 text-white">Sort: Title Z &rarr; A</option>
        <option value="author" className="bg-navy-900 text-white">Sort: By Author</option>
      </select>
    </div>
  );
};
