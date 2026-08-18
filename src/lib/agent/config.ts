import * as fs from 'fs';
import * as path from 'path';

let cachedSystemPrompt: string | null = null;

function resolveSystemPrompt(): string {
  const promptPaths = [
    path.resolve(process.cwd(), '.agents/SYSTEM_PROMPT.md'),
    path.resolve(process.cwd(), 'agent/SYSTEM_PROMPT.md'),
  ];

  for (const p of promptPaths) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8').trim();
        if (content.length > 0) {
          return content;
        }
      }
    } catch (err) {
      console.warn(`[agentConfig] Could not read system prompt from ${p}:`, err);
    }
  }

  return 'You are the Airport Investment Intelligence Agent, a senior aviation investment analyst advising private equity and infrastructure modernization funds.';
}

/**
 * Authoritative, centralized Agent configuration object.
 */
export const agentConfig = {
  get apiKey(): string {
    return process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || '';
  },

  get model(): string {
    return process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash';
  },

  get openSkyApiUrl(): string {
    return (
      process.env.OPENSKY_DEPARTURES_API_URL?.trim() ||
      'https://opensky-network.org/api/flights/departure'
    );
  },

  get systemPrompt(): string {
    if (!cachedSystemPrompt) {
      cachedSystemPrompt = resolveSystemPrompt();
    }
    return cachedSystemPrompt;
  },

  maxSteps: 5,
};

// Backward-compatible alias
export const AgentConfigService = {
  getApiKey: () => agentConfig.apiKey,
  getSystemPrompt: () => agentConfig.systemPrompt,
  getModelName: () => agentConfig.model,
  getOpenSkyApiUrl: () => agentConfig.openSkyApiUrl,
};
