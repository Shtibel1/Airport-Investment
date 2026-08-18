import { agentOrchestrator, createDataStreamResponse } from '@/lib/agent';

export const maxDuration = 60;

export async function POST(req: Request) {
  console.log(`\n[API /api/chat] Incoming request at ${new Date().toISOString()}`);

  try {
    const { messages } = await req.json();
    const lastUserMessage =
      messages?.filter((m: any) => m.role === 'user').slice(-1)[0]?.content || '';

    console.log(
      `[API /api/chat] Dispatching to AgentOrchestrator with ${messages?.length || 1} conversation turns: "${lastUserMessage}"`
    );

    // Pass the full conversation messages array to preserve multi-turn context
    const streamGenerator = agentOrchestrator.execute(messages || lastUserMessage);
    return createDataStreamResponse(streamGenerator);
  } catch (error: any) {
    console.error('[API /api/chat Fatal Error]:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
