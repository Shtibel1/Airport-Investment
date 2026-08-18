import { Type } from '@google/genai';
import { z } from 'zod';
import { AgentTool } from './types';
import { getRegionalAirports } from '../../core/airport-service';
import { RegionalRankingResult } from '../../core/scoring/types';

export const GetRegionalAirportsArgsSchema = z.object({
  region: z
    .string()
    .describe('US region name (e.g. "New England", "Southern California", "SoCal", "Bay Area")'),
  forceRefresh: z.boolean().optional().describe('Force fresh OpenSky live telemetry call'),
  longHaulThreshold: z.number().optional().describe('Threshold in miles to classify long-haul flights (default: 3000)'),
});

export type GetRegionalAirportsArgs = z.infer<typeof GetRegionalAirportsArgsSchema>;

export const getRegionalAirportsTool: AgentTool<GetRegionalAirportsArgs, RegionalRankingResult> = {
  name: 'getRegionalAirports',
  description:
    'Retrieves and ranks all candidate airports within a target US region by Modernization Potential Score (MPS) to identify priority expansion targets.',
  schema: GetRegionalAirportsArgsSchema,
  declaration: {
    name: 'getRegionalAirports',
    description:
      'Aggregates and ranks regional airports by Modernization Potential Score (MPS) to identify strong modernization candidates.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        region: {
          type: Type.STRING,
          description: 'US region name (e.g. "New England", "Southern California", "Bay Area")',
        },
        forceRefresh: {
          type: Type.BOOLEAN,
          description: 'Force fresh live telemetry call and bypass cache',
        },
        longHaulThreshold: {
          type: Type.NUMBER,
          description: 'Threshold in statute miles to classify long-haul flights (default: 3000)',
        },
      },
      required: ['region'],
    },
  },
  execute: async (args: GetRegionalAirportsArgs) => {
    const validated = GetRegionalAirportsArgsSchema.parse(args);
    return await getRegionalAirports(validated.region, {
      forceRefresh: validated.forceRefresh,
      longHaulThreshold: validated.longHaulThreshold,
    });
  },
};
