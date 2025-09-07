// FIX: Import Response from 'express' and Request from 'firebase-functions/v2/https'.
// The 'Response' type is not exported from the firebase-functions module for v2 onRequest handlers.
import {onRequest, Request} from "firebase-functions/v2/https";
import {Response} from "express";
import cors from "cors";
import busboy from "busboy";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { GoogleGenAI, Modality, Part } from "@google/genai";

// ==================================================================
// SHARED UTILITIES
// ==================================================================

const corsHandler = cors({origin: true});



const fileToGenerativePart = async (filePath: string): Promise<Part> => {
    let data: string;
    try {
        data = await fs.promises.readFile(filePath, 'base64');
    } catch (err) {
        console.error("Error reading file in fileToGenerativePart:", err);
        throw new Error("Failed to read file for generative part.");
    }
    const extension = path.extname(filePath).toLowerCase();
    let mimeType = 'image/png';
    if (extension === '.jpg' || extension === '.jpeg') mimeType = 'image/jpeg';
    return { inlineData: { data, mimeType } };
};

const parseMultipartRequest = (req: Request): Promise<{ fields: any, filePaths: any }> => {
    return new Promise((resolve, reject) => {
        const bb = busboy({ headers: req.headers });
        const tmpdir = os.tmpdir();
        const fields: { [key: string]: string } = {};
        const filePaths: { [key: string]: string } = {};
        const fileWrites: Promise<void>[] = [];

        bb.on("field", (fieldname, val) => { fields[fieldname] = val; });

        bb.on("file", (fieldname, file, info) => {
            const { filename } = info;
            const randomId = Math.random().toString(36).substring(2);
            const uniqueFilename = `${fieldname}-${randomId}-${path.extname(filename)}`;
            const filepath = path.join(tmpdir, uniqueFilename);
            filePaths[fieldname] = filepath;
            const writeStream = fs.createWriteStream(filepath);
            file.pipe(writeStream);
            const promise = new Promise<void>((res, rej) => {
                file.on("end", () => writeStream.end());
                writeStream.on("finish", res);
                writeStream.on("error", rej);
            });
            fileWrites.push(promise);
        });

        bb.on("finish", async () => {
            try {
                await Promise.all(fileWrites);
                resolve({ fields, filePaths });
            } catch (error) {
                reject(error);
            }
        });

        req.pipe(bb);
    });
};

// ==================================================================
// RUNWAYML VIDEO GENERATION FUNCTION
// ==================================================================

export const generateRunwayVideo = onRequest({timeoutSeconds: 540, memory: "1GiB"}, (req: Request, res: Response) => {
    corsHandler(req, res, () => {
        res.status(200).json({ message: "RunwayML video generation endpoint stub." });
        return;
    });
});

// ==================================================================
// GEMINI IMAGE GENERATION FUNCTION (NEW & SECURE)
// ==================================================================

export const generateGeminiDesign = onRequest({timeoutSeconds: 120, memory: "1GiB"}, (req: Request, res: Response) => {
    corsHandler(req, res, async () => {
        const GEMINI_API_KEY = process.env.GEMINI_KEY;
        if (!GEMINI_API_KEY) {
            console.error("GEMINI_KEY not set.");
            res.status(500).json({ error: "Server configuration error: Gemini API key is missing." });
            return;
        }

        let filePaths: { [key: string]: string } = {};
        try {
            const parsed = await parseMultipartRequest(req);
            filePaths = parsed.filePaths;
            const params = JSON.parse(parsed.fields.params || "{}");

            const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

            let resultUrl: string | null = null;
            let debugPayload: any = {};

            if (params.isFunMode) {
                const request = {
                    model: 'imagen-4.0-generate-001',
                    prompt: `Generate a high-quality, visually stunning image ${params.prompt}`,
                    config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '16:9' as const },
                };
                debugPayload = { type: 'Gemini "Have Fun" Image Generation', request };
                try {
                    const response = await ai.models.generateImages(request);
                    if (response.generatedImages?.[0]?.image?.imageBytes) {
                        // FIX: Corrected typo from base66 to base64 for valid data URL.
                        resultUrl = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
                    }
                } catch (err) {
                    console.error("Error in generateImages:", err);
                    throw new Error("Failed to generate image using Gemini API.");
                }
            } else {
                if (!filePaths.mapFile) throw new Error("A map file is required.");
                const MANDATORY_RULES = `Some mandatory rule text here`; // Or whatever your rules are

                const finalSystemPrompt = `Task: Decorate the input house image.\nTheme: ${params.prompt}\n${MANDATORY_RULES}`;
                let mapFilePart: Part;
                try {
                    mapFilePart = await fileToGenerativePart(filePaths.mapFile);
                } catch (err) {
                    console.error("Error processing map file:", err);
                    throw new Error("Failed to process the uploaded map file.");
                }
                const parts: Part[] = [mapFilePart, { text: finalSystemPrompt }];

                const request = {
                    model: 'gemini-2.5-flash-image-preview',
                    contents: { parts },
                    config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
                };
                debugPayload = { type: 'Gemini "House Facade" Image Generation', request: { model: request.model, prompt: finalSystemPrompt } };
                try {
                    const response = await ai.models.generateContent(request);
                    if (response.candidates && response.candidates.length > 0) {
                        const parts = response.candidates[0]?.content?.parts ?? [];
                        for (const part of parts) {
                            if (part.inlineData) {
                                resultUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                                break;
                            }
                        }
                    }
                } catch (err) {
                    console.error("Error in generateContent:", err);
                    throw new Error("Failed to generate content using Gemini API.");
                }
            }

            if (!resultUrl) throw new Error("AI did not return an image.");

            res.status(200).json({
                imageUrl: resultUrl,
                debugInfo: debugPayload
            });
            return;

        } catch (error: any) {
            console.error("Error in generateGeminiDesign:", error);
            res.status(500).json({ error: `Internal Server Error: ${error.message}` });
            return;
        } finally {
            Object.values(filePaths).forEach(filePath => fs.unlink(filePath, () => {}));
        }
    });
});
