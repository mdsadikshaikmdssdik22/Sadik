import React, { useState } from 'react';
import { 
  GraduationCap, 
  Languages, 
  FileText, 
  CalendarCheck, 
  HelpCircle, 
  Briefcase,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import { QUICK_ACTIONS } from '../data/teluguData';
import { CategoryType, QuickActionItem } from '../types';

interface QuickActionBarProps {
  onSelectPrompt: (prompt: string, category: CategoryType) => void;
  disabled?: boolean;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<QuickActionItem | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'GraduationCap':
        return <GraduationCap className="w-3.5 h-3.5 text-amber-400" />;
      case 'Languages':
        return <Languages className="w-3.5 h-3.5 text-sky-400" />;
      case 'FileText':
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-3.5 h-3.5 text-purple-400" />;
      case 'HelpCircle':
        return <HelpCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'Briefcase':
        return <Briefcase className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="relative">
      {/* Horizontal Scrollable Quick Chips */}
      <div className="overflow-x-auto pb-1.5 scrollbar-none flex items-center gap-1.5 px-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            disabled={disabled}
            onClick={() => setActiveCategory(action)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 border border-slate-700/80 text-xs text-slate-200 transition shadow-sm"
          >
            {getIcon(action.iconName)}
            <span className="font-medium whitespace-nowrap">{action.titleTelugu}</span>
          </button>
        ))}
      </div>

      {/* Popup Prompt Selector Modal when a Quick Action is clicked */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 text-slate-100 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                  {getIcon(activeCategory.iconName)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {activeCategory.titleTelugu}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeCategory.subtitleTelugu}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCategory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt List */}
            <div className="py-3 space-y-2 overflow-y-auto">
              <p className="text-xs text-indigo-300 font-medium">
                ప్రశ్నను ఎంచుకోండి లేదా నేరుగా పంపండి:
              </p>
              {activeCategory.samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPrompt(prompt, activeCategory.id);
                    setActiveCategory(null);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-950/40 hover:border-indigo-500/50 border border-slate-700/60 text-xs text-slate-200 transition flex items-center justify-between gap-2 group active:scale-[0.98]"
                >
                  <span className="leading-snug">{prompt}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveCategory(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                రద్దు చేయండి
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
