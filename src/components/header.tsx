'use client';

import React from 'react';
import { Plane, Layers, Shield } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0b1329]/95 backdrop-blur-md px-4 sm:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Airport Investment Intelligence Agent
              <span className="text-[10px] px-2 py-0.5 font-mono uppercase bg-blue-950 text-blue-300 border border-blue-800/60 rounded">
                v2.5
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Deterministic Modernization Potential Scoring & Live Telemetry
            </p>
          </div>
        </div>

        {/* Telemetry Status Badges */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Model: Gemini 3.6 Flash</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>LRU Cache: Active</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Live API + BTS 5010</span>
          </div>
        </div>
      </div>
    </header>
  );
}
