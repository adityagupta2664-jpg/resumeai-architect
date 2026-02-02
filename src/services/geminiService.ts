import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize the client on demand to avoid top-level crashes
const getClient = () => {
  // Use Vite's environment variable system
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is missing. Falling back to Mock Mode for demonstration.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Enhanced Mock Mode for high-fidelity demonstration.
 */
const generateMockAnalysis = (jobTitle: string): AnalysisResult => {
  return {
    overallScore: 78,
    summary: `This is a high-fidelity demonstration analysis for a "${jobTitle || 'General Professional'}" role. Your resume shows strong technical foundations but could benefit from more quantifiable impact metrics. The structure is professional, but key industry-standard keywords for 2025 are currently underrepresented.`,
    sections: [
      { name: "Header", score: 95, feedback: "Excellent contact information and professional links (LinkedIn/GitHub) present." },
      { name: "Experience", score: 72, feedback: "Good chronological structure. Needs more 'Action Verbs' and specific percentage-based achievements." },
      { name: "Skills", score: 85, feedback: "Strong technical stack, well-categorized." },
      { name: "Education", score: 90, feedback: "Degree information is clear and appropriately placed." }
    ],
    keywords: {
      present: ["TypeScript", "React", "Node.js", "System Design", "Agile"],
      missing: ["Cloud Native", "CI/CD Orchestration", "Microservices Architecture", "OAuth 2.0", "Performance Optimization"]
    },
    actionItems: [
      { priority: "High", category: "Impact", suggestion: "Rephrase experience bullet points to follow the Google 'X-Y-Z' formula: Accomplished [X] as measured by [Y], by doing [Z]." },
      { priority: "Medium", category: "Keywords", suggestion: "Integrate more cloud-specific terminology if targeting Senior roles." },
      { priority: "Low", category: "Formatting", suggestion: "Ensure consistency in date formatting across all entries." }
    ],
    jobMarketInsights: "Currently, 2025 hiring trends emphasize stability, cost-optimization skills, and deep integration of AI-assisted development workflows."
  };
};

/**
 * Step 1: Gather Job Market Context using Google Search Grounding.
 */
const getJobMarketContext = async (jobTitle: string): Promise<string> => {
  if (!jobTitle) return "General professional standards apply.";

  try {
    const ai = getClient();
    if (!ai) return "Standard industry keywords apply.";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the top 10 most critical technical skills, soft skills, and industry keywords for a "${jobTitle}" role in 2025. Focus on what ATS systems prioritize.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text || "Standard industry keywords apply.";
  } catch (error) {
    console.error("Error fetching job market context:", error);
    return "Standard industry keywords apply.";
  }
};

/**
 * Step 2: Perform Quick Initial Scan.
 */
export const getQuickSummary = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const ai = getClient();
    if (!ai) return "Analyzing structure...";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Give me a 2-sentence 'first impression' summary of this resume structure and professionalism.",
          },
        ],
      },
    });
    return response.text || "Ready for deep analysis.";
  } catch (error) {
    return "Ready for deep analysis.";
  }
};

/**
 * Step 3: Deep Analysis with Thinking Mode.
 */
export const analyzeResume = async (
  fileData: { base64: string; mimeType: string },
  jobTitle: string,
  jobDescription: string = ""
): Promise<AnalysisResult> => {

  const ai = getClient();
  if (!ai) {
    // Graceful fallback to Mock Mode
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockAnalysis(jobTitle)), 1500);
    });
  }

  // 1. Fetch Context (Market data is used alongside specific JD)
  const marketContext = await getJobMarketContext(jobTitle);

  // 2. Define the response schema for strict JSON
  // ... (keeping schema same)
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.INTEGER, description: "Score from 0 to 100" },
      summary: { type: Type.STRING, description: "Executive summary of the analysis" },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
          },
          required: ["name", "score", "feedback"],
        },
      },
      keywords: {
        type: Type.OBJECT,
        properties: {
          present: { type: Type.ARRAY, items: { type: Type.STRING } },
          missing: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["present", "missing"],
      },
      actionItems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            suggestion: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["Formatting", "Content", "Keywords", "Impact"] },
          },
          required: ["priority", "suggestion", "category"],
        },
      },
      jobMarketInsights: { type: Type.STRING, description: "Insights used for the analysis" },
    },
    required: ["overallScore", "summary", "sections", "keywords", "actionItems", "jobMarketInsights"],
  };

  // 3. Construct the 'Super Perfect' Prompt
  const prompt = `
    You are a World-Class ATS Architect and Executive Resume Coach.
    
    CRITICAL TASK: Perform an exhaustive analysis of the attached resume for the role: "${jobTitle || "General Professional"}".
    
    ${jobDescription ? `SPECIFIC JOB DESCRIPTION TO MATCH AGAINST:\n${jobDescription}\n` : ""}

    MARKET CONTEXT (2025):
    ${marketContext}
    
    STRICT EVALUATION CRITERIA:
    1. IMPACT: Look for quantifiable metrics (%, $, time). If missing, mark score down heavily.
    2. KEYWORDS: Compare against the ${jobDescription ? "Specific Job Description (Primary)" : "Market Context"}. Identify exact missing high-value terms.
    3. BREVITY: Is it concise? Does it use the Google X-Y-Z formula for bullets?
    4. ATS PARSABILITY: Are there complex layouts that might break traditional parsers?
    
    YOUR OUTPUT MUST BE:
    - 100% Accurate and tailored to the provided context.
    - Extremely critical but professional and constructive.
    - Provide deep, non-obvious insights.
    - If a section is weak, explain EXACTLY how to rewrite a sample bullet point.
    
    THINKING REQUIREMENT:
    - Exhaustively cross-reference every bullet point with ${jobDescription ? "the Specific Job Description" : "local market trends for " + jobTitle}.
    - Evaluate the 'Seniority' level of the language used vs the target role.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: {
          thinkingBudget: 32768,
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini.");
    }

    const data = JSON.parse(response.text);
    return data as AnalysisResult;
  } catch (err) {
    console.error("Deep analysis failed, falling back to Mock Mode.", err);
    return generateMockAnalysis(jobTitle);
  }
};
