import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CareerPlayer } from '@/services/careerverse/careerPlayerService';

interface AICoachProps {
  isOpen: boolean;
  player: CareerPlayer;
  onClose: () => void;
}

export const AICareerCompanionModal: React.FC<AICoachProps> = ({
  isOpen,
  player,
  onClose
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello ${player.display_name}! I am your TalentXcel Career Mentor. You are currently Level ${player.level} (${player.career_title}). How can I help you level up today? Would you like recommendations on daily quests, mock interview preparation, or skill tree mastery?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsThinking(true);

    setTimeout(() => {
      let reply = `Great initiative! To advance your Level ${player.level} journey in ${player.career_title}, I recommend focusing on the "Complete a React challenge" quest (+100 XP) and preparing for the Microsoft Boss Battle by practicing full-stack memoization techniques.`;
      if (userText.toLowerCase().includes('interview')) {
        reply = `For mock interview practice, remember that recruiters at Microsoft and partner firms look for system design clarity and clean asynchronous error handling. You can earn +150 XP by taking the verified technical mock test in the Quests panel.`;
      } else if (userText.toLowerCase().includes('skill')) {
        reply = `Looking at your skill tree, you've unlocked Frontend and React competencies. Progressing to "Full Stack" will boost your hiring score by 25% and unlock higher tier boss battles!`;
      }
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsThinking(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl h-[600px] bg-[#101E3B] border border-[#36D9F5]/30 rounded-2xl p-6 shadow-2xl text-white flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7047F5] to-[#36D9F5] p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#071329] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#36D9F5]" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-white">AI Career Companion</h3>
              <p className="text-xs text-[#36D9F5]">Context-Aware RPG Mentorship & Advice</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-4 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                m.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                  m.sender === 'user' ? 'bg-[#278DFF] text-white' : 'bg-[#7047F5] text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#278DFF] text-white rounded-tr-none'
                    : 'bg-[#071329] border border-white/10 text-slate-200 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#36D9F5]" />
              <span>Analyzing career progression...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 border-t border-white/5 pt-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about quests, skills, or interview tips..."
            className="flex-1 bg-[#071329] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#36D9F5]"
          />
          <Button
            onClick={handleSend}
            size="sm"
            className="bg-[#36D9F5] hover:bg-[#2bc4de] text-slate-950 font-bold px-4 h-9 rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
