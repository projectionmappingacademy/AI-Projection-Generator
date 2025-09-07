import React from 'react';
import { Card } from './Card';
import { Spinner } from './Spinner';
import { GenerationType } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { ExpandIcon } from './icons/ExpandIcon';
import { ImageIcon } from './icons/ImageIcon';
import { VideoIcon } from './icons/VideoIcon';
import { SaveIcon } from './icons/SaveIcon';

interface FileOutputProps {
    results: string[];
    isLoading: boolean;
    error: string | null;
    generationType: GenerationType;
    numOutputs: number;
    onPreview: (index: number) => void;
    onSave: (dataUrl: string) => void;
}

const ResultCard: React.FC<{
    src: string;
    type: 'image' | 'video';
    onPreview: () => void;
    onSave: () => void;
}> = ({ src, type, onPreview, onSave }) => {
    return (
        <Card className="p-2 aspect-video flex items-center justify-center relative group overflow-hidden">
            {type === 'image' ? (
                <img src={src} alt="Generated design" className="w-full h-full object-contain" />
            ) : (
                <video src={src} controls autoPlay muted loop className="w-full h-full object-contain" />
            )}
            <div className="absolute top-2 right-2 flex items-center gap-2">
                {type === 'image' && (
                     <button
                        onClick={onSave}
                        className="p-2 bg-secondary/70 text-white rounded-full hover:bg-accent/80 transition-colors"
                        aria-label="Save for Inspiration"
                    >
                        <SaveIcon className="w-5 h-5" />
                    </button>
                )}
                <a
                    href={src}
                    download={`design.${type === 'image' ? 'png' : 'mp4'}`}
                    className="p-2 bg-brand-green text-white rounded-full hover:bg-brand-green/90 transition-colors"
                    aria-label="Download"
                >
                    <DownloadIcon className="w-5 h-5" />
                </a>
                <button
                    onClick={onPreview}
                    className="p-2 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors"
                    aria-label="Expand Preview"
                >
                    <ExpandIcon className="w-5 h-5" />
                </button>
            </div>
        </Card>
    );
};

const SkeletonCard: React.FC = () => (
    <Card className="p-2 aspect-video flex items-center justify-center bg-secondary/80">
        <div className="animate-pulse w-full h-full bg-secondary-foreground/10 rounded-md"></div>
    </Card>
);

export const FileOutput: React.FC<FileOutputProps> = ({
    results,
    isLoading,
    error,
    generationType,
    numOutputs,
    onPreview,
    onSave
}) => {
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center">
                    <div className="inline-block relative">
                         <Spinner />
                         <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-accent">
                            {generationType === GenerationType.VIDEO ? 'vid' : 'img'}
                         </div>
                    </div>
                    <h3 className="text-lg font-semibold mt-4 text-primary">Generating your design...</h3>
                    <p className="text-sm text-secondary-foreground/70 mt-1">
                        {generationType === GenerationType.VIDEO
                            ? "This can take a few minutes. Please don't close the tab."
                            : "The AI is working its magic. This shouldn't take too long!"
                        }
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        {Array.from({ length: numOutputs }).map((_, index) => (
                           <SkeletonCard key={index} />
                        ))}
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <Card className="bg-red-900/20 border border-red-500/30 p-4">
                    <h3 className="font-semibold text-red-400">Generation Failed</h3>
                    <p className="text-sm text-red-400/80 mt-2 break-words">{error}</p>
                </Card>
            );
        }

        if (results.length > 0) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.map((src, index) => (
                        <ResultCard
                            key={index}
                            src={src}
                            type={generationType}
                            onPreview={() => onPreview(index)}
                            onSave={() => onSave(src)}
                        />
                    ))}
                </div>
            );
        }

        return (
            <div className="text-center p-8 border-2 border-dashed rounded-lg border-secondary-foreground/20">
                {generationType === 'image' ? (
                     <ImageIcon className="w-12 h-12 mx-auto text-secondary-foreground/40 mb-4" />
                ) : (
                    <VideoIcon className="w-12 h-12 mx-auto text-secondary-foreground/40 mb-4" />
                )}
               
                <h3 className="text-lg font-semibold text-primary">Your designs will appear here</h3>
                <p className="text-sm text-secondary-foreground/70 mt-1">Fill out the form on the left to get started.</p>
            </div>
        );
    };

    return (
        <section>
            <h2 className="text-3xl font-bold text-primary mb-6">Your Designs</h2>
            {renderContent()}
        </section>
    );
};

// A new SaveIcon component needed by FileOutput
const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12a1 1 0 01-1.447.894L10 14.586l-3.553 2.308A1 1 0 015 16V4z" />
    </svg>
);