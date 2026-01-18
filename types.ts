export interface Message {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: string;
  emotion?: {
    label: string;
    confidence: number;
    color: string;
  };
}

export interface Conflict {
  id: string;
  messageId: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  triggerMessage: string;
  alternatives?: {
    label: string;
    text: string;
    tone: string;
    predictedOutcome: string;
  }[];
}

export interface RelationshipMetrics {
  healthScore: number;
  velocity: number; // msgs per day
  initiationBalance: number; // percentage user initiates
  avgResponseTime: number; // minutes
}

export interface Prediction {
  label: string;
  probability: number;
  description: string;
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
}

export interface PsychologicalProfile {
  attachmentStyle: string; // e.g., "Secure", "Anxious", "Avoidant"
  attachmentDescription: string;
  loveLanguage: string;
  communicationStyle: string;
  hiddenNeeds: string[];
}

export interface AnalysisReport {
  contactName: string;
  messages: Message[];
  metrics: RelationshipMetrics;
  conflicts: Conflict[];
  predictions: Prediction[];
  psychologicalProfile: PsychologicalProfile;
  summary: string;
  momentumHistory: { date: string; score: number }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
