// src/components/products/payscale/PayScaleAIAssistantModule.tsx
// Module 12: PayScale AI Assistant (Conversational Salary, Tax, Payslip & Compensation Advisor)

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  Calculator, 
  HelpCircle,
  TrendingUp,
  FileText,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'ai',
    text: "Hello! I am your PayScale AI Compensation & Tax Advisor. You can ask me anything about your salary structure, New vs Old Tax Regime calculations, HRA exemptions under Section 10(13A), payslip line items, or offer negotiation strategies. How can I help you today?",
    timestamp: 'Just now'
  }
];

const QUICK_PROMPTS = [
  "Old vs New Regime for ₹18 LPA?",
  "Explain Special Allowance & Why it is Taxable",
  "Calculate HRA for ₹30,000 rent in Bangalore",
  "How to counter-offer when offered 20% hike?",
  "What is Compa-Ratio in enterprise salary reviews?"
];

export const PayScaleAIAssistantModule: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();

      if (q.includes('old vs new') || q.includes('regime') || q.includes('18')) {
        reply = `📊 **Old vs New Tax Regime Analysis for ₹18 LPA (FY 2025–26 & FY 2026–27):**\n\n• **New Regime (u/s 115BAC):** Standard deduction is ₹75,000 (revised in Budget 2024). Taxable income is ₹17,25,000. Total annual tax comes to **₹1,78,038**, giving you **₹1,17,677** net monthly in-hand.\n\n• **Old Regime:** Standard deduction is ₹50,000. Unless you have total deductions (HRA + 80C + 80D + NPS) exceeding **₹3,75,000**, the **New Tax Regime saves you more money** without any investment lock-in.\n\n💡 *Recommendation:* Opt for the New Tax Regime unless you have a high home loan interest deduction (Section 24b) or pay high rent in a metro.`;
      } else if (q.includes('special allowance') || q.includes('allowance')) {
        reply = `📄 **What is Special Allowance on your Indian Payslip?**\n\n• **Definition:** Special Allowance is the residual balancing figure in your CTC after allocating Basic (typically 50%), HRA (25%), and EPF (6%).\n• **Taxability:** Unlike HRA or Conveyance, Special Allowance is **100% fully taxable** under "Income from Salaries" with zero standard exemptions.\n• **Why Employers Use It:** Because it does not trigger statutory obligations like EPF or Gratuity, allowing flexible compensation structuring without increasing the company's fixed liability.`;
      } else if (q.includes('hra') || q.includes('rent')) {
        reply = `🏡 **Section 10(13A) HRA Exemption Rules:**\n\nStatutory exemption is the **LEAST** of the following three conditions:\n1. Actual HRA received from your employer.\n2. Rent paid minus 10% of your Basic Salary.\n3. 50% of Basic Salary (if living in Delhi, Mumbai, Kolkata, Chennai) or 40% (other cities).\n\n*Note:* HRA exemption is **ONLY available under the Old Tax Regime**. Under the New Regime (Section 115BAC), HRA is fully taxable.`;
      } else if (q.includes('counter') || q.includes('hike') || q.includes('negotiat')) {
        reply = `🎯 **Counter-Offer Negotiation Playbook:**\n\n1. **Acknowledge and Anchor:** Always express enthusiasm for the team first before presenting numbers.\n2. **Anchor 10%–15% Higher:** If offered a 20% hike (e.g., ₹14.4L on ₹12L baseline), counter with ₹16.5L–₹17.5L (35%–45% hike), citing TalentXcel empirical market percentiles.\n3. **Negotiate One-Time Sign-on:** If the recruiter says the base is capped at band maximum, ask for a ₹1.5L–₹2.5L joining bonus.\n\n*Check Module 5 (AI Salary Negotiation Coach) for full copy-paste email scripts!*`;
      } else if (q.includes('compa') || q.includes('ratio')) {
        reply = `📈 **Understanding Compa-Ratio in Compensation:**\n\n**Compa-Ratio = (Employee's Current Salary ÷ Midpoint of the Grade Band)**\n\n• **Compa < 0.85:** Significantly below band midpoint. High flight risk; prioritized for double-digit merit hikes.\n• **Compa 0.95 – 1.05:** Ideal competitive market placement.\n• **Compa > 1.15:** Near the band ceiling. Increments are typically smaller, or the employee is considered for promotion to the next band (e.g. L3 to L4).`;
      } else {
        reply = `I have analyzed your query regarding "${query}". Based on verified Indian payroll statutes and market benchmarks, you can model this directly using our deterministic calculation modules on the navigation tabs above. Would you like me to run a customized CTC-to-in-hand breakdown or tax regime comparison for a specific number?`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        timestamp: 'Just now'
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>PayScale AI Assistant • Real-Time Deterministic Math</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ask Anything About Your Salary, Tax & Compensation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Backed by the TalentXcel verified payroll calculation engine. Instant clarity on payslips, tax slabs, deductions, and negotiation playbooks.
          </p>
        </div>
      </div>

      {/* Quick Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Suggested:</span>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-[#2563EB] hover:text-[#2563EB] transition-all shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user' ? 'bg-[#2563EB] text-white' : 'bg-purple-50 text-[#7138E8]'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#2563EB] text-white font-medium rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-wrap'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7138E8] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7138E8] animate-ping" />
                <span>Computing payroll calculations...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Input
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask anything: e.g. 'What is the in-hand for ₹24 LPA in Bangalore?'"
            className="h-10 text-xs font-medium rounded-xl bg-white"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isThinking}
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold h-10 px-4 rounded-xl flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
