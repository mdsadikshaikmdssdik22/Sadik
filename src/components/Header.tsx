import React from 'react';
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  History, 
  PlusCircle, 
  Wifi, 
  WifiOff, 
  Loader2,
  Info
} from 'lucide-react';
import { ConnectionStatus } from '../types';

interface HeaderProps {
  status: ConnectionStatus;
  isTestingConnection: boolean;
  onOpenSetupModal: () => void;
  onOpenHistory: () => void;
  onNewChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  isTestingConnection,
  onOpenSetupModal,
  onOpenHistory,
  onNewChat,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      {/* Android Top Accent Line */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 w-full" />

      <div className="max-w-2xl mx-auto px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* App Branding */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                {status.working ? (
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-slate-900">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  </span>
                ) : (
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 ring-2 ring-slate-900"></span>
                )}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-base tracking-tight truncate text-white">
                  నా తెలుగు AI
                </h1>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Android
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                My Telugu AI Assistant
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Connection Status Button */}
            <button
              onClick={onOpenSetupModal}
              title="AI కనెక్షన్ మరియు భద్రతా సమాచారం"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                status.working
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/50'
                  : 'bg-amber-950/40 text-amber-300 border-amber-700/60 hover:bg-amber-900/50'
              }`}
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span className="hidden sm:inline">ధృవీకరిస్తోంది...</span>
                </>
              ) : status.working ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">AI ఆన్‌లైన్</span>
                  <span className="sm:hidden text-[10px]">లైవ్</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">ఆఫ్‌లైన్ గైడ్</span>
                  <span className="sm:hidden text-[10px]">గైడ్</span>
                </>
              )}
            </button>

            {/* Safe AI Connect Guide Modal Trigger */}
            <button
              onClick={onOpenSetupModal}
              title="ఉచిత AI కనెక్ట్ గైడ్"
              aria-label="సురక్షిత AI సెటప్ గైడ్"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </button>

            {/* Chat History Drawer Trigger */}
            <button
              onClick={onOpenHistory}
              title="చాట్ హిస్టరీ"
              aria-label="చాట్ చరిత్ర"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition active:scale-95"
            >
              <History className="w-4 h-4 text-sky-400" />
            </button>

            {/* New Chat Button */}
            <button
              onClick={onNewChat}
              title="కొత్త చాట్ ప్రారంభించండి"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow transition active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">కొత్తది</span>
            </button>
          </div>
        </div>

        {/* Live Status Banner Alert if AI is not connected */}
        {!status.working && !isTestingConnection && (
          <div className="mt-2 py-1 px-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-[11px] text-amber-200">
            <div className="flex items-center gap-1.5 truncate">
              <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">
                {status.configured
                  ? 'API కీ ఉంది - కనెక్షన్‌ని ధృవీకరించడానికి టెస్ట్ చేయండి.'
                  : 'AI సర్వీస్ ఇంకా కనెక్ట్ కాలేదు. ప్రస్తుతం ఆఫ్‌లైన్ గైడ్ మోడ్‌లో ఉంది.'}
              </span>
            </div>
            <button
              onClick={onOpenSetupModal}
              className="ml-2 font-semibold underline text-amber-300 hover:text-white flex-shrink-0"
            >
              సెటప్ గైడ్
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
