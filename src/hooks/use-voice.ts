'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface UseVoiceOptions {
  lang?: string;
  onTranscript?: (transcript: string) => void;
}

interface ISpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognitionInstance;

interface WindowWithSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export function useVoice(options: UseVoiceOptions = {}) {
  const { lang = 'en-US', onTranscript } = options;
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  /**
   * Starts or stops speech-to-text recognition
   */
  const toggleListening = useCallback(
    (onResultCallback?: (text: string) => void) => {
      if (typeof window === 'undefined') return;

      const win = window as unknown as WindowWithSpeech;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert(
          'Speech Recognition is not supported in your current browser. Please try Google Chrome or Microsoft Edge.'
        );
        return;
      }

      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = lang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: ISpeechRecognitionEvent) => {
          const transcript = event.results[0]?.[0]?.transcript || '';
          if (transcript) {
            if (onResultCallback) {
              onResultCallback(transcript);
            }
            if (onTranscript) {
              onTranscript(transcript);
            }
          }
        };

        recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
          console.warn('[useVoice] Speech Recognition Error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        console.error('[useVoice] Speech Recognition Start Error:', err);
        setIsListening(false);
      }
    },
    [isListening, lang, onTranscript]
  );

  /**
   * Reads out loud or stops reading a markdown text response
   */
  const toggleSpeak = useCallback(
    (messageId: string, markdownText: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        alert('Speech Synthesis is not supported in your current browser.');
        return;
      }

      if (speakingMessageId === messageId) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        return;
      }

      window.speechSynthesis.cancel();

      // Clean markdown tags and symbols for natural voice articulation
      const cleanText = markdownText
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[|─┌┐└┘├┤┬┴┼═║]/g, ' ')
        .replace(/\n+/g, '. ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = 1.05;

      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);

      setSpeakingMessageId(messageId);
      window.speechSynthesis.speak(utterance);
    },
    [speakingMessageId, lang]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  }, []);

  return {
    isListening,
    speakingMessageId,
    toggleListening,
    toggleSpeak,
    stopSpeaking,
  };
}
