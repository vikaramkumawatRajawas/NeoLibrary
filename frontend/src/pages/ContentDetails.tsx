import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Calendar, User, Clock, Share2, AlertCircle, BookOpen, Sparkles, Check, Maximize2 } from 'lucide-react';
import { ContentItem, ExtractedContentResponse, ExtractedImageItem } from '../types/content';
import { fetchExtractedContent } from '../services/api';
import { ContentGrid } from '../components/ContentGrid';
import { ImageLightbox } from '../components/ImageLightbox';
import { ShareModal } from '../components/ShareModal';
import { updateSocialMetaTags } from '../utils/shareUtils';

interface ContentDetailsProps {
  item: ContentItem;
  allItems: ContentItem[];
  onBack: () => void;
  onSelectRelated: (relatedItem: ContentItem) => void;
}

export const ContentDetails: React.FC<ContentDetailsProps> = ({
  item,
  allItems,
  onBack,
  onSelectRelated,
}) => {
  const [extractedData, setExtractedData] = useState<ExtractedContentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateSocialMetaTags(item);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [item]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setExtractedData(null);

    fetchExtractedContent(item.url)
      .then((res) => {
        if (isMounted) {
          setExtractedData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setExtractedData({
            success: false,
            url: item.url,
            error: 'Failed to connect to extraction service.',
          });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [item.url]);

  const getDomainName = (urlString: string) => {
    try {
      const formatted = urlString.startsWith('http') ? urlString : `https://${urlString}`;
      return new URL(formatted).hostname.replace(/^www\./, '');
    } catch (e) {
      return 'Original Link';
    }
  };

  const domain = getDomainName(item.url);

  // Requirement #9: Highest quality available image priority
  const mainHeroImage = extractedData?.leadImage || item.image;

  // Collect images for Lightbox
  const lightboxImages: ExtractedImageItem[] = extractedData?.allImages && extractedData.allImages.length > 0
    ? extractedData.allImages
    : (mainHeroImage ? [{ src: mainHeroImage, alt: item.title }] : []);

  const openLightboxAtIndex = (idx: number) => {
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };

  // Related items
  const relatedItems = allItems
    .filter(i => i.id !== item.id && (i.category === item.category || i.author === item.author))
    .slice(0, 4);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen pb-20">
      
      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-navy-900">
        <div
          className="h-full bg-gradient-accent transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between gap-4">
          
          <button
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border-white/10 hover:border-aqua/40 text-xs font-semibold transition-all flex items-center space-x-2 group"
          >
            <ArrowLeft className="w-4 h-4 text-aqua group-hover:-translate-x-1 transition-transform" />
            <span>&larr; Back to Collection</span>
          </button>

          <div className="flex items-center space-x-3">
            
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border-white/10 hover:border-violet-accent/50 text-xs font-semibold transition-all flex items-center space-x-2 group hover:scale-105"
              aria-label="Share this article"
              title="Share this article"
            >
              <Share2 className="w-4 h-4 text-aqua group-hover:rotate-12 transition-transform" />
              <span>Share</span>
            </button>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-accent text-white font-semibold text-xs shadow-glow-violet hover:scale-105 transition-all flex items-center space-x-2"
            >
              <span>Open Original URL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

          </div>

        </div>

        {/* Article Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/15 shadow-glass-lg space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-violet-accent/20 text-aqua border border-violet-accent/40">
              {item.category || 'General'}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-mono text-slate-400 bg-navy-900 border border-white/10 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{domain}</span>
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {extractedData?.title || item.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 font-medium pt-2 border-t border-white/10">
            
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-violet-accent" />
              <span>By {extractedData?.author || item.author || 'The Hindu'}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyber-blue" />
              <span>{extractedData?.date || item.date}</span>
            </div>

            {extractedData?.readingTime && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-aqua" />
                <span>{extractedData.readingTime}</span>
              </div>
            )}

          </div>

          {/* Requirement #9 & #10: High Quality Hero Image */}
          {mainHeroImage && (
            <div 
              onClick={() => openLightboxAtIndex(0)}
              className="relative w-full aspect-video rounded-2xl overflow-hidden bg-navy-900 border border-white/10 shadow-glass-md group cursor-pointer"
            >
              <img
                src={mainHeroImage}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-mono flex items-center space-x-2 border border-white/20">
                  <Maximize2 className="w-4 h-4 text-aqua" />
                  <span>Click to Expand High-Res Image</span>
                </div>
              </div>
            </div>
          )}

        </motion.div>

        {/* Article Body Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 shadow-glass-md"
        >
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-accent p-0.5 animate-spin">
                <div className="w-full h-full bg-navy-900 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-aqua" />
                </div>
              </div>
              <p className="text-sm font-mono text-slate-300">
                Extracting high-resolution article content from {domain}...
              </p>
            </div>
          ) : extractedData?.success && extractedData.contentHtml ? (
            /* Extracted Article Content with Image Lightbox Click Listener */
            <article 
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'IMG') {
                  const src = (target as HTMLImageElement).src;
                  const foundIdx = lightboxImages.findIndex(img => img.src === src);
                  if (foundIdx >= 0) {
                    openLightboxAtIndex(foundIdx);
                  } else {
                    openLightboxAtIndex(0);
                  }
                }
              }}
              className="prose prose-invert prose-violet max-w-none prose-headings:font-heading prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-base prose-a:text-aqua prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-blockquote:border-l-violet-accent prose-blockquote:bg-violet-accent/10 prose-blockquote:p-4 prose-blockquote:rounded-r-xl"
              dangerouslySetInnerHTML={{ __html: extractedData.contentHtml }}
            />
          ) : (
            /* Fallback State */
            <div className="py-12 px-4 text-center space-y-6 max-w-lg mx-auto">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-heading text-2xl font-bold text-white">
                  Unable to preview this content
                </h3>
                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  The target website ({domain}) blocks server-side reader extraction.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-xl bg-gradient-accent text-white font-semibold text-sm shadow-glow-violet hover:scale-105 transition-all inline-flex items-center space-x-2"
                >
                  <span>Open Original Website &rarr;</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

            </div>
          )}
        </motion.div>

        {/* More Like This */}
        {relatedItems.length > 0 && (
          <div className="pt-10 space-y-6">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <BookOpen className="w-5 h-5 text-aqua" />
              <h3 className="font-heading text-2xl font-bold text-white">More Like This</h3>
            </div>

            <ContentGrid items={relatedItems} onCardClick={onSelectRelated} />
          </div>
        )}

      </div>

      {/* Fullscreen Image Lightbox Modal */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onClose={() => setIsLightboxOpen(false)}
        onPrev={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1))}
        onNext={() => setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0))}
      />

      {/* Production Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        item={item}
        onClose={() => setIsShareModalOpen(false)}
      />

    </div>
  );
};
