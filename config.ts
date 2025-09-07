/**
 * ===================================================================
 * API KEY CONFIGURATION
 * ===================================================================
 * This file is the central file for managing API keys.
 * 
 * Instructions:
 * 1. For Gemini: The API key is provided by the execution environment via
 *    `process.env.API_KEY`. No action is needed here.
 * 2. For RunwayML (Video Generation): The API key is managed in the
 *    Firebase Functions backend environment.
 */

export const API_KEYS = {
    /**
     * The Gemini API key is provided by the `process.env.API_KEY` environment variable.
     * The services using this key are expected to read it directly from the environment.
     */
    GEMINI: process.env.API_KEY,
};
