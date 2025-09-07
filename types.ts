export enum GenerationType {
    IMAGE = 'image',
    VIDEO = 'video',
}

export enum ImageSubType {
    FACADE = 'facade',
    FUN = 'fun',
}

export enum VideoSubType {
    LIFE = 'life',
    TRANSITION = 'transition',
}

export enum ThemeTab {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    SURPRISE = 'SURPRISE',
}

export enum SurpriseTheme {
    NONE = 'none',
    CHRISTMAS = 'christmas',
    HALLOWEEN = 'halloween',
    CINEMATIC = 'cinematic',
    DREAMY = 'dreamy',
    VINTAGE = 'vintage',
    NEON_PUNK = 'neon punk',
    TRULY_RANDOM = 'truly_random',
}

// Common parameters for theme generation
interface BaseThemeParams {
    activeTab: ThemeTab;
    textPrompt: string;
    inspirationImages: File[];
    surpriseTheme: SurpriseTheme | null;
}

// Parameters for Gemini image generation
export interface GenerateDesignParams extends BaseThemeParams {
    mapFile: File | null;
    isFunMode: boolean;
}

// Parameters for Runway video generation
export interface GenerateVideoParams extends BaseThemeParams {
    startSceneFile: File | null;
    endSceneFile: File | null;
    videoSubType: VideoSubType;
    videoDuration: number;
}