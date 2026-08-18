import { describe, it, expect } from 'vitest';
import {
  AGENT_TOOLS,
  TOOL_DECLARATIONS,
  executeTool,
  GetAirportMetricsArgsSchema,
  CompareAirportsArgsSchema,
  GetRegionalAirportsArgsSchema,
} from './index';

describe('Modular Agent Tools Registry & Zod Schema Verification', () => {
  it('registers all required tools and declarations', () => {
    expect(AGENT_TOOLS.getAirportMetrics).toBeDefined();
    expect(AGENT_TOOLS.compareAirports).toBeDefined();
    expect(AGENT_TOOLS.getRegionalAirports).toBeDefined();
    expect(TOOL_DECLARATIONS.length).toBe(3);
  });

  it('validates GetAirportMetricsArgsSchema with Zod', () => {
    const valid = GetAirportMetricsArgsSchema.safeParse({ airportCode: 'LAX', forceRefresh: true });
    expect(valid.success).toBe(true);

    const invalid = GetAirportMetricsArgsSchema.safeParse({});
    expect(invalid.success).toBe(false);
  });

  it('validates CompareAirportsArgsSchema requiring at least 2 airports', () => {
    const valid = CompareAirportsArgsSchema.safeParse({ airportCodes: ['LAX', 'SNA'] });
    expect(valid.success).toBe(true);

    const invalid = CompareAirportsArgsSchema.safeParse({ airportCodes: ['LAX'] });
    expect(invalid.success).toBe(false);
  });

  it('validates GetRegionalAirportsArgsSchema', () => {
    const valid = GetRegionalAirportsArgsSchema.safeParse({ region: 'New England' });
    expect(valid.success).toBe(true);
  });

  it('executes getAirportMetrics tool successfully with valid arguments', async () => {
    const result = await executeTool('getAirportMetrics', { airportCode: 'SFO' });
    expect(result.iataCode).toBe('SFO');
    expect(result.mpsScore).toBeGreaterThan(0);
  });

  it('executes compareAirports tool successfully', async () => {
    const result = await executeTool('compareAirports', { airportCodes: ['LAX', 'SNA'] });
    expect(result.airports.length).toBe(2);
  });

  it('executes getRegionalAirports tool successfully', async () => {
    const result = await executeTool('getRegionalAirports', { region: 'New England' });
    expect(result.airports.length).toBe(6);
  });
});
