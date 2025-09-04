import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Chapter, MilestoneData } from '../types';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY is not defined. Please add it to your environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';
const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image-preview';

const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const constructPrompt = (currentText: string, milestones: MilestoneData): string => {
    const age = calculateAge(milestones.dob);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentText;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";


    return `You are an expert ghostwriter, specializing in crafting warm, personal, non-fiction family stories. Your task is to help a user continue their story by providing two distinct, natural-sounding continuations for their last sentence. These continuations should feel as if the user wrote them, seamlessly blending with their style and advancing the narrative with a subtle sense of time, place, or feeling.

The user's story so far:
---
${plainText}
---

Key Information about the main character:
- Story Subject & Relationship: ${milestones.story_subject || 'Not provided'}${milestones.story_subject === 'Other' && milestones.story_subject_other ? ` (${milestones.story_subject_other})` : ''}
- Full Name: ${milestones.name || 'Not provided'}
- Sex: ${milestones.sex || 'Not provided'}
- Age: ${age !== null ? `${age} year(s) old` : 'Not provided'}
- Date of Birth: ${milestones.dob || 'Not provided'}
- Hometown / Neighborhood: ${milestones.hometown || 'Not provided'}
- Ethnicity & Cultural Background: ${milestones.ethnicity || 'Not provided'}${milestones.ethnicity === 'Other' && milestones.ethnicity_other ? ` (${milestones.ethnicity_other})` : ''}
- Health & Well-being Context: ${milestones.health_context || 'Not provided'}
- Family & Social Sphere: ${milestones.family_dynamics || 'Not provided'}
- Family Traditions & Events: ${milestones.traditions_and_events || 'Not provided'}
- Significant Memories & Places: ${milestones.significant_memories || 'Not provided'}
- Hopes & Aspirations for Them: ${milestones.hopes_and_aspirations || 'Not provided'}

Follow these rules STRICTLY for each suggestion you generate:
1.  **Seamless Continuation:** Each suggestion must naturally continue the user's VERY LAST sentence. It must match the user's tone and vocabulary perfectly. Do not repeat the last few words of the user's text.
2.  **Narrative Flow, Not Just Time:** Instead of a simple time reference (e.g., "at 3 PM"), create a phrase that implies time or setting through action, sensory details, or emotional context. Think about what would logically happen or be observed next.
3.  **Logical & Contextual Consistency:** The suggestions MUST be logically consistent with all details provided in the story and key information. If the story mentions being at "Martha's Vineyard," do not suggest an activity in "Rockland."
4.  **Age-Appropriate Actions:** The suggestions must be appropriate for the character's age. A one-year-old enjoys simple, sensory experiences like splashing in water or playing with sand, not watching a Celtics game. Use the provided age to guide your suggestions.
5.  **Grounded in Believable Reality:** Suggestions should feel real and personal. Draw on common, relatable life moments, the changing of seasons, or specific, personal details from the key information (like names of family members or favorite places). Avoid generic clichés and forced references to famous brands or events unless directly relevant. The new context fields (Health, Family, Hopes) are especially important for generating deeply personal and relevant suggestions.
6.  **Creative Distinction:** The two suggestions must offer genuinely different paths for the story. One might focus on an internal feeling, while the other focuses on an external observation.
7.  **Length:** Each suggestion must be between 8 and 15 words.
8.  **Output Format:** Return ONLY a JSON object with a single key "suggestions" containing an array of two unique string suggestions. Do not include any other text, explanation, or markdown formatting.

Example:
User's text ends with: "...she toddled across the warm sand, her tiny hands reaching for the shells."
Milestones: Name is "Marina", Age is 1.
A valid response would be:
{
  "suggestions": [
    "just as a gentle wave tickled her toes for the first time.",
    "while her father, smiling, watched from the colorful beach blanket."
  ]
}`;
};


export const getSuggestions = async (currentText: string, milestones: MilestoneData): Promise<string[]> => {
  try {
    const prompt = constructPrompt(currentText, milestones);
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "Two distinct, natural-sounding continuations for the user's story.",
            },
          },
        },
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = response.text.trim();
    const parsed = JSON.parse(text);

    if (parsed.suggestions && Array.isArray(parsed.suggestions) && parsed.suggestions.length >= 2) {
      return parsed.suggestions.slice(0, 2);
    } else {
      console.error("Unexpected AI response format:", parsed);
      throw new Error("The AI returned suggestions in an unexpected format.");
    }
  } catch (error) {
    console.error("Error fetching suggestions from Gemini:", error);
    throw new Error("Could not get AI suggestions. Please try again later.");
  }
};

interface CardOptions {
    artStyle: string;
    age: string;
    setting: string;
    toy: string;
    pet: string;
    clothingColor: string;
    hairAccessory: string;
    magicMoment: string;
}

export const generateBabyCard = async (image: { data: string; mimeType: string }, options: CardOptions): Promise<string> => {
    const { artStyle, age, setting, toy, pet, clothingColor, hairAccessory, magicMoment } = options;

    const specialDetails = [
        toy !== 'None' && `The child has their favorite toy, a ${toy}.`,
        pet !== 'None' && `Their beloved pet, a ${pet}, is nearby.`,
        clothingColor !== 'None' && `The child is wearing a ${clothingColor.toLowerCase()} outfit.`,
        hairAccessory !== 'None' && `The child is wearing a ${hairAccessory.toLowerCase()}.`
    ].filter(Boolean).join(' ');

    const prompt = `You are a skilled children's book illustrator. Your task is to take the provided photograph of a child and transform it into a beautiful illustration. Follow these instructions precisely:
1.  **Subject's Age**: The child in the illustration should look like a ${age}.
2.  **Art Style**: The final image must be in a '${artStyle}' style. (Classic Storybook: detailed and colorful with soft lighting. Watercolor Whimsy: soft, blended look. Vintage Charm: muted tones and texture. Playful Cartoon: simplified, bold outlines, bright colors).
3.  **Scene**: Place the child in a '${setting}' setting.
4.  **Details**: ${specialDetails || 'No special details requested.'}
5.  **Moment**: The overall mood should capture a feeling of '${magicMoment}'.

Generate ONLY the image. Do not add text or borders.`;
    
    const base64Data = image.data.split(',')[1];
    
    try {
        const response = await ai.models.generateContent({
            model: IMAGE_MODEL_NAME,
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType: image.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("The AI did not return an image. Please try adjusting your options.");

    } catch (error) {
        console.error("Error generating baby card from Gemini:", error);
        throw new Error("Could not generate the image. The model may be unavailable or the request was blocked. Please try again later.");
    }
};


export type TaleType = 'teaser' | 'mini' | 'summary' | 'full';

const getPromptForTaleType = (taleType: TaleType): { prompt: string; wordCount: string } => {
    switch (taleType) {
        case 'teaser':
            return {
                prompt: "Create a tiny, exciting glimpse of the story to get someone hooked. This is perfect for a quick text message.",
                wordCount: "25-50 words"
            };
        case 'mini':
            return {
                prompt: "Create a snapshot of the story, introducing the main characters and the beginning of their adventure.",
                wordCount: "100-150 words"
            };
        case 'summary':
            return {
                prompt: "Summarize the core adventure from start to finish, hitting all the key moments and highlights.",
                wordCount: "250-300 words"
            };
        default:
            return { prompt: '', wordCount: '' };
    }
}

export const generateShortTale = async (
    chapters: Chapter[],
    milestones: MilestoneData,
    taleType: TaleType
): Promise<string> => {
    
    const fullStory = chapters
        .map((chapter, index) => `Chapter ${index + 1}: ${chapter.name}\n${chapter.content}`)
        .join('\n\n');

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullStory;
    const plainTextStory = tempDiv.textContent || tempDiv.innerText || "";

    if (taleType === 'full') {
        return plainTextStory;
    }

    const { prompt: typePrompt, wordCount } = getPromptForTaleType(taleType);
    const age = calculateAge(milestones.dob);

    const prompt = `You are an expert storyteller. Your task is to summarize a story based on the user's request.

Here is the full story:
---
${plainTextStory}
---

Key Information about the main character:
- Full Name: ${milestones.name || 'Not provided'}
- Age: ${age !== null ? `${age} year(s) old` : 'Not provided'}

Your instructions:
1.  ${typePrompt}
2.  The length must be approximately ${wordCount}.
3.  Write in a warm, engaging, and personal tone, suitable for sharing with family and friends.
4.  Do not include any introductory or concluding phrases like "Here is the summary:" or "I hope you enjoy this tale."
5.  Return ONLY the generated story text.
`;
    
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 },
            },
        });
        
        return response.text.trim();

    } catch (error) {
        console.error("Error generating short tale from Gemini:", error);
        throw new Error("Could not generate the tale. The model may be unavailable. Please try again later.");
    }
};
