import { agentOrchestrator, createDataStreamResponse, AgentChatMessage } from '@/lib/agent';

export const maxDuration = 60;

export async function POST(req: Request) {
  console.log(`\n[API /api/chat] Incoming request at ${new Date().toISOString()}`);

  try {
    const body = (await req.json()) as { messages?: AgentChatMessage[] };
    const messages = body.messages;
    const lastUserMessage =
      messages?.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';

    console.log(
      `[API /api/chat] Dispatching to AgentOrchestrator with ${messages?.length || 1} conversation turns: "${lastUserMessage}"`
    );

    // Pass the full conversation messages array to preserve multi-turn context
    const streamGenerator = agentOrchestrator.execute(messages || lastUserMessage);
    return createDataStreamResponse(streamGenerator);
  } catch (error: unknown) {
    console.error('[API /api/chat Fatal Error]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
