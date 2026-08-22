import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl glass-panel p-6 space-y-4 animate-pulse border border-white/5 h-[340px] flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="w-20 h-4 bg-white/10 rounded-full" />
              <div className="w-16 h-3 bg-white/5 rounded-full" />
            </div>
            <div className="w-full h-36 bg-white/5 rounded-xl" />
            <div className="w-3/4 h-6 bg-white/10 rounded-lg" />
            <div className="w-full h-4 bg-white/5 rounded-md" />
            <div className="w-2/3 h-4 bg-white/5 rounded-md" />
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <div className="w-24 h-4 bg-white/10 rounded-md" />
            <div className="w-16 h-4 bg-white/10 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};
