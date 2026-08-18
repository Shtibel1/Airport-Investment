'use client';

import React from 'react';
import { ModernizationScoreResult } from '@/lib/core';
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import { ConfidenceBadge } from './confidence-badge';

interface MPSScoreCardProps {
  result: ModernizationScoreResult;
}

export function MPSScoreCard({ result }: MPSScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30';
    if (score >= 65) return 'text-blue-400 border-blue-500/30 bg-blue-950/30';
    if (score >= 45) return 'text-amber-400 border-amber-500/30 bg-amber-950/30';
    return 'text-slate-400 border-slate-700 bg-slate-900/50';
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'HIGH_PRIORITY_EXPANSION':
        return {
          label: 'High-Priority Expansion Candidate',
          color: 'text-emerald-300 bg-emerald-950/80 border-emerald-600/50',
        };
      case 'MODERATE_EXPANSION_CANDIDATE':
        return {
          label: 'Moderate Expansion Opportunity',
          color: 'text-blue-300 bg-blue-950/80 border-blue-600/50',
        };
      case 'OPTIMIZATION_ONLY':
        return {
          label: 'Gate / Runway Optimization Only',
          color: 'text-amber-300 bg-amber-950/80 border-amber-600/50',
        };
      default:
        return {
          label: 'Adequate Current Capacity',
          color: 'text-slate-300 bg-slate-800 border-slate-700',
        };
    }
  };

  const ratingInfo = getRatingLabel(result.recommendationRating);

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 my-3 shadow-lg hover:border-slate-700 transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {result.airportName}
            </h3>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded">
              {result.iataCode} / {result.icaoCode}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {result.city}
            {result.region ? ` • ${result.region}` : ''}
          </p>
        </div>

        {/* Big MPS Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg border ${getScoreColor(
              result.mpsScore
            )}`}
          >
            <span className="text-2xl font-black font-mono tracking-tight">
              {result.mpsScore}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              MPS Score
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation Pill */}
      <div className="mt-3.5 mb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${ratingInfo.color}`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          {ratingInfo.label}
        </span>
      </div>

      {/* Component Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Capacity Congestion */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Congestion (45%)
            </span>
            <span className="font-mono font-bold text-white">
              {result.breakdown.capacityCongestionScore}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${result.breakdown.capacityCongestionScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Pax: {(result.rawMetrics.annualPassengers / 1_000_000).toFixed(1)}M</span>
            <span>Delay: {result.rawMetrics.flightDelayRatePct}%</span>
          </div>
        </div>

        {/* Demand Growth */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Demand Growth (35%)
            </span>
            <span className="font-mono font-bold text-white">
              {result.breakdown.demandGrowthScore}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${result.breakdown.demandGrowthScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>YoY: +{result.rawMetrics.yoyPassengerGrowthPct}%</span>
            <span>Load: {result.rawMetrics.loadFactorPct}%</span>
          </div>
        </div>

        {/* Unmet Demand / Spill */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Spill / Spillover (20%)
            </span>
            <span className="font-mono font-bold text-white">
              {result.breakdown.unmetDemandSpillScore}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${result.breakdown.unmetDemandSpillScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Slot Util: {result.rawMetrics.peakSlotUtilizationPct}%</span>
            <span>Spill: {result.breakdown.spillPressureRatio}x</span>
          </div>
        </div>
      </div>

      {/* Long-Haul Breakdown */}
      {result.longHaulStats && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Long-Haul Routes (≥ {result.longHaulStats.thresholdMiles.toLocaleString()} miles)
            </span>
            <span className="font-mono font-bold text-indigo-300">
              {result.longHaulStats.longHaulPercentage}% ({result.longHaulStats.longHaulFlightCount} of{' '}
              {result.longHaulStats.totalOutboundFlights} sample flights)
            </span>
          </div>
        </div>
      )}

      {/* Confidence & Scoping Footer */}
      <div className="border-t border-slate-800/80 pt-3">
        <ConfidenceBadge
          level={result.confidenceLevel}
          score={result.confidenceScore}
          isCacheHit={result.telemetryOrigin.isCacheHit}
          timestamp={result.telemetryOrigin.timestamp}
        />
        {result.confidenceReasons && result.confidenceReasons.length > 0 && (
          <p className="text-[11px] text-slate-400 mt-2 italic">
            Telemetry basis: {result.confidenceReasons.join(' • ')}
          </p>
        )}
      </div>
    </div>
  );
}
