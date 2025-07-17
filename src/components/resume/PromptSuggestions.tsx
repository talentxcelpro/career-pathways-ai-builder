import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ 
  onSelectPrompt, 
  disabled = false 
}) => {
  const suggestions = [
    {
      title: "Complete Professional CV",
      prompt: "Create a complete, professional, and ATS-optimized CV for a Data Analyst with 3 years of experience in the IT industry, skilled in SQL, Python, Tableau, and data modeling, with education from a top university, and notable projects in sales forecasting and customer segmentation.",
      category: "Complete Rewrite"
    },
    {
      title: "Software Engineer Focus",
      prompt: "Transform this into a compelling resume for a Senior Software Engineer position at a tech startup, emphasizing full-stack development, cloud technologies, and leadership experience.",
      category: "Role-Specific"
    },
    {
      title: "ATS Optimization",
      prompt: "Optimize this resume for ATS systems with proper keywords, formatting, and structure while maintaining all existing experience and enhancing descriptions with quantified achievements.",
      category: "Optimization"
    },
    {
      title: "Executive Level",
      prompt: "Elevate this resume to executive level with sophisticated language, strategic accomplishments, and leadership metrics suitable for C-level positions.",
      category: "Level Enhancement"
    },
    {
      title: "Career Change",
      prompt: "Restructure this resume for a career transition into Product Management, highlighting transferable skills, relevant projects, and strategic thinking capabilities.",
      category: "Career Pivot"
    },
    {
      title: "Industry Focus",
      prompt: "Adapt this resume specifically for the healthcare industry, incorporating relevant terminology, compliance knowledge, and patient-care focus.",
      category: "Industry Specific"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Try these examples:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <Card 
            key={index} 
            className="p-4 hover:shadow-md transition-all cursor-pointer bg-white/60 hover:bg-white/80 border border-gray-200"
            onClick={() => !disabled && onSelectPrompt(suggestion.prompt)}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {suggestion.title}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {suggestion.category}
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-3">
                {suggestion.prompt}
              </p>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>💡 Pro tip:</strong> Be specific about your target role, experience level, industry, and key skills for the best results!
        </p>
      </div>
    </div>
  );
};