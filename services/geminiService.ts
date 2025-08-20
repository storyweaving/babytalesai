import { GoogleGenAI, Type } from "@google/genai";
import { MilestoneData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API Key not found. Make sure you have set API_KEY in your project settings.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

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
- Subject: ${milestones.writing_about || 'Not provided'}
- Name: ${milestones.name || 'Not provided'}
- Sex: ${milestones.sex || 'Not provided'}
- Age: ${age !== null ? `${age} year(s) old` : 'Not provided'}
- Date of Birth: ${milestones.dob || 'Not provided'}
- Hometown / Neighborhood: ${milestones.hometown || 'Not provided'}
- Ethnicity: ${milestones.ethnicity || 'Not provided'}
- Family Traditions: ${milestones.traditions || 'Not provided'}
- Family Members: ${milestones.family_members || 'Not provided'}
- Favorite Memories/Vacations: ${milestones.favorite_memories || 'Not provided'}
- Parent/Grandparent Wishes: ${milestones.parent_wishes || 'Not provided'}

Follow these rules STRICTLY for each suggestion you generate:
1.  **Seamless Continuation:** Each suggestion must naturally continue the user's VERY LAST sentence. It must match the user's tone and vocabulary perfectly. Do not repeat the last few words of the user's text.
2.  **Narrative Flow, Not Just Time:** Instead of a simple time reference (e.g., "at 3 PM"), create a phrase that implies time or setting through action, sensory details, or emotional context. Think about what would logically happen or be observed next.
3.  **Logical & Contextual Consistency:** The suggestions MUST be logically consistent with all details provided in the story and key information. If the story mentions being at "Martha's Vineyard," do not suggest an activity in "Rockland."
4.  **Age-Appropriate Actions:** The suggestions must be appropriate for the character's age. A one-year-old enjoys simple, sensory experiences like splashing in water or playing with sand, not watching a Celtics game. Use the provided age to guide your suggestions.
5.  **Grounded in Believable Reality:** Suggestions should feel real and personal. Draw on common, relatable life moments, the changing of seasons, or specific, personal details from the key information (like names of family members or favorite places). Avoid generic clichés and forced references to famous brands or events unless directly relevant.
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