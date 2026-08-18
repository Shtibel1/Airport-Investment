export type AgentStreamEventType =
  | 'text-delta'
  | 'tool-call'
  | 'tool-result'
  | 'finish'
  | 'error';

export interface TextDeltaEvent {
  type: 'text-delta';
  text: string;
}

export interface ToolCallEvent {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
}

export interface ToolResultEvent {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: any;
}

export interface FinishEvent {
  type: 'finish';
  finishReason: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface ErrorEvent {
  type: 'error';
  error: string;
}

export type AgentStreamEvent =
  | TextDeltaEvent
  | ToolCallEvent
  | ToolResultEvent
  | FinishEvent
  | ErrorEvent;

export interface AgentChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentExecutionOptions {
  model?: string;
  systemPrompt?: string;
  maxSteps?: number;
  temperature?: number;
}
