import React from 'react';
import { Database, ShieldCheck, Cpu, Layers, Sparkles, Code } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel border border-violet-accent/40 text-aqua text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NeoLibrary Architecture</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white">
          About NeoLibrary 3D
        </h1>
        <p className="text-base text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          A modern digital content hub powered dynamically by Google Sheets and server-side article extraction.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-accent flex items-center justify-center text-white shadow-glow-violet">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-lg font-bold text-white">Dynamic Spreadsheet Engine</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            Google Sheets acts as the single source of truth. Any row updates, additions, or edits automatically reflect across the platform without touching code.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-accent flex items-center justify-center text-white shadow-glow-cyber">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-lg font-bold text-white">Server-Side Article Reader</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            Every card URL is processed through Mozilla Readability & Cheerio to deliver a distraction-free editorial reading experience.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-accent flex items-center justify-center text-white shadow-glow-aqua">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-lg font-bold text-white">3D Spatial Interface</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            Built with CSS 3D perspective transforms, mouse tilt physics, ambient lighting glow, and glassmorphism depth layers.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-accent flex items-center justify-center text-white shadow-glow-violet">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-lg font-bold text-white">Strict XSS HTML Sanitization</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            All extracted HTML is sanitized before rendering to eliminate malicious script execution while preserving clean formatting.
          </p>
        </div>

      </div>

    </div>
  );
};
