import React from 'react';
import { Library, Github, Twitter, Sparkles, Heart } from 'lucide-react';
import { ActiveTab } from '../types/content';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="mt-28 border-t border-white/10 bg-navy-900/60 backdrop-blur-xl relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent p-[1px] shadow-glow-violet">
                <div className="w-full h-full bg-navy-900 rounded-[7px] flex items-center justify-center">
                  <Library className="w-4 h-4 text-aqua" />
                </div>
              </div>
              <span className="font-heading text-lg font-bold text-white tracking-tight">
                Neo<span className="text-transparent bg-clip-text bg-gradient-accent">Library</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light">
              "Curated content. One beautiful place."
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Powered dynamically by Google Sheets & Server-Side Reader Extraction.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="md:col-span-4 flex items-center justify-center space-x-6 text-xs text-slate-300 font-medium">
            <button onClick={() => setActiveTab('home')} className="hover:text-aqua transition-colors">
              Home
            </button>
            <button onClick={() => setActiveTab('explore')} className="hover:text-aqua transition-colors">
              Explore Library
            </button>
            <button onClick={() => setActiveTab('about')} className="hover:text-aqua transition-colors">
              About Platform
            </button>
          </div>

          {/* Copyright & Social */}
          <div className="md:col-span-3 text-center md:text-right space-y-2">
            <div className="flex items-center justify-center md:justify-end space-x-3 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl glass-panel hover:text-white hover:border-aqua/50 transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl glass-panel hover:text-white hover:border-aqua/50 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              &copy; {new Date().getFullYear()} NeoLibrary 3D Digital Platform. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
