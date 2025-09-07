/**
 * Parses an error from an unknown type into a user-friendly string.
 * This function is designed to handle errors from various APIs (Gemini, Runway, etc.).
 * @param error The error object, which can be of any type.
 * @returns A string representing the error message.
 */
export const parseApiError = (error: unknown): string => {
    // Standard Error object
    if (error instanceof Error) {
        return error.message;
    }

    // Object with a 'message' or 'error' property (common pattern for API errors)
    if (typeof error === 'object' && error !== null) {
        if ('message' in error && typeof (error as any).message === 'string') {
            return (error as { message: string }).message;
        }
        if ('error' in error && typeof (error as any).error === 'string') {
            return (error as { error: string }).error;
        }
    }
    
    // The error is already a string
    if (typeof error === 'string') {
        return error;
    }

    // Fallback for other types or complex objects
    return 'An unexpected error occurred. Please try again or check the developer console for more details.';
};
