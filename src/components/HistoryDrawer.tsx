import React from 'react';
import { 
  X, 
  Trash2, 
  Copy, 
  Download, 
  MessageSquare, 
  Clock, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ChatMessage } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onClearHistory: () => void;
  onNewChat: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onClearHistory,
  onNewChat,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyTranscript = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.role === 'user' ? 'వినియోగదారుడు (User)' : 'తెలుగు AI'}:\n${m.text}\n`
      )
      .join('\n----------------------------------------\n\n');

    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.role === 'user' ? 'వినియోగదారుడు (User)' : 'తెలుగు AI'}:\n${m.text}\n`
      )
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telugu_ai_chat_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const userMessages = messages.filter((m) => m.role === 'user');

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h2 className="font-bold text-sm text-white">ఈ సెషన్ చాట్ చరిత్ర</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="మూసివేయండి"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-3 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyTranscript}
            disabled={messages.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-200 transition active:scale-95 border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">కాపీ అయింది!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>కాపీ చేయండి</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadTranscript}
            disabled={messages.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-200 transition active:scale-95 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>డౌన్‌లోడ్</span>
          </button>
        </div>

        {/* Message List / History Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span>మొత్తం సందేశాలు: {messages.length}</span>
            <span>ప్రశ్నలు: {userMessages.length}</span>
          </div>

          {userMessages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-indigo-400" />
              <p className="text-xs">ఈ సెషన్‌లో ఇంకా సందేశాలు లేవు.</p>
              <p className="text-[11px] text-slate-500">
                మీ ప్రశ్నను టైప్ చేయడం ద్వారా చాట్ ప్రారంభించండి!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {userMessages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1 hover:border-indigo-500/40 transition"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-indigo-300">
                      ప్రశ్న #{index + 1}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="line-clamp-2 text-slate-200 font-medium">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Clear & Reset Options */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>కొత్త చాట్ ప్రారంభించండి</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('మీ ప్రస్తుత చాట్ చరిత్రను క్లియర్ చేయాలనుకుంటున్నారా?')) {
                onClearHistory();
                onClose();
              }
            }}
            disabled={messages.length === 0}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/70 hover:bg-rose-950/40 disabled:opacity-40 text-slate-300 hover:text-rose-300 border border-slate-700/60 font-medium text-xs transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>చాట్ చరిత్రను క్లియర్ చేయండి</span>
          </button>
        </div>
      </div>
    </div>
  );
};
