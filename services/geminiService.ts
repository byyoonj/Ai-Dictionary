
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { DictionaryEntry, Settings } from '../types';

const dictionarySchema = {
    type: Type.OBJECT,
    properties: {
        word: { type: Type.STRING, description: 'The word that was defined.' },
        phonetic: { type: Type.STRING, description: 'The International Phonetic Alphabet (IPA) spelling.' },
        definition: { type: Type.STRING, description: 'The main definition of the word.' },
        translations: {
            type: Type.ARRAY,
            description: 'List of translations.',
            items: {
                type: Type.OBJECT,
                properties: {
                    language: { type: Type.STRING },
                    translation: { type: Type.STRING }
                },
                required: ['language', 'translation']
            }
        },
        example: {
            type: Type.STRING,
            description: 'An example sentence relevant to the user\'s job. Can be an empty string if not requested or not applicable.'
        }
    },
    required: ['word', 'phonetic', 'definition', 'translations']
};


export const getDictionaryEntry = async (word: string, settings: Settings): Promise<DictionaryEntry> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const exampleInstruction = settings.includeExample
        ? `4. A creative and practical example sentence using the word in a context relevant to a ${settings.job}. If no relevant example can be found, provide a general one.`
        : '';
    
    const prompt = `
        You are an expert linguist and lexicographer creating a personalized dictionary entry.
        The user is a ${settings.job} and their English language level is ${settings.level}.
        Please provide a dictionary entry for the word "${word}".

        The entry must include:
        1. The definition of the word, tailored to a ${settings.level} level of understanding.
        2. The phonetic spelling (IPA).
        3. Translations into the following languages: ${settings.targetLanguages.join(', ')}.
        ${exampleInstruction}

        The response must be in the specified JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: dictionarySchema,
                temperature: 0.5,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as DictionaryEntry;

    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to fetch data from Gemini API.");
    }
};

export const getWordPronunciation = async (word: string): Promise<string | undefined> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set");
        return undefined;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Pronounce the word: ${word}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A neutral, standard voice
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio;
    } catch (error) {
        console.error("Gemini TTS API call failed:", error);
        // Return undefined to not block the user flow if audio generation fails
        return undefined;
    }
};
