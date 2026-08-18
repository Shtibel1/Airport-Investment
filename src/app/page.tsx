'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Plane } from 'lucide-react';
import { DashboardHeader } from '@/components/header';
import { SamplePromptsHero } from '@/components/sample-prompts';
import { ChatMessageItem } from '@/components/chat-message';
import { ChatInputBar } from '@/components/chat-input';
import { useVoice } from '@/hooks/use-voice';

export default function AirportIntelligenceDashboard() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, error } =
    useChat({
      maxSteps: 5,
      onError: (err) => {
        console.error('[Dashboard Client Error]:', err);
      },
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Encapsulated voice interaction (Speech-to-Text & Text-to-Speech)
  const {
    isListening,
    speakingMessageId,
    toggleListening,
    toggleSpeak,
  } = useVoice({
    onTranscript: (transcript) => {
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSelectPrompt = (query: string) => {
    setInput(query);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090e1a] text-slate-100">
      {/* Header with status badges */}
      <DashboardHeader />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6">
        {/* Scenario Quick Starters Hero (when no messages) */}
        {messages.length === 0 && (
          <SamplePromptsHero onSelectPrompt={handleSelectPrompt} />
        )}

        {/* Chat Feed */}
        {messages.length > 0 && (
          <div className="flex-1 space-y-6">
            {messages.map((m) => (
              <ChatMessageItem
                key={m.id}
                message={m}
                speakingMessageId={speakingMessageId}
                onToggleSpeak={toggleSpeak}
              />
            ))}

            {/* In-Progress Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                  <Plane className="w-4 h-4 animate-spin" />
                </div>
                <span>Analyzing aviation models & evaluating constraints...</span>
              </div>
            )}

            {/* Error Notice Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs">
                <p className="font-bold mb-1">Execution Notice:</p>
                <p>{error.message || 'An error occurred while streaming the analysis.'}</p>
                {error.message?.toLowerCase().includes('api key') && (
                  <p className="text-slate-400 mt-2">
                    Please ensure <code className="text-rose-300 font-mono">GOOGLE_GENERATIVE_AI_API_KEY</code> is configured in <code className="text-rose-300 font-mono">.env.local</code>.
                  </p>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Bottom Interactive Bar (Input, Voice & Action Chips) */}
      <ChatInputBar
        input={input}
        hasMessages={messages.length > 0}
        isLoading={isLoading}
        isListening={isListening}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onSelectPrompt={handleSelectPrompt}
        onToggleListening={() => toggleListening()}
      />
    </div>
  );
}
