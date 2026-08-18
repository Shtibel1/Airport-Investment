'use client';

import React from 'react';

interface ToolLoadingSpinnerProps {
  toolName: string;
}

export function ToolLoadingSpinner({ toolName }: ToolLoadingSpinnerProps) {
  const getLabel = (name: string) => {
    switch (name) {
      case 'getAirportMetrics':
      case 'calculateInvestmentScore':
        return 'Querying live FAA/OpenSky telemetry & computing MPS score...';
      case 'compareAirports':
        return 'Comparing multi-airport congestion & gate capacity telemetry...';
      case 'getRegionalAirports':
        return 'Aggregating regional airport telemetry & ranking MPS candidates...';
      default:
        return 'Running deterministic aviation analysis...';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3.5 my-2 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200 text-xs animate-pulse-subtle">
      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
      <span>{getLabel(toolName)}</span>
    </div>
  );
}
