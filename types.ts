
export type MessageType = 'text' | 'image' | 'video' | 'code' | 'search' | 'app';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  type: MessageType;
  content: string;
  metadata?: {
    imageUrl?: string;
    videoUrl?: string;
    code?: string;
    language?: string;
    sources?: Array<{ title: string; uri: string }>;
    isPending?: boolean;
    operationId?: string;
  };
  timestamp: number;
}

export interface GenerationConfig {
  model: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  resolution?: '720p' | '1080p';
}
