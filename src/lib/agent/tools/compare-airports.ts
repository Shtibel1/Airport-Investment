import { Type } from '@google/genai';
import { z } from 'zod';
import { AgentTool } from './types';
import { compareAirports } from '../../core/airport-service';
import { AirportComparisonResult } from '../../core/scoring/types';

export const CompareAirportsArgsSchema = z.object({
  airportCodes: z
    .array(z.string())
    .min(2, 'At least 2 airport codes are required for side-by-side comparison')
    .describe('List of 3-letter IATA codes to compare (e.g. ["LAX", "SNA"])'),
  forceRefresh: z.boolean().optional().describe('Force fresh OpenSky live telemetry call'),
  longHaulThreshold: z.number().optional().describe('Threshold in miles to classify long-haul flights (default: 3000)'),
});

export type CompareAirportsArgs = z.infer<typeof CompareAirportsArgsSchema>;

export const compareAirportsTool: AgentTool<CompareAirportsArgs, AirportComparisonResult> = {
  name: 'compareAirports',
  description:
    'Compares two or more airports side-by-side on congestion, demand growth, spillover risk, and Modernization Potential Score (MPS).',
  schema: CompareAirportsArgsSchema,
  declaration: {
    name: 'compareAirports',
    description:
      'Performs a side-by-side comparative analysis between two or more airports evaluating MPS, delays, and capacity bottlenecks.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        airportCodes: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: '3-letter IATA code (e.g. "LAX", "SNA")',
          },
          description: 'Array of at least 2 airport IATA codes to compare',
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
      required: ['airportCodes'],
    },
  },
  execute: async (args: CompareAirportsArgs) => {
    const validated = CompareAirportsArgsSchema.parse(args);
    return await compareAirports(validated.airportCodes, {
      forceRefresh: validated.forceRefresh,
      longHaulThreshold: validated.longHaulThreshold,
    });
  },
};
