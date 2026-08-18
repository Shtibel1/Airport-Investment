import { NextResponse } from 'next/server';
import { ensureRegistryFresh } from '@/lib/core/registry-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Background / Cron endpoint to revalidate and persist the airport registry snapshot.
 * Can be triggered via scheduled Vercel Cron or manual maintenance calls.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const force = url.searchParams.get('force') !== 'false';

    const records = await ensureRegistryFresh(force);

    return NextResponse.json({
      status: 'ok',
      syncedCount: records.length,
      timestamp: new Date().toISOString(),
      sample: records.slice(0, 3).map((a) => ({
        iata: a.iata,
        name: a.name,
        delayRatePct: a.flightDelayRatePct,
        lastUpdated: a.lastUpdated,
      })),
    });
  } catch (error: unknown) {
    console.error('[API /api/cron/sync-registry Error]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Synchronization failed';
    return NextResponse.json(
      { status: 'error', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
