export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamChatParams {
  systemPrompt: string;
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
}

export interface AIError {
  code: string;
  message: string;
  retryable: boolean;
}
