
export type Platform = 'fiverr' | 'upwork' | 'email';
export type Mode = 'deliverable' | 'proposal';
export type Tone = 'standard' | 'formal' | 'casual' | 'urgent' | 'persuasive';

export interface ProposalSection {
  label: string;
  content: string;
}

export interface Brief {
  id: string;
  platform: Platform;
  mode: Mode;
  title: string;
  timestamp: number;
  originalInput: string;
  tone?: Tone;
  includedPortfolios?: Portfolio[];

  // Deliverable specific
  overview?: string;
  steps?: {
    title: string;
    description: string;
  }[];
  deliverables?: string[];
  requirements?: string[];
  timeline?: string;
  payment?: string;

  // Proposal specific
  proposalSections?: ProposalSection[];
  subject?: string;
}

export type AIProvider = 'gemini' | 'openai';

export interface ApiConfig {
  provider: AIProvider;
  keys: {
    gemini: string;
    openai: string;
  };
}

export interface PromptConfig {
  fiverr: string;
  upwork: string;
  email: string;
  deliverable: string;
}

export interface Portfolio {
  id: string;
  name: string;
  url: string;
}

export type Theme = 'light' | 'dark';
