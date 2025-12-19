
import { GoogleGenAI, Type } from "@google/genai";
import { GithubRepoData, AIAnalysis } from "../types";

export const analyzeRepository = async (repo: GithubRepoData, languages: string[]): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this GitHub repository and provide a professional assessment:
    Repository: ${repo.full_name}
    Description: ${repo.description || 'No description provided.'}
    Main Languages: ${languages.join(', ')}
    Topics: ${repo.topics.join(', ')}
    Stars: ${repo.stargazers_count}
    Forks: ${repo.forks_count}

    Please return a JSON object with:
    1. A concise summary of what the project does.
    2. Potential maintenance or architectural issues based on the metadata.
    3. 3-5 actionable recommendations for the maintainers.
    4. A project "health score" from 1-100.
    5. Specific insights about the tech stack used.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          potentialIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          score: { type: Type.NUMBER },
          techStackInsights: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "potentialIssues", "recommendations", "score", "techStackInsights"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI failed to generate analysis");
  
  return JSON.parse(text);
};
