import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { FileOutput } from './components/FileOutput';
import { PreviewModal } from './components/PreviewModal';
import { DebugTerminal } from './components/DebugTerminal';
import { GenerationType, ImageSubType, VideoSubType, ThemeTab, SurpriseTheme, GenerateDesignParams, GenerateVideoParams } from './types';
import { enhanceTextPrompt, generateProjectionDesign } from './services/geminiService';
import { generateRunwayVideo } from './services/runwayService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { dataUrlToFile } from './utils/fileUtils';
import { parseApiError } from './utils/errorUtils';

const App: React.FC = () => {
    // 1. Generation Type State
    const [generationType, setGenerationType] = useState<GenerationType>(GenerationType.IMAGE);
    const [imageSubType, setImageSubType] = useState<ImageSubType>(ImageSubType.FACADE);
    const [videoSubType, setVideoSubType] = useState<VideoSubType>(VideoSubType.LIFE);

    // 2. File Input State
    const [mapFile, setMapFile] = useState<File | null>(null);
    const [mapPreview, setMapPreview] = useState<string | null>(null);
    const [startSceneFile, setStartSceneFile] = useState<File | null>(null);
    const [startScenePreview, setStartScenePreview] = useState<string | null>(null);
    const [endSceneFile, setEndSceneFile] = useState<File | null>(null);
    const [endScenePreview, setEndScenePreview] = useState<string | null>(null);

    // 3. Theme/Creative State
    const [activeTab, setActiveTab] = useState<ThemeTab>(ThemeTab.TEXT);
    const [textPrompt, setTextPrompt] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [inspirationImages, setInspirationImages] = useState<File[]>([]);
    const [inspirationImagePreviews, setInspirationImagePreviews] = useState<string[]>([]);
    const [surpriseTheme, setSurpriseTheme] = useState<SurpriseTheme | null>(null);

    // 4. Output Settings State
    const [numOutputs, setNumOutputs] = useState(2);
    const [videoDuration, setVideoDuration] = useState(5);

    // 5. Generation Process State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<string[]>([]);
    const [debugLogs, setDebugLogs] = useState<object[]>([]);
    const outputRef = useRef<HTMLDivElement>(null);

    // 6. Inspiration & Preview Modal State
    const [savedInspiration, setSavedInspiration] = useLocalStorage<string[]>('savedInspiration', []);
    const [selectedInspiration, setSelectedInspiration] = useState<string[]>([]);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    // Auto-scroll to output section when generation starts
    useEffect(() => {
        if (isLoading) {
            outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isLoading]);
    
    // Effect for creating/revoking object URLs for file previews
    useEffect(() => {
        const previews = inspirationImages.map(file => URL.createObjectURL(file));
        setInspirationImagePreviews(previews);
        return () => previews.forEach(URL.revokeObjectURL);
    }, [inspirationImages]);
    
    // Set default numOutputs based on generation type
    useEffect(() => {
        if (generationType === GenerationType.VIDEO) {
            setNumOutputs(1);
        } else {
            setNumOutputs(2);
        }
    }, [generationType]);

    const handleFileChange = (
        file: File | null,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreview: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        setFile(file);
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
        } else {
            setPreview(null);
        }
    };

    const handleEnhancePrompt = useCallback(async () => {
        if (!textPrompt) return;
        setIsEnhancing(true);
        try {
            const enhanced = await enhanceTextPrompt(textPrompt, (log) => setDebugLogs(prev => [...prev, log]));
            setTextPrompt(enhanced);
        } catch (e) {
            setError(parseApiError(e));
        } finally {
            setIsEnhancing(false);
        }
    }, [textPrompt]);
    
    const handleRemoveNewInspiration = (index: number) => {
        setInspirationImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleToggleSelectedInspiration = (dataUrl: string) => {
        setSelectedInspiration(prev =>
            prev.includes(dataUrl) ? prev.filter(item => item !== dataUrl) : [...prev, dataUrl]
        );
    };

    const handleRemoveSavedInspiration = (dataUrl: string) => {
        setSavedInspiration(prev => prev.filter(item => item !== dataUrl));
        setSelectedInspiration(prev => prev.filter(item => item !== dataUrl));
    };

    const handleSaveResult = (dataUrl: string) => {
        if (!savedInspiration.includes(dataUrl)) {
            setSavedInspiration(prev => [dataUrl, ...prev]);
        }
    };

    const isGenerateDisabled = useMemo(() => {
        if (isLoading) return true;

        const hasThemeInput = textPrompt.trim() !== '' || (inspirationImages.length + selectedInspiration.length) > 0 || (surpriseTheme !== null && surpriseTheme !== SurpriseTheme.NONE);

        if (generationType === GenerationType.IMAGE) {
            if (imageSubType === ImageSubType.FACADE) {
                return !mapFile || !hasThemeInput;
            }
            if (imageSubType === ImageSubType.FUN) {
                return !hasThemeInput;
            }
        }
        
        if (generationType === GenerationType.VIDEO) {
            if (videoSubType === VideoSubType.LIFE) {
                return !startSceneFile;
            }
            if (videoSubType === VideoSubType.TRANSITION) {
                return !startSceneFile || !endSceneFile;
            }
        }

        return true; // Should not be reached
    }, [
        isLoading, generationType, imageSubType, videoSubType,
        mapFile, startSceneFile, endSceneFile, textPrompt,
        inspirationImages, selectedInspiration, surpriseTheme
    ]);

    const handleGenerate = useCallback(async () => {
        if (isGenerateDisabled) return;
        
        setIsLoading(true);
        setError(null);
        setResults([]);
        setDebugLogs([]);

        try {
            const allInspirationFiles = await Promise.all([
                ...inspirationImages,
                ...selectedInspiration.map((dataUrl, i) => dataUrlToFile(dataUrl, `saved-inspiration-${i}.png`))
            ]);
            
            const effectiveActiveTab = (inspirationImages.length + selectedInspiration.length > 0) ? ThemeTab.IMAGE : activeTab;

            const generationPromises: Promise<string | null>[] = [];

            for (let i = 0; i < numOutputs; i++) {
                if (generationType === GenerationType.IMAGE) {
                    const params: GenerateDesignParams = {
                        mapFile,
                        isFunMode: imageSubType === ImageSubType.FUN,
                        activeTab: effectiveActiveTab,
                        textPrompt,
                        inspirationImages: allInspirationFiles,
                        surpriseTheme,
                    };
                    generationPromises.push(generateProjectionDesign(params, (log) => setDebugLogs(prev => [...prev, log])));
                } else { // VIDEO
                    const params: GenerateVideoParams = {
                        startSceneFile,
                        endSceneFile,
                        videoSubType,
                        videoDuration,
                        activeTab: effectiveActiveTab,
                        textPrompt,
                        inspirationImages: allInspirationFiles,
                        surpriseTheme,
                    };
                    generationPromises.push(generateRunwayVideo(params, (log) => setDebugLogs(prev => [...prev, log])));
                }
            }
            
            const settledResults = await Promise.allSettled(generationPromises);
            const successfulResults = settledResults
                .filter(res => res.status === 'fulfilled' && res.value)
                .map(res => (res as PromiseFulfilledResult<string>).value);
            
            if(successfulResults.length === 0) {
                 const firstError = settledResults.find(res => res.status === 'rejected') as PromiseRejectedResult | undefined;
                 throw firstError?.reason || new Error("All generation requests failed without a specific error.");
            }

            setResults(successfulResults);

        } catch (e) {
            const errorMessage = parseApiError(e);
            console.error("Generation failed:", errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [
        isGenerateDisabled, numOutputs, generationType, imageSubType, videoSubType,
        mapFile, startSceneFile, endSceneFile, activeTab, textPrompt,
        inspirationImages, selectedInspiration, surpriseTheme, videoDuration,
    ]);
    
    const handlePreviewNext = () => {
        if (previewIndex !== null) {
            setPreviewIndex((previewIndex + 1) % results.length);
        }
    };

    const handlePreviewPrevious = () => {
        if (previewIndex !== null) {
            setPreviewIndex((previewIndex - 1 + results.length) % results.length);
        }
    };


    return (
        <div className="bg-secondary text-primary-foreground min-h-screen font-sans">
            <main className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center gap-12">
                <Header />
                <div className="w-full max-w-4xl">
                     <InputSection
                        generationType={generationType}
                        onGenerationTypeChange={(type) => setGenerationType(type as GenerationType)}
                        imageSubType={imageSubType}
                        onImageSubTypeChange={(subType) => setImageSubType(subType as ImageSubType)}
                        videoSubType={videoSubType}
                        onVideoSubTypeChange={(subType) => setVideoSubType(subType as VideoSubType)}
                        mapFile={mapFile}
                        onMapFileChange={(file) => handleFileChange(file, setMapFile, setMapPreview)}
                        mapPreview={mapPreview}
                        startSceneFile={startSceneFile}
                        onStartSceneFileChange={(file) => handleFileChange(file, setStartSceneFile, setStartScenePreview)}
                        startScenePreview={startScenePreview}
                        endSceneFile={endSceneFile}
                        onEndSceneFileChange={(file) => handleFileChange(file, setEndSceneFile, setEndScenePreview)}
                        endScenePreview={endScenePreview}
                        activeTab={activeTab}
                        onActiveTabChange={setActiveTab}
                        textPrompt={textPrompt}
                        onTextPromptChange={setTextPrompt}
                        onEnhancePrompt={handleEnhancePrompt}
                        isEnhancing={isEnhancing}
                        inspirationImages={inspirationImages}
                        onInspirationImagesChange={setInspirationImages}
                        onRemoveNewInspiration={handleRemoveNewInspiration}
                        surpriseTheme={surpriseTheme}
                        onSurpriseThemeChange={setSurpriseTheme}
                        numOutputs={numOutputs}
                        onNumOutputsChange={setNumOutputs}
                        videoDuration={videoDuration}
                        onVideoDurationChange={setVideoDuration}
                        onGenerate={handleGenerate}
                        isGenerateDisabled={isGenerateDisabled}
                        isLoading={isLoading}
                        savedInspiration={savedInspiration}
                        selectedInspiration={selectedInspiration}
                        onToggleSelectedInspiration={handleToggleSelectedInspiration}
                        onRemoveSavedInspiration={handleRemoveSavedInspiration}
                    />
                </div>
                <div ref={outputRef} className="w-full max-w-4xl">
                    <FileOutput
                        results={results}
                        isLoading={isLoading}
                        error={error}
                        generationType={generationType}
                        numOutputs={numOutputs}
                        onPreview={(index) => setPreviewIndex(index)}
                        onSave={handleSaveResult}
                    />
                </div>
                <div className="w-full max-w-4xl">
                    <DebugTerminal logs={debugLogs} />
                </div>
            </main>
            {previewIndex !== null && (
                <PreviewModal 
                    media={{ src: results[previewIndex], type: generationType }} 
                    onClose={() => setPreviewIndex(null)}
                    onNext={handlePreviewNext}
                    onPrevious={handlePreviewPrevious}
                    hasNavigation={results.length > 1}
                />
            )}
        </div>
    );
};

export default App;
