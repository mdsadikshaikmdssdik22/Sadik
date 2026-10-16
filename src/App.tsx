import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  GraduationCap, 
  Languages, 
  FileText, 
  CalendarCheck, 
  ShieldCheck, 
  ArrowDown, 
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { ChatMessage, ConnectionStatus, CategoryType } from './types';
import { Header } from './components/Header';
import { MessageItem } from './components/MessageItem';
import { InputArea } from './components/InputArea';
import { SafeSetupModal } from './components/SafeSetupModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { fetchAiStatus, sendChatMessage } from './services/api';
import { DEFAULT_WELCOME_MESSAGE, OFFLINE_KNOWLEDGE_BASE, QUICK_ACTIONS } from './data/teluguData';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        text: DEFAULT_WELCOME_MESSAGE,
        timestamp: new Intl.DateTimeFormat('te-IN', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }).format(new Date()),
      },
    ];
  });

  const [status, setStatus] = useState<ConnectionStatus>({
    configured: false,
    tested: false,
    working: false,
    model: 'gemini-3.8-flash',
    message: 'కనెక్షన్ తనిఖీ చేస్తోంది...',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check initial AI status on startup (strictly reports real status without claiming AI works if untested)
  useEffect(() => {
    const initStatus = async () => {
      const result = await fetchAiStatus(false);
      setStatus(result);
    };
    initStatus();
  }, []);

  // Handle auto-scroll
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
  };

  // Test live connection to Gemini
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setErrorToast(null);
    try {
      const res = await fetchAiStatus(true);
      setStatus(res);
      if (res.working) {
        setErrorToast('ధృవీకరణ పూర్తయింది: Gemini 3.8 Flash విజయవంతంగా కనెక్ట్ అయింది! 🚀');
      } else {
        setErrorToast(res.message || 'కనెక్షన్ విఫలమైంది. API కీని తనిఖీ చేయండి.');
      }
    } catch (err: any) {
      setErrorToast('నెట్‌వర్క్ లోపం: కనెక్షన్ టెస్ట్ చేయలేకపోయాము.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const formatCurrentTime = () => {
    return new Intl.DateTimeFormat('te-IN', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date());
  };

  // Send message flow
  const handleSendMessage = async (text: string, category: CategoryType = 'general') => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: formatCurrentTime(),
      category,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setErrorToast(null);

    // If AI is configured, make real server API call
    if (status.configured) {
      try {
        const historyPayload = messages
          .slice(-6)
          .map((m) => ({ role: m.role, text: m.text }));

        const response = await sendChatMessage(text.trim(), historyPayload, category);

        if (response.success && response.reply) {
          // If response succeeded, we also know it works
          if (!status.working) {
            setStatus((prev) => ({ ...prev, working: true, tested: true }));
          }

          const assistantMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: response.reply,
            timestamp: formatCurrentTime(),
            category,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          // AI call failed - Provide fallback and helpful error
          const fallbackText = getOfflineFallback(text, category);
          const assistantMessage: ChatMessage = {
            id: `ai-err-${Date.now()}`,
            role: 'assistant',
            text: `${fallbackText}\n\n*(గమనిక: ${response.message || 'AI సర్వీస్ అందుబాటులో లేదు.'})*`,
            timestamp: formatCurrentTime(),
            category,
            isOfflineFallback: true,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setErrorToast(response.message || 'AI సర్వీస్ లోపం ఎదురైంది.');
        }
      } catch (err: any) {
        const fallbackText = getOfflineFallback(text, category);
        const assistantMessage: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          text: fallbackText,
          timestamp: formatCurrentTime(),
          category,
          isOfflineFallback: true,
          error: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // AI is not configured - provide offline helpful curated Telugu knowledge
      // Be strictly honest: do not claim it is from live AI
      setTimeout(() => {
        const fallbackText = getOfflineFallback(text, category);
        const assistantMessage: ChatMessage = {
          id: `ai-offline-${Date.now()}`,
          role: 'assistant',
          text: fallbackText,
          timestamp: formatCurrentTime(),
          category,
          isOfflineFallback: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 500);
    }
  };

  // Helper to retrieve structured offline knowledge by keywords or category
  const getOfflineFallback = (text: string, category: CategoryType): string => {
    const lower = text.toLowerCase();

    if (category !== 'general' && OFFLINE_KNOWLEDGE_BASE[category]) {
      return OFFLINE_KNOWLEDGE_BASE[category];
    }

    if (lower.includes('resume') || lower.includes('రెజ్యూమ్') || lower.includes('బయోడేటా')) {
      return OFFLINE_KNOWLEDGE_BASE['resume'];
    }
    if (lower.includes('translate') || lower.includes('అనువాదం') || lower.includes('english') || lower.includes('ఇంగ్లీష్')) {
      return OFFLINE_KNOWLEDGE_BASE['translation'];
    }
    if (lower.includes('study') || lower.includes('చదువు') || lower.includes('గణితం') || lower.includes('సైన్స్')) {
      return OFFLINE_KNOWLEDGE_BASE['study'];
    }
    if (lower.includes('plan') || lower.includes('టైమ్') || lower.includes('timetable') || lower.includes('రోజువారీ')) {
      return OFFLINE_KNOWLEDGE_BASE['daily_plan'];
    }
    if (lower.includes('exam') || lower.includes('పరీక్ష') || lower.includes('మార్కులు')) {
      return OFFLINE_KNOWLEDGE_BASE['exam_prep'];
    }
    if (lower.includes('job') || lower.includes('ఉద్యోగం') || lower.includes('ఇంటర్వ్యూ') || lower.includes('cover letter')) {
      return OFFLINE_KNOWLEDGE_BASE['job_application'];
    }

    return `మీ ప్రశ్నకు ధన్యవాదాలు! 🙏

ప్రస్తుతం AI లైవ్ మోడల్ (Gemini 3.8 Flash) ఇంకా కనెక్ట్ చేయబడలేదు. అందువల్ల నేను ఆఫ్‌లైన్ గైడ్ మోడ్‌లో ఉన్నాను.

మీరు క్రింది విభాగాలలో దేని గురించైనా తెలుసుకోవాలనుకుంటున్నారా?
• **📚 చదువులో సహాయం:** గణితం, సైన్స్ సూత్రాలు మరియు వివరణలు
• **🌐 ఇంగ్లీష్ అనువాదం:** తెలుగు నుండి ఇంగ్లీష్ వాక్యాల తర్జుమా
• **📄 రెజ్యూమ్ సాయం:** ప్రొఫెషనల్ రెజ్యూమ్ ఫార్మాట్ & స్కిల్స్
• **📅 రోజువారీ పనులు:** సమయ పట్టిక (Timetable) & ఉత్పాదకత
• **📝 పరీక్ష సమాధానాలు:** పరీక్షలలో అధిక మార్కులు సాధించే పద్ధతి
• **💼 ఉద్యోగ దరఖాస్తు:** కవర్ లెటర్ & ఇంటర్వ్యూ ప్రిపరేషన్

💡 *లైవ్ AI సమాధానాలను అన్‌లాక్ చేయడానికి పైన ఉన్న 'ఆఫ్‌లైన్ గైడ్' లేదా 'షీల్డ్' బటన్ నొక్కి ఉచిత Gemini API కీ ని కనెక్ట్ చేయండి.*`;
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: DEFAULT_WELCOME_MESSAGE,
        timestamp: formatCurrentTime(),
      },
    ]);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Mobile Top Header */}
      <Header
        status={status}
        isTestingConnection={isTestingConnection}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Scroll Container */}
      <main
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4 max-w-2xl mx-auto w-full relative"
      >
        {/* Welcome Hero Card for Mobile Users */}
        {messages.length <= 1 && (
          <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-900/50 shadow-xl space-y-3 my-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  ఆండ్రాయిడ్ తెలుగు AI అసిస్టెంట్
                </h2>
                <p className="text-[11px] text-indigo-300">
                  మీ రోజువారీ చదువు, ఉద్యోగం & అనువాదాల వ్యక్తిగత తోడు
                </p>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <button
                onClick={() => handleSendMessage('గణితంలో త్రికోణమితి సూత్రాలను సులభంగా ఎలా గుర్తుంచుకోవాలి?', 'study')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition active:scale-95 flex items-start gap-2"
              >
                <GraduationCap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-slate-200">చదువు & సైన్స్</span>
                  <span className="text-[10px] text-slate-400">గణితం, సైన్స్ వివరణలు</span>
                </div>
              </button>

              <button
                onClick={() => handleSendMessage('ఈ తెలుగు వాక్యాన్ని ప్రొఫెషనల్ ఇంగ్లీష్‌లోకి అనువదించండి: "నేను రేపు సెలవు కావాలని మేనేజర్‌కి మెయిల్ పెట్టాలి."', 'translation')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition active:scale-95 flex items-start gap-2"
              >
                <Languages className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-slate-200">ఇంగ్లీష్ అనువాదం</span>
                  <span className="text-[10px] text-slate-400">తెలుగు ⇄ ఆంగ్లం</span>
                </div>
              </button>

              <button
                onClick={() => handleSendMessage('ఫ్రెషర్ సాఫ్ట్‌వేర్ ఇంజనీర్ కోసం రెజ్యూమ్ సమ్మరీ మరియు స్కిల్స్ ఫార్మాట్ తయారు చేయండి.', 'resume')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition active:scale-95 flex items-start gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-slate-200">రెజ్యూమ్ సాయం</span>
                  <span className="text-[10px] text-slate-400">ప్రొఫెషనల్ బయోడేటా</span>
                </div>
              </button>

              <button
                onClick={() => handleSendMessage('ఉదయం నుండి రాత్రి వరకు నా చదువు కోసం ఒక సమతుల్య టైమ్‌టేబుల్ రూపొందించండి.', 'daily_plan')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition active:scale-95 flex items-start gap-2"
              >
                <CalendarCheck className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-slate-200">రోజువారీ పనులు</span>
                  <span className="text-[10px] text-slate-400">టైమ్‌టేబుల్ ప్లానింగ్</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Message Log */}
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            onOpenSetupModal={() => setIsSetupModalOpen(true)}
            onRetry={(text) => handleSendMessage(text)}
          />
        ))}

        {/* AI Thinking Animation */}
        {isLoading && (
          <div className="flex items-start gap-2.5 my-3 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot className="w-4 h-4 text-slate-900 animate-spin" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 shadow-md">
              <div className="flex items-center gap-2 text-xs text-amber-300">
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                </span>
                <span className="font-medium">తెలుగు AI సమాధానం రూపొందిస్తోంది...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </main>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-24 right-4 z-20 p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl transition active:scale-95"
          aria-label="క్రిందికి స్క్రోల్ చేయండి"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Floating Error / Notification Toast */}
      {errorToast && (
        <div className="fixed bottom-24 left-4 right-4 z-40 max-w-md mx-auto p-3 rounded-xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl flex items-center justify-between text-xs text-slate-200 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button
            onClick={() => setErrorToast(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bottom Message Input Area */}
      <InputArea
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />

      {/* Safe AI Connect Guide Modal */}
      <SafeSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        status={status}
        onTestConnection={handleTestConnection}
        isTesting={isTestingConnection}
      />

      {/* Chat History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        messages={messages}
        onClearHistory={handleClearHistory}
        onNewChat={handleNewChat}
      />
    </div>
  );
}
