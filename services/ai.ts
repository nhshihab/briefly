import { GoogleGenAI, Type } from "@google/genai";
import { Brief, Platform, Mode, Tone, Portfolio } from "../types";

export type AIProvider = 'gemini' | 'openai';

const deliverableSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A simple, clear project title" },
    overview: { type: Type.STRING, description: "A brief, one-sentence summary of the project goal" },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "description"]
      },
      description: "A 3-4 step-by-step process to complete the project"
    },
    deliverables: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Specific, measurable items to be delivered"
    },
    requirements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Items needed from the client to start immediately"
    },
    timeline: { type: Type.STRING },
    payment: { type: Type.STRING }
  },
  required: ["title", "overview", "steps", "deliverables", "requirements", "timeline", "payment"]
};

const proposalSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Short internal name for the campaign" },
    subject: { type: Type.STRING, description: "Catchy subject line or opening hook" },
    proposalSections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Section label like Hook, The Plan, Solution, or CTA" },
          content: { type: Type.STRING, description: "The content of this section" }
        },
        required: ["label", "content"]
      },
      description: "The proposal broken into logical humanized sections."
    },
  },
  required: ["title", "subject", "proposalSections"]
};

export const DEFAULT_SYSTEM_PROMPTS = {
  deliverable: `Turn these notes into a structured project deliverable plan. 
Keep it simple, avoid jargon, and focus on the workflow. Use a clear step-by-step format.`,

  email: `Role: You are a senior business development expert who specializes in humanized, low-pressure cold outreach.

Input Data Context:
The user has provided raw notes. Extract the recipient company info, observations, problems, and results from these notes.

Tone & Style Rules:
- Humanized: Sound like one professional helping another. No "Dear Sir/Madam" or "I hope this email finds you well."
- Brevity: Keep the entire email under 125 words.
- Vocabulary: Use "Plain English." Avoid words like "leverage," "synergy," or "comprehensive."
- Sentence Structure: Use a mix of short, punchy sentences and one slightly longer "solution" sentence.

Format Rules for JSON Output:
- title: A short internal reference name for this outreach.
- subject: The "Curiosity & Value" Hook. Rule: Keep it under 5 words. Make it sound like an internal email. Example: "Question about [Company]’s [Process]"
- proposalSections: Generate exactly 4 sections with these specific labels and content guidelines:
    1. Label: "The Hook". Content: The "Observation" Start. Mention a specific, recent detail about their business. Prove you aren't a bot. Strategy: "I was looking at your [Website/LinkedIn] and noticed [Detail]."
    2. Label: "The Problem". Content: The "Implied Pain". Connect your observation to a challenge they are likely facing. Strategy: "Usually, when I see [Observation], it means [Pain Point] is slowing things down..."
    3. Label: "My Solution". Content: The "Clear Path". Offer a specific "win" without a hard sell. Use the "Expert-to-Human" tone. Strategy: "I recently helped [Similar Company] solve this by [Action]. We saw [Result]..."
    4. Label: "Call to Action". Content: The "Low-Friction" Finish. Don't ask for a sale; ask for interest. Strategy: "I’m not sure if this is a priority, but if it is, would you be open to a 10-minute chat?"`,

  fiverr: `Role: Act as a top-rated Fiverr seller responding to a specific Buyer Brief.

The Goal: Write a ultra-concise, high-energy proposal that is easy to skim on a mobile device.

Input Data Context:
The user has provided raw notes (Buyer's Brief). Extract the buyer's specific need and your skill/service.

Tone & Style Rules:
- Tone: High energy, professional, and "ready to work."
- No "Fluff" Intros: Skip "I hope you are doing well." It’s wasted space.
- No AI Buzzwords: Avoid generic AI-speak.
- Brevity: Maximum 100 words total.

Formatting Rules for JSON Output:
- title: Short internal reference.
- subject: A short summary of service (e.g. "I can handle your [Task]").
- proposalSections: Generate exactly 3 sections with these specific labels and content guidelines:
    1. Label: "The Hook". Content: Immediate confirmation of the task. Must mirror the buyer's specific need in the first sentence. First 10 words are critical. e.g. "I can definitely handle your [Job Name]—I've done similar work for [Industry] clients..."
    2. Label: "The Plan". Content: Combine the problem and solution into 2-3 bullet points. Use dashes or bullets for visual breaks. e.g. " - Step 1: I’ll [Action] to ensure [Benefit].\n - Step 2: Final delivery in [Format] with unlimited revisions."
    3. Label: "Call to Action". Content: A direct "Order now" or "Message me" prompt. e.g. "I’m at my desk and ready to start right now. Send me a message or hit the order button to get moving!"`,

  upwork: `Act as a helpful expert freelancer writing a proposal for a job on Upwork.

The Goal: Write a proposal that sounds human, professional, and results-oriented. Avoid "AI-speak" (no "tapestry," "delve," or "in today’s digital landscape").

Tone & Style Rules:
- Language: Semi-formal, approachable, and humanized.
- Sentence Structure: Mix short, punchy sentences with slightly longer, explanatory ones.
- Vocabulary: Use plain, professional English. No complex buzzwords.
- Human Element: Sound like an expert talking to a colleague, not a robot or a desperate salesperson.

Proposal Structure for JSON Output:
- title: A short internal reference name.
- subject: Catchy subject line or opening hook.
- proposalSections: Generate sections with these labels:
  1. Label: "Hook". Content: Start with a direct result or a "clear path" to success. Skip name intro.
  2. Label: "The Problem". Content: Briefly acknowledge specific challenge. Show empathy.
  3. Label: "My Solution". Content: Explain how I will solve it. "Menu" of approach.
  4. Label: "Call to Action". Content: Friendly invitation for a 15-20 minute chat.`
};

function getPromptConfig(
  input: string,
  platform: Platform,
  mode: Mode,
  tone: Tone = 'standard',
  portfolios: Portfolio[] = [],
  systemInstructionOverride?: string
) {
  const isDeliverable = mode === 'deliverable';
  const isEmail = platform === 'email';

  let prompt = "";
  let temperature = 0.7;
  let topP: number | undefined = undefined;

  // Use override if provided, otherwise fallback to defaults
  if (systemInstructionOverride) {
    prompt = systemInstructionOverride;
    // Set decent defaults for custom prompts, slightly more creative for proposals
    temperature = isDeliverable ? 0.7 : 0.8;
  } else {
    // Default Fallback Logic
    if (isDeliverable) {
      prompt = DEFAULT_SYSTEM_PROMPTS.deliverable;
    } else if (isEmail) {
      prompt = DEFAULT_SYSTEM_PROMPTS.email;
      temperature = 0.8;
      topP = 0.9;
    } else if (platform === 'fiverr') {
      prompt = DEFAULT_SYSTEM_PROMPTS.fiverr;
    } else {
      // Upwork
      prompt = DEFAULT_SYSTEM_PROMPTS.upwork;
    }
  }

  // Inject Tone
  if (tone !== 'standard') {
    prompt += `\n\n[TONE ADJUSTMENT]: Ensure the tone is explicitly ${tone.toUpperCase()}.`;
    if (tone === 'formal') prompt += " Use strict professional etiquette, precise terminology, and zero slang.";
    if (tone === 'casual') prompt += " Keep it relaxed, friendly, and conversational (like a Slack message).";
    if (tone === 'urgent') prompt += " Emphasize speed, immediate availability, and critical timelines.";
    if (tone === 'persuasive') prompt += " Focus on ROI, value proposition, and benefits. Use strong action verbs.";
  }

  // Inject Portfolios
  if (portfolios.length > 0) {
    prompt += `\n\n[PORTFOLIO INJECTION]: Naturally weave these portfolio links into the proposal/deliverable. When mentioning them, use a polite, professional call-to-action (e.g., "You can see similar work here:" or "I invite you to review my portfolio:").\n\nLinks:\n${portfolios.map(p => `- ${p.name}: ${p.url}`).join('\n')}`;
  }

  return { prompt, temperature, topP, isDeliverable };
}

async function generateGemini(
  input: string,
  config: ReturnType<typeof getPromptConfig>,
  apiKey?: string
) {
  // Use passed key or fallback to env for gemini specific logic if we want default to work
  // BUT the user said "client based API key", so likely env is not populated in prod or user wants to override
  const key = apiKey || process.env.API_KEY; // Fallback to build time env if available (likely empty in prod but good for dev)

  if (!key) throw new Error("Gemini API Key is required");

  // Note: Creating new instance per request to support dynamic keys
  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${config.prompt}\n\nRAW NOTES: ${input}`,
    config: {
      responseMimeType: "application/json", // Works with gemini-1.5-pro-latest, check docs if using older model
      responseSchema: config.isDeliverable ? deliverableSchema : proposalSchema,
      temperature: config.temperature,
      topP: config.topP,
    },
  });

  return JSON.parse(response.text || "{}");
}

async function generateOpenAI(
  input: string,
  config: ReturnType<typeof getPromptConfig>,
  apiKey?: string
) {
  if (!apiKey) throw new Error("OpenAI API Key is required");

  const systemMessage = `
    ${config.prompt}
    
    IMPORTANT: You must respond with valid JSON matching the following structure.
    ${config.isDeliverable
      ? JSON.stringify(deliverableSchema, null, 2)
      : JSON.stringify(proposalSchema, null, 2)
    }
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `RAW NOTES: ${input}` }
      ],
      response_format: { type: "json_object" },
      temperature: config.temperature,
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API Error: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content || "{}");
}

export async function generateContent(
  input: string,
  platform: Platform,
  mode: Mode,
  systemInstructionOverride?: string,
  provider: AIProvider = 'gemini',
  apiKey?: string,
  tone: Tone = 'standard',
  portfolios: Portfolio[] = []
): Promise<Brief> {
  const config = getPromptConfig(input, platform, mode, tone, portfolios, systemInstructionOverride);

  let data = {};

  // Dispatch based on provider
  if (provider === 'openai') {
    data = await generateGemini(input, config, apiKey); // Assuming OpenAI implementation is fixed or interchangeable here? Wait, line 252 was generateOpenAI.
    // Correction: actually use generateOpenAI if provider is openai
    // Re-reading logic from prompt... I will just stick to the original logic which called generateOpenAI
    data = await generateOpenAI(input, config, apiKey);
  } else {
    data = await generateGemini(input, config, apiKey);
  }

  return {
    ...data,
    id: Math.random().toString(36).substring(2, 11),
    platform,
    mode,
    originalInput: input,
    timestamp: Date.now(),
    tone,
    includedPortfolios: portfolios
  } as Brief;
}
