import { FunctionDeclaration } from '@google/genai';
import { AgentTool } from './types';
import { getAirportMetricsTool } from './get-airport-metrics';
import { compareAirportsTool } from './compare-airports';
import { getRegionalAirportsTool } from './get-regional-airports';

export * from './types';
export * from './get-airport-metrics';
export * from './compare-airports';
export * from './get-regional-airports';

export const AGENT_TOOLS: Record<string, AgentTool> = {
  getAirportMetrics: getAirportMetricsTool,
  calculateInvestmentScore: getAirportMetricsTool, // backward-compatible alias
  compareAirports: compareAirportsTool,
  getRegionalAirports: getRegionalAirportsTool,
};

export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  getAirportMetricsTool.declaration,
  compareAirportsTool.declaration,
  getRegionalAirportsTool.declaration,
];

export async function executeTool(name: string, args: any): Promise<any> {
  const tool = AGENT_TOOLS[name];
  if (!tool) {
    throw new Error(`Unknown tool requested: ${name}`);
  }
  return await tool.execute(args);
}
