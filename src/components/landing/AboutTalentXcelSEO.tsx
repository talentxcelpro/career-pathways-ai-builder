import React from 'react';
import { HelpCircle } from 'lucide-react';

export const AboutTalentXcelSEO = () => {
  const faqs = [
    {
      question: "What is TalentXcel?",
      answer: "TalentXcel is a global professional talent network for Tech and Leadership Professionals. Members can build a Career Passport, connect with professionals, discover jobs, join communities, share professional content and showcase verified skills through TalentScore. Recruiters and hiring teams can discover and connect with talent through Recruiter OS."
    },
    {
      question: "What is a TalentXcel Career Passport?",
      answer: "The Career Passport is your verified professional identity on TalentXcel, consolidating your work experience, skills, education, and professional achievements into one profile that can be discovered by hiring teams worldwide."
    },
    {
      question: "What is TalentScore?",
      answer: "TalentScore is a skill verification system that helps professionals showcase their capabilities and build trusted career credentials on the network."
    },
    {
      question: "Can professionals connect with each other?",
      answer: "Yes. TalentXcel is a professional social network where you can discover peers, exchange knowledge, share career content, and join communities."
    },
    {
      question: "Can recruiters search for professionals?",
      answer: "Yes. Recruiters and hiring teams can search, discover, and connect directly with professional talent through the Recruiter OS platform."
    },
    {
      question: "Can companies post jobs?",
      answer: "Yes, companies can build their professional presence, share opportunities, and connect with candidates directly."
    },
    {
      question: "Can I find jobs worldwide?",
      answer: "Absolutely. TalentXcel connects professionals with career opportunities and hiring teams globally."
    },
    {
      question: "What is Recruiter OS?",
      answer: "Recruiter OS is TalentXcel's dedicated platform for employers and hiring teams to discover candidates, match skills to opportunities, and manage hiring."
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-4">
            <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">About TalentXcel</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Everything you need to know about the Global Professional Talent Network.</p>
        </div>

        <div 
          className="space-y-8" 
          itemScope 
          itemType="https://schema.org/FAQPage"
        >
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 md:p-8"
              itemScope 
              itemProp="mainEntity" 
              itemType="https://schema.org/Question"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3" itemProp="name">
                {faq.question}
              </h3>
              <div 
                itemScope 
                itemProp="acceptedAnswer" 
                itemType="https://schema.org/Answer"
              >
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed" itemProp="text">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
