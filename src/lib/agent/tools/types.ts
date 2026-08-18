import { FunctionDeclaration } from '@google/genai';
import { z } from 'zod';

export interface AgentTool<TArgs = unknown, TResult = unknown> {
  name: string;
  description: string;
  schema: z.ZodType<TArgs>;
  declaration: FunctionDeclaration;
  execute: (args: TArgs) => Promise<TResult>;
}
