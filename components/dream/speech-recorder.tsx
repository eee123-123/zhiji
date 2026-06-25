"use client";

import { useState, useRef, useCallback } from "react";

interface IWindow {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
}

interface SpeechRecorderProps {
  onTranscript: (text: string) => void;
}

export function SpeechRecorder({ onTranscript }: SpeechRecorderProps) {
  const [isSupported] = useState(() =>
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
  );
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const createRecognition = useCallback(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return null;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return recognition;
  }, [onTranscript]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const recognition = createRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
      }
    }
  }, [isRecording, createRecognition]);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
        isRecording
          ? "border-red-400 text-red-400 bg-red-400/10"
          : "border-white/20 text-gray-400 hover:border-zhiji-gold/50 hover:text-zhiji-gold"
      }`}
    >
      {/* 脉动动画 */}
      {isRecording && (
        <span className="absolute inset-0 rounded-full border border-red-400 animate-ping opacity-30" />
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
        <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
      </svg>
      <span className="text-sm">
        {isRecording ? "录音中..." : "语音输入"}
      </span>
    </button>
  );
}
