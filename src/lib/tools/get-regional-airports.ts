import { Type } from '@google/genai';
import { z } from 'zod';
import { AgentTool } from './types';
import { getRegionalAirports } from '../api/aviation';
import { RegionalRankingResult } from '../scoring/types';

export const getRegionalAirportsSchema = z.object({
  region: z.string().min(2, 'Region name must be provided (e.g. "New England", "Southern California", "Bay Area")'),
  longHaulThresholdMiles: z.number().positive().optional().default(3000),
});

export type GetRegionalAirportsArgs = z.infer<typeof getRegionalAirportsSchema>;

export const getRegionalAirportsTool: AgentTool<GetRegionalAirportsArgs, RegionalRankingResult> = {
  name: 'getRegionalAirports',
  schema: getRegionalAirportsSchema,
  declaration: {
    name: 'getRegionalAirports',
    description:
      'Identifies, scores, and ranks all candidate airports within a US geographic region for terminal expansion priority.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        region: {
          type: Type.STRING,
          description: 'US geographic region name (e.g., "New England", "Southern California", "Bay Area").',
        },
        longHaulThresholdMiles: {
          type: Type.NUMBER,
          description: 'Long-haul distance threshold in miles.',
        },
      },
      required: ['region'],
    },
  },
  execute: async (rawArgs) => {
    const validated = getRegionalAirportsSchema.parse(rawArgs);
    return await getRegionalAirports(validated.region, {
      longHaulThreshold: validated.longHaulThresholdMiles,
    });
  },
};
