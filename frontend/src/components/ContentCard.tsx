import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, User, Calendar, Utensils, Film, Music, Trophy, BookOpen, GraduationCap, Plane, Cpu, Newspaper } from 'lucide-react';
import { ContentItem } from '../types/content';
import { use3DTilt } from '../hooks/use3DTilt';

interface ContentCardProps {
  item: ContentItem;
  onClick: (item: ContentItem) => void;
  index: number;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, onClick, index }) => {
  const { cardRef, tiltStyle, glowStyle, handleMouseMove, handleMouseLeave } = use3DTilt(8);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getCleanDomain = (urlString: string) => {
    if (!urlString) return 'Source Link';
    try {
      const formatted = urlString.startsWith('http') ? urlString : `https://${urlString}`;
      return new URL(formatted).hostname.replace(/^www\./, '');
    } catch (e) {
      return 'Original Link';
    }
  };

  const domainName = getCleanDomain(item.url);

  // Topic SVG Icon Fallback
  const renderTopicIcon = () => {
    const text = ((item.category || '') + ' ' + (item.title || '')).toLowerCase();
    if (text.includes('food') || text.includes('dining') || text.includes('recipe')) return <Utensils className="w-8 h-8 text-amber-400" />;
    if (text.includes('movie') || text.includes('cinema') || text.includes('janaki')) return <Film className="w-8 h-8 text-purple-400" />;
    if (text.includes('music') || text.includes('song')) return <Music className="w-8 h-8 text-pink-400" />;
    if (text.includes('sport') || text.includes('cricket') || text.includes('hockey')) return <Trophy className="w-8 h-8 text-emerald-400" />;
    if (text.includes('book') || text.includes('comic')) return <BookOpen className="w-8 h-8 text-cyan-400" />;
    if (text.includes('education') || text.includes('college')) return <GraduationCap className="w-8 h-8 text-blue-400" />;
    if (text.includes('indigo') || text.includes('flight')) return <Plane className="w-8 h-8 text-sky-400" />;
    if (text.includes('sci') || text.includes('tech')) return <Cpu className="w-8 h-8 text-indigo-400" />;
    return <Newspaper className="w-8 h-8 text-violet-accent" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3) }}
      className="h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onClick(item)}
        style={tiltStyle}
        className="group relative h-full rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between cursor-pointer overflow-hidden border border-white/10 preserve-3d transition-shadow duration-300 shadow-glass-md"
      >
        {/* Dynamic Radial Glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
          style={glowStyle}
        />

        <div>
          {/* Requirement #5 & #7: 16:9 Image Container with Overlay */}
          <div className="relative w-full aspect-video overflow-hidden bg-navy-900 border-b border-white/10 preserve-3d">
            
            {/* Shimmer loading state */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-white/5 animate-pulse" />
            )}

            {item.image && !imageError ? (
              <img
                src={item.image}
                alt={item.title || 'Article Thumbnail'}
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.04] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            ) : (
              /* Topic SVG Fallback */
              <div className="w-full h-full bg-gradient-to-br from-navy-900 via-navy-800 to-violet-accent/20 flex flex-col items-center justify-center p-4 text-center">
                {renderTopicIcon()}
                <span className="text-[11px] font-mono text-slate-400 mt-2 truncate max-w-[80%]">
                  {item.category || 'News'}
                </span>
              </div>
            )}

            {/* Gradient Overlay & Category Tag */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent opacity-80" />
            
            <div className="absolute top-3 right-3 translate-z-20">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-midnight/80 text-aqua border border-violet-accent/40 backdrop-blur-md shadow-sm">
                {item.category || 'General'}
              </span>
            </div>

          </div>

          {/* Body */}
          <div className="p-5 space-y-3 preserve-3d">
            
            {item.date && (
              <span className="flex items-center text-[11px] font-mono text-slate-400 translate-z-10">
                <Calendar className="w-3 h-3 mr-1 text-slate-500" />
                {item.date}
              </span>
            )}

            <h3 className="font-heading text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-accent transition-all duration-300 line-clamp-2 leading-snug translate-z-20">
              {item.title}
            </h3>

            <p className="text-xs text-slate-300 font-light line-clamp-2 leading-relaxed translate-z-10">
              {item.content}
            </p>

          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs translate-z-10">
          
          <div className="flex items-center text-slate-300 font-medium space-x-1.5 truncate max-w-[55%]">
            <User className="w-3.5 h-3.5 text-violet-accent shrink-0" />
            <span className="truncate">By {item.author || 'The Hindu'}</span>
          </div>

          <div className="flex items-center space-x-1 text-aqua font-mono font-medium group-hover:text-white transition-colors">
            <span className="truncate max-w-[100px]">{domainName}</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>

        </div>

      </div>
    </motion.div>
  );
};
