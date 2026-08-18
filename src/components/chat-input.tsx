'use client';

import React from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { SAMPLE_PROMPTS } from './sample-prompts';

interface ChatInputBarProps {
  input: string;
  hasMessages: boolean;
  isLoading: boolean;
  isListening: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSelectPrompt: (query: string) => void;
  onToggleListening: () => void;
}

export function ChatInputBar({
  input,
  hasMessages,
  isLoading,
  isListening,
  onInputChange,
  onSubmit,
  onSelectPrompt,
  onToggleListening,
}: ChatInputBarProps) {
  return (
    <footer className="sticky bottom-0 z-30 border-t border-slate-800 bg-[#0b1329]/95 backdrop-blur-md p-4">
      <div className="max-w-4xl mx-auto">
        {/* Quick chip bar if chat has messages */}
        {hasMessages && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-1 scrollbar-none">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt(sample.query)}
                className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 whitespace-nowrap transition flex items-center gap-1.5"
              >
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={onInputChange}
              placeholder={
                isListening
                  ? 'Listening to voice prompt...'
                  : "Ask an airport investment question (e.g. 'Compare LAX and SNA congestion', 'New England candidates')..."
              }
              className={`w-full bg-[#0f172a] border rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                isListening
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-slate-700 focus:border-blue-500'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={onToggleListening}
              className={`absolute right-2.5 p-2 rounded-lg transition ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isListening ? 'Stop listening' : 'Voice Input (Dictate prompt)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-sm transition flex items-center gap-2 shrink-0 shadow-md"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Analyze</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
          <span>MPS = (0.45 × Congestion) + (0.35 × Demand Growth) + (0.20 × Spill)</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Mic className="w-3 h-3 text-blue-400" /> Voice & Readback Supported
          </span>
        </div>
      </div>
    </footer>
  );
}
