'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from 'ai';
import { Plane, Sparkles, Volume2, VolumeX } from 'lucide-react';
import {
  MPSScoreCard,
  AirportComparisonTable,
  RegionalRankingWidget,
  ToolLoadingSpinner,
} from './widgets';

interface ChatMessageProps {
  message: Message;
  speakingMessageId: string | null;
  onToggleSpeak: (id: string, text: string) => void;
}

export function ChatMessageItem({
  message,
  speakingMessageId,
  onToggleSpeak,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSpeaking = speakingMessageId === message.id;

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 mt-1">
          <Plane className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none ml-auto'
            : 'bg-[#0f172a] border border-slate-800 rounded-bl-none text-slate-200 shadow-lg'
        }`}
      >
        {/* Tool Invocations */}
        {message.toolInvocations?.map((toolInvocation) => {
          const { toolName, toolCallId, state } = toolInvocation;

          if (state !== 'result') {
            return <ToolLoadingSpinner key={toolCallId} toolName={toolName} />;
          }

          const result = toolInvocation.result;
          if (!result) return null;

          if (toolName === 'compareAirports') {
            return <AirportComparisonTable key={toolCallId} result={result} />;
          }

          if (toolName === 'getRegionalAirports') {
            return <RegionalRankingWidget key={toolCallId} result={result} />;
          }

          if (
            toolName === 'getAirportMetrics' ||
            toolName === 'calculateInvestmentScore'
          ) {
            return <MPSScoreCard key={toolCallId} result={result} />;
          }

          return null;
        })}

        {/* Header / Readback Action for Assistant */}
        {!isUser && message.content && (
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800/60">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Executive Aviation Analysis
            </span>
            <button
              type="button"
              onClick={() => onToggleSpeak(message.id, message.content)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition"
              title={isSpeaking ? 'Stop audio' : 'Listen to analysis'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3 h-3 text-rose-400" />
                  <span className="text-rose-300">Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-blue-400" />
                  <span>Read Out</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Message Markdown Text */}
        {message.content && (
          <div className="prose prose-invert prose-sm max-w-none text-slate-200">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-base font-bold text-white mt-4 mb-2 border-b border-slate-700/60 pb-1"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-sm font-bold text-blue-200 mt-3.5 mb-1.5"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-xs font-bold uppercase tracking-wider text-slate-300 mt-3 mb-1"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-2 leading-relaxed text-slate-200" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 mb-2.5 space-y-1 text-slate-300" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-slate-300" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-relaxed" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-3 border-slate-700/60" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-white" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-3 rounded-lg border border-slate-700 bg-slate-900/90 shadow-inner">
                    <table className="w-full text-left text-xs border-collapse" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead
                    className="bg-slate-800/95 text-slate-200 border-b border-slate-700 font-semibold"
                    {...props}
                  />
                ),
                th: ({ node, ...props }) => (
                  <th
                    className="px-3 py-2 text-slate-100 font-semibold border-r border-slate-700/40 last:border-r-0"
                    {...props}
                  />
                ),
                td: ({ node, ...props }) => (
                  <td
                    className="px-3 py-2 border-t border-slate-800/80 border-r border-slate-800/40 last:border-r-0 text-slate-300"
                    {...props}
                  />
                ),
                code: ({ node, inline, ...props }: any) =>
                  inline ? (
                    <code
                      className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-blue-300 text-xs border border-slate-700/50"
                      {...props}
                    />
                  ) : (
                    <code
                      className="block p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto my-2 border border-slate-800"
                      {...props}
                    />
                  ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-2 border-blue-500 pl-3 italic my-2 text-slate-400"
                    {...props}
                  />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
