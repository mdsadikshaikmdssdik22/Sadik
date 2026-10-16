import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, Loader2 } from 'lucide-react';
import { CategoryType } from '../types';
import { QuickActionBar } from './QuickActionBar';

interface InputAreaProps {
  onSendMessage: (text: string, category?: CategoryType) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  isLoading,
}) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition for Telugu & English
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'te-IN'; // Telugu (India)

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      alert('మీ బ్రౌజర్‌లో వాయిస్ టైపింగ్ అందుబాటులో లేదు. దయచేసి Chrome లేదా Android బ్రౌజర్ ఉపయోగించండి.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;

    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-adjust height up to 120px
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleSelectPrompt = (prompt: string, category: CategoryType) => {
    onSendMessage(prompt, category);
  };

  return (
    <div className="sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pt-2 pb-3 px-3">
      <div className="max-w-2xl mx-auto space-y-2">
        {/* Quick Actions Scroll Bar */}
        <QuickActionBar
          onSelectPrompt={handleSelectPrompt}
          disabled={isLoading}
        />

        {/* Input & Action Buttons Bar */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-slate-800/90 rounded-2xl p-1.5 border border-slate-700/80 shadow-lg focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            disabled={isLoading}
            title={isListening ? 'వాయిస్ టైపింగ్ ఆపండి' : 'తెలుగులో మాట్లాడండి'}
            aria-label="వాయిస్ టైపింగ్"
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'వింటున్నాము... తెలుగులో మాట్లాడండి'
                : 'సందేశం ఇక్కడ టైప్ చేయండి... (లేదా మైక్ నొక్కండి)'
            }
            className="flex-1 bg-transparent border-0 outline-none resize-none text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm py-2 px-1 max-h-[120px] min-h-[38px] leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            title="సందేశం పంపండి"
            aria-label="పంపండి"
            className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md flex-shrink-0 transition active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span className="font-semibold hidden xs:inline">పంపండి</span>
              </>
            )}
          </button>
        </form>

        {/* Listening Notification */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 text-xs text-rose-400 py-0.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>తెలుగు వాయిస్ యాక్టివ్‌గా ఉంది... మాట్లాడుతున్నారు</span>
          </div>
        )}
      </div>
    </div>
  );
};
