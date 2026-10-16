import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  Sparkles,
  Info
} from 'lucide-react';
import { ChatMessage } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  onOpenSetupModal?: () => void;
  onRetry?: (text: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onOpenSetupModal,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Try finding Telugu or Indian English voice
    const voices = window.speechSynthesis.getVoices();
    const teluguVoice = voices.find(
      (v) => v.lang.includes('te') || v.lang.includes('te-IN')
    );
    const indianVoice = voices.find((v) => v.lang.includes('en-IN'));

    if (teluguVoice) {
      utterance.voice = teluguVoice;
      utterance.lang = 'te-IN';
    } else if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Helper to format basic markdown (bold, bullets, headings)
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Empty lines
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      // Main Headings (# or ## or ###)
      if (line.startsWith('#')) {
        const cleanHeading = line.replace(/^#+\s*/, '');
        return (
          <h3 key={idx} className="font-bold text-amber-300 text-sm mt-2 mb-1">
            {cleanHeading}
          </h3>
        );
      }

      // Bullet points
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet
        ? line.trim().replace(/^[•\-\*]\s*/, '')
        : line;

      // Parse bold segments **bold**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-amber-200">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-0.5 pl-1">
            <span className="text-amber-400 font-bold select-none">•</span>
            <span className="flex-1 leading-relaxed">{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="leading-relaxed my-0.5">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div
      className={`flex items-start gap-2.5 my-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } group`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white'
            : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-slate-900'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-slate-900" />
        )}
      </div>

      {/* Bubble Container */}
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-md text-xs sm:text-[13px] ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : message.error
            ? 'bg-rose-950/40 border border-rose-500/40 text-rose-100 rounded-tl-none'
            : 'bg-slate-800/95 border border-slate-700/60 text-slate-100 rounded-tl-none'
        }`}
      >
        {/* Offline Fallback Alert Pill */}
        {message.isOfflineFallback && !isUser && (
          <div className="mb-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Info className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
              <span className="truncate">ఆఫ్‌లైన్ గైడ్ సమాధానం (API Key అవసరం)</span>
            </div>
            {onOpenSetupModal && (
              <button
                onClick={onOpenSetupModal}
                className="underline font-semibold hover:text-white flex-shrink-0 text-[10px]"
              >
                సెటప్
              </button>
            )}
          </div>
        )}

        {/* Error Header */}
        {message.error && (
          <div className="mb-2 flex items-center gap-1.5 text-rose-400 font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>సేవ అందుబాటులో లేదు</span>
          </div>
        )}

        {/* Message Content */}
        <div className="space-y-1 overflow-x-auto break-words">
          {renderFormattedText(message.text)}
        </div>

        {/* Footer: Timestamp & Actions */}
        <div
          className={`mt-2.5 pt-1.5 border-t flex items-center justify-between gap-3 text-[10px] ${
            isUser ? 'border-indigo-500/40 text-indigo-200' : 'border-slate-700/50 text-slate-400'
          }`}
        >
          <span>{message.timestamp}</span>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              title="సందేశాన్ని కాపీ చేయండి"
              aria-label="కాపీ చేయండి"
              className="hover:text-white transition flex items-center gap-1 p-0.5 rounded active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">కాపీ చేయబడింది!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">కాపీ</span>
                </>
              )}
            </button>

            {/* Read Aloud Button */}
            {!isUser && (
              <button
                onClick={handleSpeak}
                title={isSpeaking ? 'ఆపండి' : 'వినండి'}
                aria-label="వాయిస్ రీడ్ అవుట్"
                className={`hover:text-white transition flex items-center gap-1 p-0.5 rounded active:scale-95 ${
                  isSpeaking ? 'text-amber-400 animate-pulse' : ''
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>ఆపండి</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">వినండి</span>
                  </>
                )}
              </button>
            )}

            {/* Retry Button if error */}
            {message.error && onRetry && (
              <button
                onClick={() => onRetry(message.text)}
                className="text-rose-300 hover:text-white underline font-semibold"
              >
                మళ్ళీ ప్రయత్నించండి
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
