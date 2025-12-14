export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  mimeType: string;
  data: string; // Base64 encoded string
  size: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  uploadedFiles: UploadedFile[];
}

export interface ServiceConfig {
  apiKey: string;
}
