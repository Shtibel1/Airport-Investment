import { AgentStreamEvent } from './types';

/**
 * Encodes an AgentStreamEvent into the Vercel AI SDK DataStream protocol line.
 */
export function formatDataStreamPart(event: AgentStreamEvent): string {
  switch (event.type) {
    case 'text-delta':
      return `0:${JSON.stringify(event.text)}\n`;
    case 'tool-call':
      return `9:${JSON.stringify({
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        args: event.args,
      })}\n`;
    case 'tool-result':
      return `a:${JSON.stringify({
        toolCallId: event.toolCallId,
        result: event.result,
      })}\n`;
    case 'finish':
      return `d:${JSON.stringify({
        finishReason: event.finishReason || 'stop',
        usage: event.usage || { promptTokens: 0, completionTokens: 0 },
      })}\n`;
    case 'error':
      return `3:${JSON.stringify(event.error)}\n`;
    default:
      return '';
  }
}

/**
 * Converts an AsyncGenerator of AgentStreamEvent into a ReadableStream suitable for HTTP streaming.
 */
export function createAgentReadableStream(
  eventGenerator: AsyncGenerator<AgentStreamEvent>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of eventGenerator) {
          const formatted = formatDataStreamPart(event);
          if (formatted) {
            controller.enqueue(encoder.encode(formatted));
          }
        }
      } catch (err: any) {
        console.error('[StreamAdapter] Stream pipeline error:', err);
        const errorPart = formatDataStreamPart({
          type: 'error',
          error: err?.message || 'Streaming failure occurred',
        });
        controller.enqueue(encoder.encode(errorPart));
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Wraps an AgentStreamEvent generator into a Next.js streaming Response with AI SDK headers.
 */
export function createDataStreamResponse(
  eventGenerator: AsyncGenerator<AgentStreamEvent>
): Response {
  const stream = createAgentReadableStream(eventGenerator);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'x-vercel-ai-data-stream': 'v1',
    },
  });
}
