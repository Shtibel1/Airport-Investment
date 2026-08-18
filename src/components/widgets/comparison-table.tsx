'use client';

import React from 'react';
import { AirportComparisonResult } from '@/lib/core';
import { Building2, CheckCircle2 } from 'lucide-react';

interface AirportComparisonTableProps {
  result: AirportComparisonResult;
}

export function AirportComparisonTable({ result }: AirportComparisonTableProps) {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 my-3 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-4 h-4 text-blue-400" />
        <h3 className="font-bold text-white text-base">Airport Comparative Intelligence Matrix</h3>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[11px]">Highest MPS</span>
          <span className="font-mono font-bold text-emerald-400">
            {result.comparisonHighlights.highestMps}
          </span>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[11px]">Most Congested</span>
          <span className="font-mono font-bold text-blue-400">
            {result.comparisonHighlights.highestCongestion}
          </span>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[11px]">Highest Growth</span>
          <span className="font-mono font-bold text-teal-400">
            {result.comparisonHighlights.highestGrowth}
          </span>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[11px]">Peak Spill</span>
          <span className="font-mono font-bold text-amber-400">
            {result.comparisonHighlights.highestUnmetDemand}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-900/60">
              <th className="p-2.5">Airport</th>
              <th className="p-2.5 font-mono">MPS Score</th>
              <th className="p-2.5 font-mono">Annual Pax / Cap</th>
              <th className="p-2.5 font-mono">Delay Rate</th>
              <th className="p-2.5 font-mono">YoY Growth</th>
              <th className="p-2.5 font-mono">Slot Util</th>
              <th className="p-2.5">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {result.airports.map((airport) => (
              <tr key={airport.iataCode} className="hover:bg-slate-850/50 transition">
                <td className="p-2.5 font-semibold text-white">
                  {airport.iataCode}
                  <span className="block text-[10px] text-slate-400 font-normal">
                    {airport.airportName}
                  </span>
                </td>
                <td className="p-2.5 font-mono font-bold text-blue-400 text-sm">
                  {airport.mpsScore}
                </td>
                <td className="p-2.5 font-mono text-slate-300">
                  {(airport.rawMetrics.annualPassengers / 1_000_000).toFixed(1)}M /{' '}
                  {(airport.rawMetrics.designTerminalCapacity / 1_000_000).toFixed(1)}M
                </td>
                <td className="p-2.5 font-mono text-slate-300">
                  {airport.rawMetrics.flightDelayRatePct}%
                </td>
                <td className="p-2.5 font-mono text-slate-300">
                  +{airport.rawMetrics.yoyPassengerGrowthPct}%
                </td>
                <td className="p-2.5 font-mono text-slate-300">
                  {airport.rawMetrics.peakSlotUtilizationPct}%
                </td>
                <td className="p-2.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      airport.mpsScore >= 80
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : airport.mpsScore >= 65
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {airport.recommendationRating.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.differentialNotes && result.differentialNotes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1">
          {result.differentialNotes.map((note, idx) => (
            <p key={idx} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
