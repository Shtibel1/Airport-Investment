'use client';

import React from 'react';
import { ConfidenceLevel } from '@/lib/core';
import { ShieldCheck, Database, Zap, Clock } from 'lucide-react';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  score: number;
  isCacheHit?: boolean;
  timestamp?: string;
}

export function ConfidenceBadge({
  level,
  score,
  isCacheHit,
  timestamp,
}: ConfidenceBadgeProps) {
  const badgeStyles = {
    HIGH: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    MEDIUM: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    LOW: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold border ${badgeStyles[level]}`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Confidence: {level} ({(score * 100).toFixed(0)}%)
      </span>
      {isCacheHit ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
          <Database className="w-3 h-3 text-blue-400" />
          LRU Cache Hit
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50 text-[11px]">
          <Zap className="w-3 h-3 text-yellow-400" />
          Live Telemetry
        </span>
      )}
      {timestamp && (
        <span className="text-slate-500 text-[11px] flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3" />
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}
