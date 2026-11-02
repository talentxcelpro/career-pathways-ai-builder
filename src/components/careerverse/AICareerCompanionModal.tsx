import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, ArrowRight, Zap, Target } from 'lucide-react';
import { CareerPlayer } from '@/services/careerverse/careerPlayerService';

interface AICareerCompanionModalProps {
  player: CareerPlayer | null;
  onClose: () => void;
  onSelectQuestRecommendation?: (questName: string) => void;
}

export const AICareerCompanionModal: React.FC<AICareerCompanionModalProps> = ({
  player,
  onClose,
  onSelectQuestRecommendation,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: `Greetings, ${player?.name || 'Explorer'}! I am your TalentXcel Career Companion. You are currently Level ${player?.level || 12} with a strong 82 JavaScript rating. Would you like me to recommend a high-XP quest to help you reach Level 13, or prepare you for the Microsoft Boss Battle?`,
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputVal('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Based on current employer hiring pipelines, completing the "React challenge" and tackling Stage 2 of the Microsoft Boss Battle provides the highest conversion probability to interview fast-tracks!`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#101E3B] border border-[#36D9F5]/40 shadow-2xl p-6 text-white space-y-4 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7047F5] to-[#36D9F5] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(54,217,245,0.4)]">
              <div className="w-full h-full bg-[#101E3B] rounded-[10px] flex items-center justify-center text-[#36D9F5]">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-lg text-white">AI Career Companion</h3>
                <span className="text-[10px] bg-[#20D994]/20 text-[#20D994] font-bold px-2 py-0.5 rounded-full">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400">Intelligent strategic co-pilot for your career RPG journey.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#071329] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#071329]/70 rounded-xl border border-white/5 max-h-64 min-h-48">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#7047F5] text-white rounded-br-none'
                    : 'bg-[#101E3B] border border-white/10 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
          <button
            onClick={() => onSelectQuestRecommendation?.('React Challenge')}
            className="px-3 py-1.5 rounded-full bg-[#101E3B] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1 shrink-0"
          >
            <Target className="w-3 h-3 text-[#36D9F5]" />
            <span>Recommended Quests</span>
          </button>

          <button
            onClick={() => setInputVal('How can I prepare for the Microsoft Boss Battle?')}
            className="px-3 py-1.5 rounded-full bg-[#101E3B] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1 shrink-0"
          >
            <Zap className="w-3 h-3 text-[#FFCA55]" />
            <span>Boss Battle Tips</span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about skills, salary benchmarks, or quests..."
            className="flex-1 bg-[#071329] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#36D9F5] transition-all"
          />

          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#7047F5] to-[#36D9F5] flex items-center justify-center text-white shadow-[0_0_12px_rgba(112,71,245,0.4)] hover:scale-105 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
