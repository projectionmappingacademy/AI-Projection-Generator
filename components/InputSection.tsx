import React from 'react';
import { Card } from './Card';
import { ThemeTabsComponent } from './ThemeTabs';
import { GenerationType, ImageSubType, VideoSubType, ThemeTab, SurpriseTheme } from '../types';
import { Spinner } from './Spinner';
import { UploadIcon } from './icons/UploadIcon';
import { CloseIcon } from './icons/CloseIcon';
import { HouseIcon } from './icons/HouseIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { VideoIcon } from './icons/VideoIcon';
import { LayersIcon } from './icons/LayersIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { ImageIcon } from './icons/ImageIcon';

interface InputSectionProps {
    generationType: GenerationType;
    onGenerationTypeChange: (type: GenerationType) => void;
    imageSubType: ImageSubType;
    onImageSubTypeChange: (subType: ImageSubType) => void;
    videoSubType: VideoSubType;
    onVideoSubTypeChange: (subType: VideoSubType) => void;

    mapFile: File | null;
    onMapFileChange: (file: File | null) => void;
    mapPreview: string | null;

    startSceneFile: File | null;
    onStartSceneFileChange: (file: File | null) => void;
    startScenePreview: string | null;
    endSceneFile: File | null;
    onEndSceneFileChange: (file: File | null) => void;
    endScenePreview: string | null;

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
    
    numOutputs: number;
    onNumOutputsChange: (num: number) => void;
    videoDuration: number;
    onVideoDurationChange: (num: number) => void;
    
    onGenerate: () => void;
    isGenerateDisabled: boolean;
    isLoading: boolean;

    savedInspiration: string[];
    selectedInspiration: string[];
    onToggleSelectedInspiration: (dataUrl: string) => void;
    onRemoveSavedInspiration: (dataUrl: string) => void;
}

const SectionTitle: React.FC<{ number: number; title: string; children?: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg">
            {number}
        </div>
        <div>
            <h2 className="text-xl font-semibold text-primary">{title}</h2>
            {children}
        </div>
    </div>
);

const FileInput: React.FC<{
    id: string;
    label: string;
    description: string;
    preview: string | null;
    onChange: (file: File | null) => void;
    onClear: () => void;
}> = ({ id, label, description, preview, onChange, onClear }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onChange(file);
        e.target.value = ''; // Allow re-uploading the same file
    };

    return (
        <div className="w-full">
            <p className="text-sm font-medium text-card-foreground">{label}</p>
            <p className="text-xs text-secondary-foreground/70 mb-2">{description}</p>
            {preview ? (
                <div className="relative group w-full aspect-video rounded-lg overflow-hidden border border-secondary-foreground/20">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain bg-secondary" />
                    <button
                        onClick={onClear}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        aria-label="Remove file"
                    >
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <label htmlFor={id} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80 border-secondary-foreground/20 hover:border-accent transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon className="w-8 h-8 mb-4 text-secondary-foreground/60" />
                        <p className="mb-2 text-sm text-secondary-foreground/80"><span className="font-semibold">Click to upload</span></p>
                    </div>
                    <input id={id} type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                </label>
            )}
        </div>
    );
};

const RadioCard: React.FC<{
    value: string;
    selectedValue: string;
    onChange: (value: any) => void;
    title: string;
    description: string;
    icon: React.ReactNode;
}> = ({ value, selectedValue, onChange, title, description, icon }) => {
    const isSelected = selectedValue === value;
    return (
        <button
            onClick={() => onChange(value)}
            className={`flex items-start text-left p-4 rounded-lg border-2 w-full transition-all duration-200 ${
                isSelected
                    ? 'bg-accent/10 border-accent shadow-lg'
                    : 'bg-secondary/50 border-secondary-foreground/20 hover:border-accent/50'
            }`}
        >
            <div className={`flex-shrink-0 w-8 h-8 mr-4 rounded-md flex items-center justify-center transition-colors ${
                 isSelected ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
            }`}>
                {icon}
            </div>
            <div>
                <h3 className={`font-semibold transition-colors ${isSelected ? 'text-accent' : 'text-card-foreground'}`}>{title}</h3>
                <p className="text-sm text-secondary-foreground/70">{description}</p>
            </div>
        </button>
    );
};

const RadioPillGroup: React.FC<{
    options: { value: string; label: string; icon: React.ReactNode }[];
    selectedValue: string;
    onChange: (value: any) => void;
}> = ({ options, selectedValue, onChange }) => (
    <div className="flex items-center gap-2 p-1 rounded-full bg-secondary w-full">
        {options.map(opt => (
            <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-full transition-colors ${
                    selectedValue === opt.value
                        ? 'bg-accent text-accent-foreground shadow-md'
                        : 'text-secondary-foreground/70 hover:bg-secondary-foreground/10'
                }`}
            >
                {opt.icon}
                {opt.label}
            </button>
        ))}
    </div>
);


export const InputSection: React.FC<InputSectionProps> = ({
    generationType, onGenerationTypeChange,
    imageSubType, onImageSubTypeChange,
    videoSubType, onVideoSubTypeChange,
    mapFile, onMapFileChange, mapPreview,
    startSceneFile, onStartSceneFileChange, startScenePreview,
    endSceneFile, onEndSceneFileChange, endScenePreview,
    activeTab, onActiveTabChange,
    textPrompt, onTextPromptChange, onEnhancePrompt, isEnhancing,
    inspirationImages, onInspirationImagesChange,
    surpriseTheme, onSurpriseThemeChange,
    numOutputs, onNumOutputsChange,
    videoDuration, onVideoDurationChange,
    onGenerate, isGenerateDisabled, isLoading,
    savedInspiration, selectedInspiration, onToggleSelectedInspiration, onRemoveSavedInspiration
}) => {
    const imageOptions = [
      { value: 'facade', label: 'House Facade', icon: <HouseIcon className="w-5 h-5"/> },
      { value: 'fun', label: 'Have Fun', icon: <SparkleIcon className="w-5 h-5"/> }
    ];

    const videoOptions = [
        { value: 'life', label: 'Bring to Life', icon: <SparkleIcon className="w-5 h-5" /> },
        { value: 'transition', label: 'Transition', icon: <LayersIcon className="w-5 h-5" /> }
    ];

    const getStepTwoTitle = () => {
        if (generationType === 'video' && videoSubType === 'life') {
            return "Upload Your Scene";
        }
        return "Upload Your House Image/Map";
    };

    return (
        <div className="flex flex-col gap-8">
            <Card>
                <div className="flex flex-col gap-6">
                    <SectionTitle number={1} title="Choose Your Canvas">
                        <p className="text-sm text-secondary-foreground/70 mt-1">What kind of projection do you want to create?</p>
                    </SectionTitle>
                    
                    <div className="pl-12 flex flex-col sm:flex-row gap-4">
                       <RadioCard
                            value="image"
                            selectedValue={generationType}
                            onChange={onGenerationTypeChange}
                            title="Generate Image"
                            description="Create a static projection design."
                            icon={<ImageIcon className="w-5 h-5"/>}
                       />
                       <RadioCard
                            value="video"
                            selectedValue={generationType}
                            onChange={onGenerationTypeChange}
                            title="Generate Video"
                            description="Create an animated projection design."
                            icon={<VideoIcon className="w-5 h-5"/>}
                       />
                    </div>

                    <div className="pl-12 animate-fade-in-up">
                        {generationType === 'image' && (
                           <RadioPillGroup 
                                options={imageOptions}
                                selectedValue={imageSubType}
                                onChange={onImageSubTypeChange}
                           />
                        )}

                        {generationType === 'video' && (
                            <RadioPillGroup 
                                options={videoOptions}
                                selectedValue={videoSubType}
                                onChange={onVideoSubTypeChange}
                            />
                        )}
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex flex-col gap-6">
                     <SectionTitle number={2} title={getStepTwoTitle()}>
                        <p className="text-sm text-secondary-foreground/70 mt-1">Provide the base images for the AI to work with.</p>
                    </SectionTitle>

                    <div className="pl-12 flex flex-col items-start gap-6">
                        {generationType === 'image' && imageSubType === 'facade' && (
                           <FileInput
                                id="map-file"
                                label="House Map"
                                description="Upload an image of the house you want to project on."
                                preview={mapPreview}
                                onChange={onMapFileChange}
                                onClear={() => onMapFileChange(null)}
                           />
                        )}

                        {generationType === 'video' && (
                            <div className="flex w-full items-start gap-4">
                                <FileInput
                                    id="start-scene"
                                    label="Start Scene"
                                    description="The image to start the animation from."
                                    preview={startScenePreview}
                                    onChange={onStartSceneFileChange}
                                    onClear={() => onStartSceneFileChange(null)}
                                />
                                {videoSubType === 'transition' && (
                                    <>
                                        <div className="flex-shrink-0 self-center pt-10">
                                            <ArrowRightIcon className="w-8 h-8 text-secondary-foreground/50"/>
                                        </div>
                                        <FileInput
                                            id="end-scene"
                                            label="End Scene"
                                            description="The image the animation will transition to."
                                            preview={endScenePreview}
                                            onChange={onEndSceneFileChange}
                                            onClear={() => onEndSceneFileChange(null)}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {generationType === 'image' && imageSubType === 'fun' && (
                            <p className="text-sm text-secondary-foreground/80 text-center w-full p-4 bg-secondary rounded-md">
                                No assets needed for "Have Fun" mode! Just describe what you want in the next step.
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex flex-col gap-6">
                    <SectionTitle number={3} title="Define Your Creative Theme">
                        <p className="text-sm text-secondary-foreground/70 mt-1">Give the AI creative direction with text, images, or a surprise.</p>
                    </SectionTitle>
                    <div className="pl-12">
                        <ThemeTabsComponent
                             activeTab={activeTab}
                             onActiveTabChange={onActiveTabChange}
                             textPrompt={textPrompt}
                             onTextPromptChange={onTextPromptChange}
                             onEnhancePrompt={onEnhancePrompt}
                             isEnhancing={isEnhancing}
                             inspirationImages={inspirationImages}
                             onInspirationImagesChange={onInspirationImagesChange}
                             onRemoveNewInspiration={() => {}}
                             surpriseTheme={surpriseTheme}
                             onSurpriseThemeChange={onSurpriseThemeChange}
                             savedInspiration={savedInspiration}
                             selectedInspiration={selectedInspiration}
                             onToggleSelectedInspiration={onToggleSelectedInspiration}
                             onRemoveSavedInspiration={onRemoveSavedInspiration}
                        />
                    </div>
                </div>
            </Card>

             <Card>
                <div className="flex flex-col gap-6">
                    <SectionTitle number={4} title="Output Settings">
                        <p className="text-sm text-secondary-foreground/70 mt-1">Configure the final output details.</p>
                    </SectionTitle>
                    <div className="pl-12 grid sm:grid-cols-2 gap-6 items-start">
                        <div>
                            <label className="block text-sm font-medium text-card-foreground mb-2">
                                Number of Outputs
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 4].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => onNumOutputsChange(num)}
                                        className={`w-12 h-10 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
                                            numOutputs === num ? 'bg-accent text-accent-foreground' : 'bg-secondary hover:bg-secondary-foreground/10 text-secondary-foreground'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {generationType === 'video' && (
                             <div>
                                <label htmlFor="video-duration" className="block text-sm font-medium text-card-foreground mb-2">
                                    Video Duration: <span className="font-bold text-accent">{videoDuration}s</span>
                                    <span className="text-xs text-secondary-foreground/70 ml-2">(~$0.25)</span>
                                </label>
                                <input
                                    id="video-duration"
                                    type="range"
                                    min="5"
                                    max="10"
                                    step="1"
                                    value={videoDuration}
                                    onChange={(e) => onVideoDurationChange(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <div className="flex">
                <button
                    onClick={onGenerate}
                    disabled={isGenerateDisabled}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-brand-green text-white font-semibold rounded-lg shadow-md hover:bg-brand-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <>
                            <Spinner />
                            <span>Generating...</span>
                        </>
                    ) : (
                       'Generate Design'
                    )}
                </button>
            </div>
        </div>
    );
};