import { GoogleGenAI } from '@google/genai';
import { TOOL_DECLARATIONS, executeTool } from './tools';
import { agentConfig } from './config';
import { AgentChatMessage, AgentExecutionOptions, AgentStreamEvent } from './types';

export class AgentOrchestrator {
  /**
   * Runs the full agent loop and yields typed stream events.
   */
  async *execute(
    input: string | AgentChatMessage[],
    options: AgentExecutionOptions = {}
  ): AsyncGenerator<AgentStreamEvent> {
    const startTime = Date.now();
    const messagesList: AgentChatMessage[] = typeof input === 'string'
      ? [{ role: 'user', content: input }]
      : input;

    const lastUserMessage =
      messagesList.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';

    // Extract prior turns to populate chat history for conversational follow-ups
    const priorMessages = messagesList.slice(0, -1);
    const history = priorMessages
      .filter((m) => m.content && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const apiKey = agentConfig.apiKey;
    if (!apiKey) {
      yield {
        type: 'error',
        error: 'GOOGLE_GENERATIVE_AI_API_KEY is not configured in environment or .env.local.',
      };
      return;
    }

    const modelName = options.model || agentConfig.model;
    const systemPrompt = options.systemPrompt || agentConfig.systemPrompt;
    const maxSteps = options.maxSteps ?? agentConfig.maxSteps;

    console.log(`[AgentOrchestrator] Starting session with model: ${modelName}, history turns: ${history.length}`);

    const ai = new GoogleGenAI({ apiKey });

    try {
      const chat = ai.chats.create({
        model: modelName,
        history: history.length > 0 ? (history as any) : undefined,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
          ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
        },
      });

      // Send current user message
      let currentResponse = await chat.sendMessage({
        message: lastUserMessage,
      });

      // Multi-step tool execution loop
      let step = 0;
      while (step < maxSteps) {
        const functionCalls = currentResponse.functionCalls;
        if (!functionCalls || functionCalls.length === 0) {
          break;
        }

        for (const call of functionCalls) {
          const toolName = call.name || 'unknownTool';
          const toolCallId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const args = (call.args as Record<string, any>) || {};

          console.log(`[AgentOrchestrator] Executing tool ${toolName} with args:`, args);

          // Emit tool call event
          yield {
            type: 'tool-call',
            toolCallId,
            toolName,
            args,
          };

          try {
            const toolResult = await executeTool(toolName, args);

            // Emit tool result event
            yield {
              type: 'tool-result',
              toolCallId,
              toolName,
              result: toolResult,
            };

            // Feed tool result back to Gemini conversation
            currentResponse = await chat.sendMessage({
              message: [
                {
                  functionResponse: {
                    name: toolName,
                    response: { result: toolResult },
                  },
                },
              ],
            });
          } catch (toolError: any) {
            console.error(`[AgentOrchestrator] Tool ${toolName} error:`, toolError);
            const errorMessage = toolError?.message || 'Tool execution failed';

            yield {
              type: 'tool-result',
              toolCallId,
              toolName,
              result: { error: errorMessage },
            };

            currentResponse = await chat.sendMessage({
              message: [
                {
                  functionResponse: {
                    name: toolName,
                    response: { error: errorMessage },
                  },
                },
              ],
            });
          }
        }

        step++;
      }

      // Final assistant response text
      const replyText = currentResponse.text || '';
      if (replyText) {
        yield {
          type: 'text-delta',
          text: replyText,
        };
      }

      // Emit finish event
      yield {
        type: 'finish',
        finishReason: 'stop',
        usage: { promptTokens: 0, completionTokens: 0 },
      };

      console.log(`[AgentOrchestrator] Execution finished successfully in ${Date.now() - startTime}ms`);
    } catch (error: any) {
      console.error('[AgentOrchestrator] Fatal execution error:', error);
      yield {
        type: 'error',
        error: error?.message || 'An unexpected error occurred during agent execution.',
      };
    }
  }
}

export const agentOrchestrator = new AgentOrchestrator();
