import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { ExtractedImageItem } from '../types/content';

interface ImageLightboxProps {
  isOpen: boolean;
  images: ExtractedImageItem[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fadeIn">
      
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
        
        {/* Counter Badge */}
        <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white font-mono text-xs border border-white/15">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Close CTA */}
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform hover:scale-110"
          title="Close Lightbox (ESC)"
        >
          <X className="w-6 h-6" />
        </button>

      </div>

      {/* Main Image Container */}
      <div className="relative max-w-6xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center p-4">
        
        <img
          src={currentImg.src}
          alt={currentImg.alt || 'Full Resolution View'}
          className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-all duration-300"
        />

        {/* Caption */}
        {currentImg.caption && (
          <p className="mt-4 text-center text-sm font-sans text-slate-300 max-w-2xl px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            {currentImg.caption}
          </p>
        )}

      </div>

      {/* Navigation Buttons (if multiple images) */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all transform hover:scale-110"
            title="Previous Image (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={onNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all transform hover:scale-110"
            title="Next Image (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

    </div>
  );
};
