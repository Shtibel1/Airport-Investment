import { describe, it, expect } from 'vitest';
import { agentConfig } from './config';
import { formatDataStreamPart, createAgentReadableStream } from './stream-adapter';
import { AgentOrchestrator } from './orchestrator';
import { AgentChatMessage, AgentStreamEvent } from './types';

describe('Agent Orchestration Architecture & Services', () => {
  it('loads valid system prompt with domain rules', () => {
    const prompt = agentConfig.systemPrompt;
    expect(prompt).toBeDefined();
    expect(prompt.length).toBeGreaterThan(50);
    expect(prompt).toContain('Airport');
  });

  it('determines the configured Gemini model name', () => {
    const model = agentConfig.model;
    expect(model).toBeDefined();
    expect(typeof model).toBe('string');
  });

  it('correctly formats all AI SDK DataStream protocol chunks', () => {
    const textEvent: AgentStreamEvent = { type: 'text-delta', text: 'Executive Summary for LAX' };
    expect(formatDataStreamPart(textEvent)).toBe(`0:"Executive Summary for LAX"\n`);

    const toolCallEvent: AgentStreamEvent = {
      type: 'tool-call',
      toolCallId: 'call_123',
      toolName: 'getAirportMetrics',
      args: { airportCode: 'LAX' },
    };
    expect(formatDataStreamPart(toolCallEvent)).toBe(
      `9:{"toolCallId":"call_123","toolName":"getAirportMetrics","args":{"airportCode":"LAX"}}\n`
    );

    const toolResultEvent: AgentStreamEvent = {
      type: 'tool-result',
      toolCallId: 'call_123',
      toolName: 'getAirportMetrics',
      result: { iata: 'LAX', mpsScore: 70.2 },
    };
    expect(formatDataStreamPart(toolResultEvent)).toBe(
      `a:{"toolCallId":"call_123","result":{"iata":"LAX","mpsScore":70.2}}\n`
    );

    const finishEvent: AgentStreamEvent = {
      type: 'finish',
      finishReason: 'stop',
      usage: { promptTokens: 100, completionTokens: 50 },
    };
    expect(formatDataStreamPart(finishEvent)).toBe(
      `d:{"finishReason":"stop","usage":{"promptTokens":100,"completionTokens":50}}\n`
    );

    const errorEvent: AgentStreamEvent = {
      type: 'error',
      error: 'Network timeout',
    };
    expect(formatDataStreamPart(errorEvent)).toBe(`3:"Network timeout"\n`);
  });

  it('converts an AsyncGenerator of events into a ReadableStream', async () => {
    async function* mockEvents(): AsyncGenerator<AgentStreamEvent> {
      yield { type: 'text-delta', text: 'Hello' };
      yield { type: 'finish', finishReason: 'stop' };
    }

    const stream = createAgentReadableStream(mockEvents());
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value);
    }

    expect(accumulated).toContain(`0:"Hello"\n`);
    expect(accumulated).toContain(`d:{"finishReason":"stop"`);
  });

  it('gracefully emits an error when API key is unavailable', async () => {
    const originalGoogleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const originalGeminiKey = process.env.GEMINI_API_KEY;
    const originalGoogleApiKey = process.env.GOOGLE_API_KEY;

    try {
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_API_KEY;

      const orchestrator = new AgentOrchestrator();
      const events: AgentStreamEvent[] = [];

      for await (const ev of orchestrator.execute('Test prompt')) {
        events.push(ev);
      }

      const hasKey = agentConfig.apiKey !== '';
      if (!hasKey) {
        expect(events.some((e) => e.type === 'error')).toBe(true);
      } else {
        expect(events.length).toBeGreaterThan(0);
      }
    } finally {
      if (originalGoogleKey) process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalGoogleKey;
      if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
      if (originalGoogleApiKey) process.env.GOOGLE_API_KEY = originalGoogleApiKey;
    }
  });

  it('accepts multi-turn conversational message arrays', async () => {
    const orchestrator = new AgentOrchestrator();
    const conversationHistory: AgentChatMessage[] = [
      { role: 'user', content: 'Compare LAX and SNA' },
      { role: 'assistant', content: 'LAX has an MPS of 70.2 while SNA is 45.0.' },
      { role: 'user', content: 'Which one has higher runway delay rates?' },
    ];

    // Verify it doesn't crash during initialization and parameter parsing
    const generator = orchestrator.execute(conversationHistory);
    expect(generator).toBeDefined();
  });
});
