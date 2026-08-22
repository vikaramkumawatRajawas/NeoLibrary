import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Copy, Share2, Send, MessageCircle, Facebook, Twitter, Link2, ExternalLink } from 'lucide-react';
import { ContentItem } from '../types/content';
import { 
  getShareUrl, 
  getWhatsAppShareUrl, 
  getFacebookShareUrl, 
  getXShareUrl, 
  getTelegramShareUrl, 
  copyPageUrl, 
  nativeShare 
} from '../utils/shareUtils';

interface ShareModalProps {
  isOpen: boolean;
  item: ContentItem;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, item, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [hasNativeShare, setHasNativeShare] = useState<boolean>(false);

  const shareUrl = getShareUrl(item);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setHasNativeShare(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyPageUrl(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const openPlatformShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShareClick = async () => {
    await nativeShare(item.title, item.content || item.title, shareUrl);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        
        {/* Backdrop click listener */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal / Bottom Sheet Panel */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg glass-panel p-6 rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-glass-lg z-10 space-y-6 max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Share article modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-aqua" />
              <h3 className="font-heading text-xl font-bold text-white">Share Content</h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
              aria-label="Close share modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Requirement #14: Share Preview Box */}
          <div className="p-4 rounded-2xl bg-navy-900/90 border border-white/10 flex items-center space-x-4">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-violet-accent/20 flex items-center justify-center shrink-0 border border-white/10">
                <Share2 className="w-8 h-8 text-aqua" />
              </div>
            )}

            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[10px] font-mono font-semibold uppercase text-aqua bg-violet-accent/20 px-2 py-0.5 rounded-md">
                {item.category || 'News'}
              </span>
              <h4 className="font-heading text-sm font-bold text-white truncate">
                {item.title}
              </h4>
              <p className="text-xs font-mono text-slate-400 truncate">
                {shareUrl}
              </p>
            </div>
          </div>

          {/* Requirement #3: Social Platform Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* WhatsApp */}
            <button
              onClick={() => openPlatformShare(getWhatsAppShareUrl(item.title, shareUrl))}
              className="p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-all flex flex-col items-center justify-center space-y-2 group"
            >
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => openPlatformShare(getFacebookShareUrl(shareUrl))}
              className="p-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold text-xs transition-all flex flex-col items-center justify-center space-y-2 group"
            >
              <Facebook className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>Facebook</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={() => openPlatformShare(getXShareUrl(item.title, shareUrl))}
              className="p-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-semibold text-xs transition-all flex flex-col items-center justify-center space-y-2 group"
            >
              <Twitter className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>X / Twitter</span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => openPlatformShare(getTelegramShareUrl(item.title, shareUrl))}
              className="p-3.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-semibold text-xs transition-all flex flex-col items-center justify-center space-y-2 group"
            >
              <Send className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>Telegram</span>
            </button>

          </div>

          {/* Copy Link Input Bar */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300">Direct Page Link</label>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 text-xs font-mono text-slate-300 border border-white/10 focus:outline-none"
              />

              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center space-x-1.5 shrink-0 shadow-sm ${
                  copied 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gradient-accent text-white hover:scale-105'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Requirement #4: Native Web Share API Button */}
          {hasNativeShare && (
            <button
              onClick={handleNativeShareClick}
              className="w-full py-3 rounded-xl glass-panel hover:bg-white/10 text-white font-semibold text-xs border border-white/15 transition-all flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4 text-aqua" />
              <span>Use Native Device Share Sheet</span>
            </button>
          )}

          {/* Toast Notice */}
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center text-xs font-mono"
            >
              ✓ Link copied to clipboard!
            </motion.div>
          )}

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
