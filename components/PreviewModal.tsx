import React, { useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { GenerationType } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface PreviewModalProps {
    media: { src: string; type: GenerationType } | null;
    onClose: () => void;
    onNext: () => void;
    onPrevious: () => void;
    hasNavigation: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ media, onClose, onNext, onPrevious, hasNavigation }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
            if (hasNavigation) {
                if (event.key === 'ArrowRight') {
                    onNext();
                }
                if (event.key === 'ArrowLeft') {
                    onPrevious();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrevious, hasNavigation]);

    if (!media) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative bg-secondary rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] p-4 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full h-full flex items-center justify-center">
                    {media.type === 'image' ? (
                        <img src={media.src} alt="Preview" className="max-w-full max-h-[85vh] object-contain" />
                    ) : (
                        <video src={media.src} controls autoPlay muted loop className="max-w-full max-h-[85vh]" />
                    )}
                </div>
                 <button
                    onClick={onClose}
                    className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors z-10"
                    aria-label="Close preview"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
                {hasNavigation && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onPrevious(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-accent/80 transition-colors"
                            aria-label="Previous"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-accent/80 transition-colors"
                            aria-label="Next"
                        >
                            <ArrowRightIcon className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};