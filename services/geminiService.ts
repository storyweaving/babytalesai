import { GoogleGenAI } from "@google/genai";
import { MilestoneData } from '../types';

if (!process.env.API_KEY) {
  // This is a safeguard; the environment should have the key.
  // We avoid showing this to the user directly, but it's good for debugging.
  console.error("API_KEY environment variable not set");
  throw new Error("AI service is not configured.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function buildSystemInstruction(milestones: MilestoneData): string {
  const {
    writing_about,
    sex,
    name,
    dob,
    hometown,
    ethnicity,
    traditions,
    family_members,
    favorite_memories,
    parent_wishes,
  } = milestones;

  let instruction = `You are a world-class children's book author, specializing in warm, engaging, and age-appropriate stories for newborns to 5-year-olds. Your tone is gentle, comforting, and full of wonder.

Your task is to continue a story based on the user's input. Provide exactly TWO creative and distinct suggestions for the next 8 to 10 words. The suggestions should be different from each other and written in a continuous prose style. Do not number them, use bullet points, or any special formatting. Return the two suggestions separated by a double newline character ("\\n\\n").

Here is some information about the main character to help you write a personalized story:
- I'm writing about: ${writing_about || 'Not specified'}
- Name: ${name || 'The little one'}
- Sex: ${sex || 'Not specified'}
- Date of Birth: ${dob || 'Not specified'}
- Hometown: ${hometown || 'Not specified'}
- Ethnicity: ${ethnicity || 'Not specified'}
- Family Traditions: ${traditions || 'Not specified'}
- Family Members: ${family_members || 'Not specified'}
- Favorite Memories/Spots: ${favorite_memories || 'Not specified'}
- Parent/Grandparent's wishes for them: ${parent_wishes || 'Not specified'}`;
  
  return instruction;
}

export const getSuggestions = async (story: string, milestones: MilestoneData): Promise<string[]> => {
    const systemInstruction = buildSystemInstruction(milestones);
    
    // Convert HTML to plain text to safely truncate it without breaking tags.
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = story;
    const plainTextStory = tempDiv.textContent || tempDiv.innerText || '';

    // Truncate the story to the last 8000 characters to avoid exceeding the token limit.
    // This provides enough context for suggestions without sending the entire novel.
    const MAX_CONTEXT_CHARACTERS = 8000;
    const truncatedStory = plainTextStory.length > MAX_CONTEXT_CHARACTERS
        ? `...${plainTextStory.slice(-MAX_CONTEXT_CHARACTERS)}`
        : plainTextStory;

    const userPrompt = `Here is the story so far. Continue it from where it leaves off:
---
${truncatedStory}
---`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
            }
        });

        const text = response.text.trim();
        // Split by double newline, as requested in the prompt
        let suggestions = text.split('\n\n').map(s => s.trim()).filter(s => s !== '');
        
        if (suggestions.length === 0) {
          throw new Error("AI returned an empty response.");
        }

        // If the model returns only one suggestion, try splitting by single newline as a fallback.
        if (suggestions.length === 1) {
          const singleNewlineSuggestions = text.split('\n').map(s => s.trim()).filter(s => s !== '');
          if (singleNewlineSuggestions.length >= 2) {
            suggestions = singleNewlineSuggestions;
          }
        }
        
        // Pad with generic suggestions if we still don't have enough
        while (suggestions.length < 2) {
            suggestions.push("And then, a wonderful thing happened.", "Everyone smiled, feeling happy and warm.");
        }

        return suggestions.slice(0, 2);

    } catch (error) {
        console.error("Error generating suggestions:", error);
        // Return a user-friendly error message
        throw new Error("The AI storyteller is taking a nap. Please try again in a moment.");
    }
};
