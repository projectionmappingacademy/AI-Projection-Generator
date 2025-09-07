import React from 'react';
import { ThemeTab, SurpriseTheme } from '../types';
import { Spinner } from './Spinner';
import { UploadIcon } from './icons/UploadIcon';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparkleIcon } from './icons/SparkleIcon';

interface ThemeTabsProps {
    activeTab: ThemeTab;
    onActiveTabChange: (tab: ThemeTab) => void;
    textPrompt: string;
    onTextPromptChange: (prompt: string) => void;
    onEnhancePrompt: () => void;
    isEnhancing: boolean;
    inspirationImages: File[];
    onInspirationImagesChange: React.Dispatch<React.SetStateAction<File[]>>;
    onRemoveNewInspiration: (index: number) => void;
    surpriseTheme: SurpriseTheme | null;
    onSurpriseThemeChange: (theme: SurpriseTheme | null) => void;
    savedInspiration: string[];
    selectedInspiration: string[];
    onToggleSelectedInspiration: (dataUrl: string) => void;
    onRemoveSavedInspiration: (dataUrl: string) => void;
}

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    hasContent?: boolean;
}> = ({ label, isActive, onClick, hasContent }) => (
    <button
        onClick={onClick}
        className={`relative px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-secondary-foreground/80 hover:bg-secondary'
        }`}
    >
        {label}
        {hasContent && !isActive && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />}
    </button>
);

export const ThemeTabsComponent: React.FC<ThemeTabsProps> = ({
    activeTab, onActiveTabChange,
    textPrompt, onTextPromptChange, onEnhancePrompt, isEnhancing,
    inspirationImages, onInspirationImagesChange, onRemoveNewInspiration,
    surpriseTheme, onSurpriseThemeChange,
    savedInspiration, selectedInspiration, onToggleSelectedInspiration, onRemoveSavedInspiration,
}) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        onInspirationImagesChange(prev => [...prev, ...files]);
        e.target.value = '';
    };

    const surpriseOptions = [
        { value: SurpriseTheme.NONE, label: 'No theme' },
        { value: SurpriseTheme.CHRISTMAS, label: 'Christmas' },
        { value: SurpriseTheme.HALLOWEEN, label: 'Halloween' },
        { value: SurpriseTheme.CINEMATIC, label: 'Cinematic' },
        { value: SurpriseTheme.DREAMY, label: 'Dreamy' },
        { value: SurpriseTheme.VINTAGE, label: 'Vintage' },
        { value: SurpriseTheme.NEON_PUNK, label: 'Neon Punk' },
        { value: SurpriseTheme.TRULY_RANDOM, label: 'Truly Random!' },
    ];
    
    const hasTextContent = textPrompt.trim() !== '';
    const hasImageContent = inspirationImages.length > 0 || selectedInspiration.length > 0;

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 p-1 mb-4 rounded-lg bg-secondary/80 w-fit">
                <TabButton label="📝 Text Prompt" isActive={activeTab === ThemeTab.TEXT} onClick={() => onActiveTabChange(ThemeTab.TEXT)} hasContent={hasTextContent} />
                <TabButton label="🖼️ Inspiration Images" isActive={activeTab === ThemeTab.IMAGE} onClick={() => onActiveTabChange(ThemeTab.IMAGE)} hasContent={hasImageContent} />
                <TabButton label="🎁 Surprise Me" isActive={activeTab === ThemeTab.SURPRISE} onClick={() => onActiveTabChange(ThemeTab.SURPRISE)} hasContent={surpriseTheme !== null && surpriseTheme !== SurpriseTheme.NONE} />
            </div>

            <div className="mt-4 animate-fade-in-up">
                {activeTab === ThemeTab.TEXT && (
                    <div className="relative">
                        <textarea
                            value={textPrompt}
                            onChange={(e) => onTextPromptChange(e.target.value)}
                            placeholder="e.g., a magical Christmas scene with gingerbread houses and candy canes"
                            className="w-full h-32 p-3 text-sm border rounded-md resize-none bg-secondary/80 border-secondary-foreground/20 focus:ring-2 focus:ring-accent focus:outline-none"
                        />
                        {textPrompt && (
                             <button
                                onClick={onEnhancePrompt}
                                disabled={isEnhancing || !textPrompt}
                                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-accent text-accent-foreground rounded-md hover:bg-accent/90 disabled:opacity-50"
                            >
                                {isEnhancing ? <Spinner /> : <SparkleIcon className="w-4 h-4" />}
                                Enhance
                            </button>
                        )}
                    </div>
                )}
                {activeTab === ThemeTab.IMAGE && (
                     <div>
                        <p className="text-sm text-secondary-foreground/70 mb-2">Upload one or more images to inspire the AI's style. You can also add a text prompt for specific requests.</p>
                         <textarea
                            value={textPrompt}
                            onChange={(e) => onTextPromptChange(e.target.value)}
                            placeholder="Optional: add specific requests, e.g., 'use these colors on the roof'"
                            className="w-full h-20 p-3 mb-4 text-sm border rounded-md resize-none bg-secondary/80 border-secondary-foreground/20 focus:ring-2 focus:ring-accent focus:outline-none"
                        />
                        <div>
                            <h4 className="text-base font-semibold mb-2 text-card-foreground">Inspiration</h4>
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {inspirationImages.map((file, index) => (
                                    <div key={index} className="relative group aspect-square">
                                        <img src={URL.createObjectURL(file)} alt={`Inspiration ${index + 1}`} className="object-cover w-full h-full rounded-md" />
                                        <button
                                            onClick={() => onRemoveNewInspiration(index)}
                                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                        >
                                            <CloseIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                 <label htmlFor="inspiration-upload" className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-md cursor-pointer bg-secondary/50 hover:bg-secondary/80 border-secondary-foreground/20 hover:border-accent transition-colors">
                                    <UploadIcon className="w-6 h-6 mb-2 text-secondary-foreground/60" />
                                    <span className="text-xs text-center text-secondary-foreground/80">Upload Image(s)</span>
                                    <input id="inspiration-upload" type="file" multiple className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>

                         {savedInspiration.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-secondary-foreground/10">
                                <h4 className="text-base font-semibold mb-2 text-card-foreground">Use a Saved Inspiration</h4>
                                <p className="text-sm text-secondary-foreground/70 mb-3">Click to select an image you've generated before.</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {savedInspiration.map((dataUrl, index) => {
                                        const isSelected = selectedInspiration.includes(dataUrl);
                                        return (
                                            <div key={index} className="relative group aspect-square">
                                                <button
                                                    onClick={() => onToggleSelectedInspiration(dataUrl)}
                                                    className={`w-full h-full rounded-md overflow-hidden border-4 transition-all ${isSelected ? 'border-accent' : 'border-transparent hover:border-accent/50'}`}
                                                >
                                                    <img src={dataUrl} alt={`Saved Inspiration ${index + 1}`} className="object-cover w-full h-full" />
                                                </button>
                                                <button
                                                    onClick={() => onRemoveSavedInspiration(dataUrl)}
                                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                    aria-label="Remove saved inspiration"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === ThemeTab.SURPRISE && (
                    <div>
                         <select
                            value={surpriseTheme || 'none'}
                            onChange={(e) => onSurpriseThemeChange(e.target.value === 'none' ? null : e.target.value as SurpriseTheme)}
                            className="w-full p-3 text-sm border rounded-md bg-secondary/80 border-secondary-foreground/20 focus:ring-2 focus:ring-accent focus:outline-none"
                         >
                            <option value="none" disabled>Select a theme...</option>
                            {surpriseOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                         </select>
                    </div>
                )}
            </div>
        </div>
    );
};