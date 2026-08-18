import { Type } from '@google/genai';
import { z } from 'zod';
import { AgentTool } from './types';
import { getAirportMetrics } from '../../core/airport-service';
import { ModernizationScoreResult } from '../../core/scoring/types';

export const GetAirportMetricsArgsSchema = z.object({
  airportCode: z.string().describe('3-letter IATA code (e.g. LAX, SFO, ANC, BOS, SNA) or 4-letter ICAO code'),
  forceRefresh: z.boolean().optional().describe('Force fresh OpenSky live telemetry and bypass LRU cache'),
  longHaulThreshold: z.number().optional().describe('Threshold in miles to classify long-haul flights (default: 3000)'),
});

export type GetAirportMetricsArgs = z.infer<typeof GetAirportMetricsArgsSchema>;

export const getAirportMetricsTool: AgentTool<GetAirportMetricsArgs, ModernizationScoreResult> = {
  name: 'getAirportMetrics',
  description:
    'Retrieves telemetry, passenger capacity, congestion, and computes the deterministic Modernization Potential Score (MPS) and long-haul percentage for a given airport.',
  schema: GetAirportMetricsArgsSchema,
  declaration: {
    name: 'getAirportMetrics',
    description:
      'Calculates deterministic Modernization Potential Score (MPS), capacity bottlenecks, delay rates, and long-haul flight ratios for an airport.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        airportCode: {
          type: Type.STRING,
          description: '3-letter IATA code (e.g. LAX, SFO, ANC, BOS, SNA) or 4-letter ICAO code',
        },
        forceRefresh: {
          type: Type.BOOLEAN,
          description: 'Force fresh live telemetry call and bypass LRU cache',
        },
        longHaulThreshold: {
          type: Type.NUMBER,
          description: 'Threshold in statute miles to classify long-haul flights (default: 3000)',
        },
      },
      required: ['airportCode'],
    },
  },
  execute: async (args: GetAirportMetricsArgs) => {
    const validated = GetAirportMetricsArgsSchema.parse(args);
    return await getAirportMetrics(validated.airportCode, {
      forceRefresh: validated.forceRefresh,
      longHaulThreshold: validated.longHaulThreshold,
    });
  },
};
