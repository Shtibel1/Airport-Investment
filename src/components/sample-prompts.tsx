'use client';

import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

export interface SamplePrompt {
  title: string;
  query: string;
  badge: string;
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    title: 'New England Candidates',
    query: 'Which airports in New England are strong candidates for terminal expansion?',
    badge: 'Regional Ranking',
  },
  {
    title: 'LAX vs SNA Congestion',
    query: 'Compare LA and Santa Ana airport congestion levels.',
    badge: 'Comparison',
  },
  {
    title: 'Anchorage Long-Haul %',
    query: 'What is the percentage of long haul flights out of Anchorage airport?',
    badge: 'Long-Haul Radar',
  },
  {
    title: 'SFO Unmet Demand',
    query: 'What is the unmet flight demand in SFO airport and why?',
    badge: 'Spill & Capacity',
  },
];

interface SamplePromptsHeroProps {
  onSelectPrompt: (query: string) => void;
}

export function SamplePromptsHero({ onSelectPrompt }: SamplePromptsHeroProps) {
  return (
    <div className="my-auto py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Infrastructure & Modernization Intelligence
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Evaluate Airport Expansion & Congestion ROI
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Execute mathematical scoring formulas, query live flight routes, assess terminal capacity
          bottlenecks, and identify high-ROI modernization opportunities.
        </p>
      </div>

      {/* Quick Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(sample.query)}
            className="text-left p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850/60 transition group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  {sample.badge}
                </span>
                <Zap className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white">
                "{sample.query}"
              </p>
            </div>
            <span className="text-[11px] text-slate-500 mt-3 block">
              Click to load prompt →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
