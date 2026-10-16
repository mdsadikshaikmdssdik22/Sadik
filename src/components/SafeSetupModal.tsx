import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  Lock, 
  Zap,
  HelpCircle
} from 'lucide-react';
import { ConnectionStatus } from '../types';

interface SafeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ConnectionStatus;
  onTestConnection: () => Promise<void>;
  isTesting: boolean;
}

export const SafeSetupModal: React.FC<SafeSetupModalProps> = ({
  isOpen,
  onClose,
  status,
  onTestConnection,
  isTesting,
}) => {
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setTestResult(null);
    try {
      await onTestConnection();
    } catch (e: any) {
      setTestResult(e?.message || 'పరీక్ష విఫలమైంది');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                ఉచిత AI మోడల్ సురక్షిత సెటప్
              </h2>
              <p className="text-xs text-slate-400">
                Safe Gemini Free-Tier Architecture Guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="మూసివేయండి"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs leading-relaxed">
          {/* Live Diagnostic Status Card */}
          <div className={`p-4 rounded-xl border ${
            status.working 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
              : status.configured
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    {status.working
                      ? '✅ AI కనెక్ట్ అయింది & యాక్టివ్‌గా ఉంది'
                      : status.configured
                      ? '⚠️ API కీ కనుగొనబడింది (పరీక్ష అవసరం)'
                      : '❌ AI కనెక్ట్ కాలేదు (ఆఫ్‌లైన్ గైడ్ మోడ్)'}
                  </span>
                </div>
                <p className="text-xs opacity-90">
                  {status.message || (status.working 
                    ? 'Gemini 3.8 Flash సర్వర్-సైడ్ ప్రాక్సీ ద్వారా సురక్షితంగా పని చేస్తోంది.' 
                    : 'ప్రస్తుతం యాప్ అంతర్నిర్మిత ఆఫ్‌లైన్ గైడ్ సమాధానాలను ఉపయోగిస్తోంది.')}
                </p>
                <div className="pt-1 text-[11px] font-mono opacity-80">
                  మోడల్: {status.model} | సెక్యూరిటీ: సర్వర్ ప్రాక్సీ (సురక్షితం)
                </div>
              </div>

              <button
                onClick={handleRunTest}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs whitespace-nowrap shadow transition active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'పరీక్షిస్తోంది...' : 'ఇప్పుడే పరీక్షించండి'}
              </button>
            </div>
          </div>

          {/* Section 1: Security Golden Rule */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>నియమం #1: ఫ్రంటెండ్‌లో ఎప్పుడూ API Key పెట్టకూడదు!</span>
            </div>
            <p className="text-slate-300">
              బ్రౌజర్ (React/HTML/JS) కోడ్‌లో API కీని నేరుగా రాస్తే, ఎవరైనా వెబ్‌సైట్ ఇన్‌స్పెక్ట్ చేసి లేదా నెట్‌వర్క్ రిక్వెస్ట్‌లను చూసి మీ కీని దొంగిలించగలరు.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-mono">
              <span className="text-rose-400 font-bold">❌ తప్పు విధానం:</span> Client browser → const ai = new GoogleGenAI(API_KEY)<br />
              <span className="text-emerald-400 font-bold">✔ సరైన విధానం:</span> Client browser → Secure Server (/api/chat) → Gemini API
            </div>
          </div>

          {/* Section 2: How this app protects keys */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-300 font-semibold text-sm">
              <Server className="w-4 h-4 text-sky-400" />
              <span>ఈ యాప్‌లో సర్వర్-సైడ్ భద్రత ఎలా పనిచేస్తుంది?</span>
            </div>
            <p className="text-slate-300">
              ఈ యాప్ పూర్తి-స్టాక్ (Full-Stack) Node/Express బ్యాకెండ్‌ని కలిగి ఉంది. మీ కీ ఎప్పటికీ సర్వర్‌లోనే భద్రంగా ఉంటుంది. క్లయింట్ ఫోన్ కేవలం <code className="text-indigo-300">/api/chat</code> ద్వారా మాత్రమే సర్వర్‌తో కమ్యూనికేట్ చేస్తుంది.
            </p>
          </div>

          {/* Section 3: Step-by-Step Setup */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>ఉచిత Gemini API కీ ని ఎలా జోడించాలి? (3 సులభమైన దశలు)</span>
            </div>

            <ol className="space-y-2.5 text-slate-300 list-decimal list-inside">
              <li className="pl-1">
                <strong className="text-white">Google AI Studio లో లాగిన్ అవ్వండి:</strong>{' '}
                <a 
                  href="https://aistudio.google.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline"
                >
                  aistudio.google.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                సందర్శించి మీ Gmail తో ఉచితంగా లాగిన్ అవ్వండి.
              </li>
              <li className="pl-1">
                <strong className="text-white">Get API Key క్లిక్ చేయండి:</strong>{' '}
                &ldquo;Create API Key&rdquo; ఎంచుకుని ఉచిత Gemini 3.8 Flash మోడల్ కీని కాపీ చేసుకోండి (క్రెడిట్ కార్డ్ అవసరం లేదు).
              </li>
              <li className="pl-1">
                <strong className="text-white">Secrets లో భద్రపరచండి:</strong>{' '}
                Google AI Studio ఇంటర్‌ఫేస్‌లోని <strong>Settings &gt; Secrets</strong> ప్యానెల్‌లో <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">GEMINI_API_KEY</code> అనే పేరుతో మీ కీని సేవ్ చేయండి.
              </li>
            </ol>
          </div>

          {/* Section 4: Testing & Honesty Policy */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-2 text-violet-300 font-semibold text-sm">
              <Zap className="w-4 h-4 text-violet-400" />
              <span>నిజాయితీ మరియు ధృవీకరణ పాలసీ</span>
            </div>
            <p className="text-slate-300">
              కనెక్షన్ నిజంగా పనిచేసేవరకు యాప్ &ldquo;AI కనెక్ట్ అయింది&rdquo; అని ప్రకటించదు. API కీ లేకపోయినా, ఈ యాప్‌లోని స్టడీ, రెజ్యూమ్, ఇంగ్లీష్ అనువాదం మరియు టైమ్‌టేబుల్ కోసం అంతర్నిర్మిత ఆఫ్‌లైన్ గైడ్లు ఎల్లప్పుడూ మీకు సహాయపడతాయి!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            భద్రతా గైడ్ • My Telugu AI Assistant
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition active:scale-95"
          >
            అర్థమైంది (మూసివేయండి)
          </button>
        </div>
      </div>
    </div>
  );
};
