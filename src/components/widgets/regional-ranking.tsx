'use client';

import React from 'react';
import { RegionalRankingResult } from '@/lib/core';
import { Compass } from 'lucide-react';

interface RegionalRankingWidgetProps {
  result: RegionalRankingResult;
}

export function RegionalRankingWidget({ result }: RegionalRankingWidgetProps) {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 my-3 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            {result.region} Modernization Leaderboard
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Regional average MPS:{' '}
            <span className="font-mono font-bold text-slate-200">{result.averageMps}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 text-xs font-semibold self-start sm:self-auto">
          Top Rank: {result.topCandidate.iataCode} ({result.topCandidate.mpsScore})
        </span>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2.5">
        {result.airports.map((airport, index) => (
          <div
            key={airport.iataCode}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-xs font-mono font-bold text-slate-400">
                #{index + 1}
              </span>
              <div>
                <span className="font-bold text-white text-sm mr-2">{airport.iataCode}</span>
                <span className="text-xs text-slate-400">{airport.airportName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right text-[11px] text-slate-400">
                <span>Delay: {airport.rawMetrics.flightDelayRatePct}%</span>
                <span className="mx-1.5">•</span>
                <span>Pax: {(airport.rawMetrics.annualPassengers / 1_000_000).toFixed(1)}M</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-blue-400">{airport.mpsScore}</span>
                <span className="text-[10px] text-slate-500 block">MPS</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
        {result.analysisSummary}
      </div>
    </div>
  );
}
