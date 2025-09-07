import { GenerateDesignParams, ThemeTab, SurpriseTheme } from '../types';
import { parseApiError } from '../utils/errorUtils';

const BACKEND_URL = '/generateGeminiDesign';

const generateThemePrompt = async (
    activeTab: ThemeTab, 
    inspirationImages: File[], 
    textPrompt: string, 
    surpriseTheme: SurpriseTheme | null
): Promise<string> => {
    // This logic is now simplified on the frontend. The backend will handle the real prompt engineering.
    if (activeTab === ThemeTab.IMAGE && inspirationImages.length > 0) {
        if (textPrompt) return `A style inspired by the uploaded images, with a focus on: "${textPrompt}"`;
        return `A style inspired by the uploaded images.`;
    }
    if (activeTab === ThemeTab.SURPRISE) {
        if (surpriseTheme === SurpriseTheme.TRULY_RANDOM) return 'a completely random and surprising theme.';
        return `a ${surpriseTheme} theme.`;
    }
    return textPrompt || 'a beautiful, creative style.';
};

export const enhanceTextPrompt = async (prompt: string, onDebug: (request: object) => void): Promise<string> => {
    const formData = new FormData();
    formData.append('prompt', prompt);

    onDebug({ type: 'Request to Backend', url: '/enhanceTextPrompt', params: { prompt } });

    // In a full production app, this would also call a backend endpoint.
    // For now, we'll keep the direct call but note the security risk.
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const instructions = `You are an expert AI prompt engineer...`; // Full prompt omitted for brevity
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: instructions });
    return response.text.trim();
};

export const generateProjectionDesign = async (
    params: GenerateDesignParams, 
    onDebug: (request: object) => void
): Promise<string | null> => {
    const formData = new FormData();

    // Append files
    if (params.mapFile) {
        formData.append('mapFile', params.mapFile);
    }
    for (let i = 0; i < params.inspirationImages.length; i++) {
        formData.append(`inspirationImage_${i}`, params.inspirationImages[i]);
    }
    
    const userThemePrompt = await generateThemePrompt(
        params.activeTab, params.inspirationImages, params.textPrompt, params.surpriseTheme
    );

    const allParams = {
        isFunMode: params.isFunMode,
        prompt: userThemePrompt,
    };
    formData.append('params', JSON.stringify(allParams));
    
    onDebug({
      type: 'Request to Backend',
      url: BACKEND_URL,
      params: { ...allParams },
    });

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Backend request failed: ${errorBody}`);
        }

        const result = await response.json();
        if (result.debugInfo) {
            onDebug(result.debugInfo);
        }
        if (result.imageUrl) {
            return result.imageUrl;
        }

        throw new Error('Backend did not return an image URL.');
    } catch (error) {
        throw new Error(parseApiError(error));
    }
};
