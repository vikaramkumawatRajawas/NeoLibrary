import React from 'react';
import { motion } from 'framer-motion';
import { Compass, BookOpen, ArrowRight, Sparkles, Database, Layers } from 'lucide-react';
import { ContentItem } from '../types/content';

interface HeroProps {
  onExploreClick: () => void;
  featuredCards: ContentItem[];
  onCardClick: (item: ContentItem) => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, featuredCards, onCardClick }) => {
  return (
    <div className="relative pt-12 pb-20 overflow-hidden">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:col-span-7 space-y-6 z-10 text-center lg:text-left"
          >
            {/* Top Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel border border-violet-accent/40 bg-violet-accent/10 text-aqua text-xs font-mono font-medium shadow-glow-violet">
              <Sparkles className="w-3.5 h-3.5 text-aqua animate-spin-slow" />
              <span>Dynamic Google Sheets Engine 2.0</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Discover. <br />
              <span className="text-transparent bg-clip-text bg-gradient-accent">Explore. Learn.</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
              A curated digital library powered by your content collection. Dynamically synced from your spreadsheet with instant 3D spatial presentation and deep reading preview.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-accent text-white font-semibold text-base shadow-lg shadow-violet-accent/30 hover:shadow-violet-accent/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 group"
              >
                <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                <span>Explore Content</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-slate-200 font-semibold text-base border-white/10 hover:border-aqua/40 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-5 h-5 text-aqua" />
                <span>View Collection</span>
              </button>
            </div>

            {/* Feature Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-heading text-xl font-bold text-white flex items-center">
                  <Database className="w-4 h-4 text-aqua mr-1.5" /> 100%
                </span>
                <span className="text-xs text-slate-400">Sheet Synced</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-heading text-xl font-bold text-white flex items-center">
                  <Layers className="w-4 h-4 text-violet-accent mr-1.5" /> 3D Spatial
                </span>
                <span className="text-xs text-slate-400">Tilt Physics</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-heading text-xl font-bold text-white flex items-center">
                  <Sparkles className="w-4 h-4 text-cyber-blue mr-1.5" /> Reader
                </span>
                <span className="text-xs text-slate-400">Auto Extraction</span>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Animated 3D Floating Cards Stack */}
          <div className="lg:col-span-5 relative min-h-[420px] flex items-center justify-center">
            
            {/* Background 3D Floating Ring/Grid */}
            <div className="absolute w-80 h-80 rounded-full border border-violet-accent/20 animate-spin-slow pointer-events-none" />
            <div className="absolute w-96 h-96 rounded-full border border-cyber-blue/15 animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse' }} />

            {/* Stacked Floating Cards */}
            <div className="relative w-full max-w-sm h-96 preserve-3d">
              
              {/* Card 1 (Top floating) */}
              {featuredCards[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  onClick={() => onCardClick(featuredCards[0])}
                  className="absolute top-0 left-4 right-4 glass-panel p-5 rounded-2xl border border-violet-accent/40 shadow-glass-lg cursor-pointer animate-float group transition-transform hover:scale-105 z-30"
                  style={{ transform: 'perspective(1000px) rotateX(6deg) rotateY(-8deg)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-violet-accent/20 text-aqua border border-violet-accent/30">
                      {featuredCards[0].category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{featuredCards[0].date}</span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-white group-hover:text-aqua transition-colors line-clamp-2 mb-2">
                    {featuredCards[0].title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 font-light mb-4">
                    {featuredCards[0].content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                    <span className="font-medium text-slate-300">By {featuredCards[0].author}</span>
                    <span className="text-aqua flex items-center">Read Article &rarr;</span>
                  </div>
                </motion.div>
              )}

              {/* Card 2 (Middle offset depth layer) */}
              {featuredCards[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 0.85, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  onClick={() => onCardClick(featuredCards[1])}
                  className="absolute top-24 -left-2 right-10 glass-panel p-5 rounded-2xl border border-cyber-blue/30 shadow-glass-md cursor-pointer animate-float-slow group transition-transform hover:scale-105 z-20"
                  style={{ transform: 'perspective(1000px) rotateX(10deg) rotateY(12deg)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30">
                      {featuredCards[1].category}
                    </span>
                  </div>
                  <h4 className="font-heading text-base font-semibold text-slate-200 line-clamp-1 mb-1">
                    {featuredCards[1].title}
                  </h4>
                  <p className="text-xs text-slate-400 font-light line-clamp-1">
                    By {featuredCards[1].author}
                  </p>
                </motion.div>
              )}

              {/* Card 3 (Bottom deep layer) */}
              {featuredCards[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  onClick={() => onCardClick(featuredCards[2])}
                  className="absolute top-48 left-10 -right-2 glass-panel p-4 rounded-2xl border border-white/10 shadow-glass-sm cursor-pointer animate-float-reverse group transition-transform hover:scale-105 z-10"
                  style={{ transform: 'perspective(1000px) rotateX(-8deg) rotateY(-15deg)' }}
                >
                  <h4 className="font-heading text-sm font-semibold text-slate-300 line-clamp-1">
                    {featuredCards[2].title}
                  </h4>
                  <span className="text-[11px] text-slate-400">{featuredCards[2].category}</span>
                </motion.div>
              )}

            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
