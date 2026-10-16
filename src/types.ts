export type MessageRole = 'user' | 'assistant';

export type CategoryType = 
  | 'general'
  | 'study'
  | 'translation'
  | 'resume'
  | 'daily_plan'
  | 'exam_prep'
  | 'job_application';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: string;
  category?: CategoryType;
  isOfflineFallback?: boolean;
  error?: boolean;
}

export interface ConnectionStatus {
  configured: boolean;
  tested: boolean;
  working: boolean;
  model: string;
  message: string;
  testing?: boolean;
  error?: string;
}

export interface QuickActionItem {
  id: CategoryType;
  titleTelugu: string;
  subtitleTelugu: string;
  iconName: string;
  accentColor: string;
  samplePrompts: string[];
}

export interface SavedSession {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}
