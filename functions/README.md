# Projection Mapping AI Designer - Backend Functions

This directory contains the secure backend code for the application, running on Firebase Cloud Functions.

## Purpose

The backend acts as a secure proxy for all AI API calls (RunwayML for video, Gemini for images). This solves browser CORS security restrictions and, most importantly, protects your secret API keys by keeping them on the server, where they are never exposed to users.

## Setup

1.  **Install Dependencies:**
    Navigate to this `functions` directory in your terminal and run:
    ```bash
    npm install
    ```

2.  **Set Your Secret API Keys:**
    You MUST set your API keys as secure secrets for your function. Run the following commands from your project's root directory, replacing the placeholders with your actual keys.

    **For RunwayML:**
    ```bash
    firebase functions:secrets:set RUNWAY_KEY
    ```
    When prompted, paste your RunwayML API key.

    **For Gemini:**
    ```bash
    firebase functions:secrets:set GEMINI_KEY
    ```
    When prompted, paste your Google AI / Gemini API key.

    After setting the secrets, you must grant your functions access to them. You can do this in the Google Cloud Console by navigating to your function, clicking 'Edit', and under the 'Security and image repository' section, adding references to these secrets.

## Deployment

To deploy or update your backend functions, run this command from the project's root directory:

```bash
firebase deploy --only functions
```
