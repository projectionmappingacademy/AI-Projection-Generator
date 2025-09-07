// @google/genai Coding Guidelines: All Gemini API calls have been updated to use the new `GoogleGenAI` client and the `ai.models` syntax. Deprecated methods like `GoogleGenerativeAI` and `getGenerativeModel` have been removed.
import { GoogleGenAI, Modality, Part } from "@google/genai";
import { GenerateDesignParams, ThemeTab, SurpriseTheme } from '../types';
import { MANDATORY_RULES } from "../constants";
import { parseApiError } from "../utils/errorUtils";

const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    const base64Data = await base64EncodedDataPromise;
    return {
        inlineData: {
            data: base64Data,
            mimeType: file.type,
        },
    };
};

export const enhanceTextPrompt = async (prompt: string, onDebug: (request: object) => void): Promise<string> => {
    // FIX: Initialize Gemini client directly with environment variable per guidelines.
    // Use `GoogleGenAI` and pass `{apiKey}` in the constructor.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const instructions = `
You are an expert AI prompt engineer. Your task is to take a user's simple idea and expand it into a rich, detailed, and descriptive prompt for an AI image/video generator.

**Core Requirements:**
1.  **Preserve Intent:** You MUST NOT completely deviate from the user's original input. The core idea must be preserved and embellished.
2.  **Add Rich Detail:** Add details like character names (if applicable), theme ideas, weather elements, props, and artistic styles (e.g., ultra-realistic, cartoonish, painterly).
3.  **Incorporate Vibe:** Add descriptive words for the mood or vibe (e.g., fun, cheerful, horror, eerie, magical, futuristic).
4.  **Mandatory Style:** A core requirement for ALL enhanced prompts is that they should request **vibrant colors and high contrast**.

**User's Idea:** "${prompt}"

**Instructions:**
Rewrite the user's idea into a single, detailed paragraph. Do not add any conversational text, introductions, or labels. Output only the enhanced prompt text.`;
    
    // FIX: Use the correct model and `ai.models.generateContent` API.
    const request = { model: 'gemini-2.5-flash', contents: instructions };
    onDebug({ type: 'Gemini Prompt Enhancement', request });

    const response = await ai.models.generateContent(request);

    // FIX: Access the generated text directly from the `.text` property.
    const enhancedText = response.text.trim();
    if (!enhancedText) {
        throw new Error("The AI could not enhance the prompt. Please try again.");
    }
    return enhancedText;
};


const generatePromptFromImage = async (imageFile: File, instructions: string): Promise<string> => {
    // FIX: Initialize Gemini client directly with environment variable per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);
    const parts: Part[] = [{ text: instructions }, imagePart];
    
    // FIX: Use the correct model and `ai.models.generateContent` API for multimodal input.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts }
    });

    // FIX: Access the generated text directly from the `.text` property.
    const generatedText = response.text.trim();
    return generatedText || "a vibrant and magical theme"; // Fallback
};


const generateThemePrompt = async (
    activeTab: ThemeTab, 
    inspirationImages: File[], 
    textPrompt: string, 
    surpriseTheme: SurpriseTheme | null
): Promise<string> => {
    let basePrompt = "";
    if (activeTab === ThemeTab.IMAGE && inspirationImages.length > 0) {
        // This logic can be expanded to handle multiple inspiration images in the future
        const imageFileToAnalyze = inspirationImages[0];
        try {
            const instructions = `
You are an expert art director. Analyze the following images and synthesize their visual style into a detailed, descriptive text prompt. Focus on color palette, mood, textures, lighting, and key thematic elements. Be as descriptive as possible to give another AI a rich set of creative instructions.`;
            const imagePrompt = await generatePromptFromImage(imageFileToAnalyze, instructions);
            
            const combinedPrompts: string[] = [`Style: "${imagePrompt}"`];
            if (textPrompt) {
                combinedPrompts.push(`Specific requests: "${textPrompt}"`);
            }
            basePrompt = combinedPrompts.join('\n');
        } catch (e) {
            console.error("Failed to generate prompt from image:", e);
            throw new Error(`Failed to analyze inspiration image: ${parseApiError(e)}`);
        }

    } else {
        switch (activeTab) {
            case ThemeTab.SURPRISE:
                basePrompt = surpriseTheme === SurpriseTheme.TRULY_RANDOM 
                    ? 'a completely random and surprising theme.' 
                    : `a ${surpriseTheme} theme.`;
                break;
            case ThemeTab.TEXT:
            default:
                basePrompt = textPrompt ? `based on this description: "${textPrompt}"` : 'a beautiful, creative style.';
        }
    }
    // Add the vibrant color requirement to all prompts
    return `${basePrompt} The final output should have vibrant colors and high contrast.`;
}


export const generateProjectionDesign = async (
    params: GenerateDesignParams, 
    onDebug: (request: object) => void
): Promise<string | null> => {
    // FIX: Initialize Gemini client directly with environment variable per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const userThemePrompt = await generateThemePrompt(
        params.activeTab, params.inspirationImages, params.textPrompt, params.surpriseTheme
    );

    if (params.isFunMode) {
        // FIX: Use the correct model 'imagen-4.0-generate-001' and API `generateImages` for text-to-image generation.
        const request = {
          model: 'imagen-4.0-generate-001',
          prompt: `Generate a high-quality, visually stunning image ${userThemePrompt}`,
          config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9' as const,
          },
        };
        onDebug({ type: 'Gemini "Have Fun" Image Generation', request });
        const response = await ai.models.generateImages(request);
        
        // FIX: Correctly parse the response from `generateImages`.
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }

    } else {
        // "House Facade" mode: Strict rules, requires map file. This is an image editing task.
        if (!params.mapFile) throw new Error("A map file is required for House Facade generation.");
        
        const finalSystemPrompt = `
Task: Decorate the input house image.
Theme: ${userThemePrompt}
Output: A static image of the decorated house.

${MANDATORY_RULES}`;
        
        const mapFilePart = await fileToGenerativePart(params.mapFile);
        const parts: Part[] = [mapFilePart, { text: finalSystemPrompt }];

        // FIX: Use the correct image editing model 'gemini-2.5-flash-image-preview' and config.
        const request = {
          model: 'gemini-2.5-flash-image-preview',
          contents: { parts },
          config: {
              responseModalities: [Modality.IMAGE, Modality.TEXT],
          },
        };
        onDebug({ type: 'Gemini "House Facade" Image Generation', request });
        const response = await ai.models.generateContent(request);
        
        // FIX: Correctly parse the response for an edited image.
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          }
        }
    }
    
    return null;
};
