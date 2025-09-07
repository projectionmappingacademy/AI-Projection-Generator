import { GenerateVideoParams, ThemeTab, SurpriseTheme } from '../types';
import { fileToDataUrl } from '../utils/fileUtils';
import { parseApiError } from '../utils/errorUtils';

// This is the URL of your deployed Firebase Cloud Function.
// You need to deploy your function first and then replace this with the actual URL.
const BACKEND_URL = '/generateRunwayVideo';

const generateThemePrompt = async (
    activeTab: ThemeTab, 
    inspirationImages: File[], 
    textPrompt: string, 
    surpriseTheme: SurpriseTheme | null
): Promise<string> => {
    // For Runway, we don't need a complex analysis. We can just combine text.
    // The backend will handle the real prompt engineering.
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

export const generateRunwayVideo = async (
    params: GenerateVideoParams,
    onDebug: (request: object) => void
): Promise<string | null> => {
    const formData = new FormData();

    const modelToUse = params.videoSubType === 'transition' ? 'gen3a_turbo' : 'gen4_turbo';
    
    // Append files
    if (params.startSceneFile) {
        formData.append('startSceneFile', params.startSceneFile);
    }
    if (params.endSceneFile && params.videoSubType === 'transition') {
        formData.append('endSceneFile', params.endSceneFile);
    }
    
    const userThemePrompt = await generateThemePrompt(
        params.activeTab,
        params.inspirationImages,
        params.textPrompt,
        params.surpriseTheme
    );

    // Append other parameters
    const allParams = {
        videoSubType: params.videoSubType,
        videoDuration: params.videoDuration,
        prompt: userThemePrompt,
    };
    formData.append('params', JSON.stringify(allParams));

    // Append inspiration images if any
    for (let i = 0; i < params.inspirationImages.length; i++) {
        formData.append(`inspirationImage_${i}`, params.inspirationImages[i]);
    }
    
    // Initial debug log from the frontend
    onDebug({
      type: 'Request to Backend',
      url: BACKEND_URL,
      modelToUse,
      params: {
        ...allParams,
        hasStartScene: !!params.startSceneFile,
        hasEndScene: !!params.endSceneFile,
        inspirationImageCount: params.inspirationImages.length
      },
      note: "This is the request from the browser to your secure backend. The backend will add the API key and send the final, full request to RunwayML."
    });

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Backend request failed with status ${response.status}: ${errorBody}`);
        }

        const result = await response.json();

        // Final debug log from the backend
        if (result.debugInfo) {
            onDebug(result.debugInfo);
        }

        if (result.videoUrl) {
            // Fetch the video from the signed URL and convert to a data URL to display
            const videoResponse = await fetch(result.videoUrl);
            if (!videoResponse.ok) {
                throw new Error('Failed to fetch the final video from the returned URL.');
            }
            const blob = await videoResponse.blob();
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            return dataUrl;
        }

        throw new Error('Backend did not return a video URL.');

    } catch (error) {
        const errorMessage = parseApiError(error);
        console.error("Error generating RunwayML video:", errorMessage);
        throw new Error(errorMessage);
    }
};
