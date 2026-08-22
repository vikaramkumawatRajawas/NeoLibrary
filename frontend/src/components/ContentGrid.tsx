import React from 'react';
import { ContentItem } from '../types/content';
import { ContentCard } from './ContentCard';

interface ContentGridProps {
  items: ContentItem[];
  onCardClick: (item: ContentItem) => void;
}

export const ContentGrid: React.FC<ContentGridProps> = ({ items, onCardClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {items.map((item, index) => (
        <ContentCard
          key={item.id || `card-${index}`}
          item={item}
          onClick={onCardClick}
          index={index}
        />
      ))}
    </div>
  );
};
