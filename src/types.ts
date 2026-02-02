export interface AnalysisResult {
  overallScore: number;
  summary: string;
  sections: SectionScore[];
  keywords: {
    present: string[];
    missing: string[];
  };
  actionItems: ActionItem[];
  jobMarketInsights: string;
}

export interface SectionScore {
  name: string;
  score: number;
  feedback: string;
}

export interface ActionItem {
  priority: 'High' | 'Medium' | 'Low';
  suggestion: string;
  category: 'Formatting' | 'Content' | 'Keywords' | 'Impact';
}

export enum AppState {
  AUTH = 'AUTH',
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  REPORT = 'REPORT',
  ERROR = 'ERROR'
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  jobTitle: string;
  score: number;
  result: AnalysisResult;
  fileName: string;
}
