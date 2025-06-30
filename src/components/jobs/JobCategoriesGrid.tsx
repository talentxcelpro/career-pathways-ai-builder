
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

interface JobCategory {
  name: string;
  icon: string;
  subcategories: string[];
}

const jobCategories: JobCategory[] = [
  {
    name: "Technology & IT",
    icon: "👨‍💻",
    subcategories: [
      "Software Development", "Frontend / Backend / Full Stack", "DevOps & Cloud",
      "AI & ML", "Cybersecurity", "UI/UX Design", "Data Science", "QA & Testing",
      "Product Management", "Web3 & Blockchain"
    ]
  },
  {
    name: "Design & Creative",
    icon: "🎨",
    subcategories: [
      "Graphic Design", "UI/UX Design", "Motion Graphics", "Video Editing",
      "Product Design", "Animation & VFX", "Game Art"
    ]
  },
  {
    name: "Sales & Marketing",
    icon: "💼",
    subcategories: [
      "Digital Marketing", "Performance Marketing", "SEO/SEM", "B2B & B2C Sales",
      "Business Development", "Content Marketing", "Affiliate Marketing", "Brand Management"
    ]
  },
  {
    name: "Finance & Accounting",
    icon: "🧾",
    subcategories: [
      "Chartered Accountant", "Financial Analyst", "Payroll", "Taxation",
      "Bookkeeping", "Investment Banking", "Risk & Compliance"
    ]
  },
  {
    name: "Operations & Admin",
    icon: "🧠",
    subcategories: [
      "General Management", "Supply Chain & Logistics", "Procurement",
      "Office Admin", "Facilities Management"
    ]
  },
  {
    name: "Education & Training",
    icon: "👩‍🏫",
    subcategories: [
      "School Teacher", "Lecturer / Professor", "Curriculum Designer",
      "eLearning Specialist", "Corporate Trainer"
    ]
  },
  {
    name: "Healthcare & Life Sciences",
    icon: "🏥",
    subcategories: [
      "Doctor / Nurse", "Clinical Research", "Pharmacist", "Lab Technician", "Medical Coder"
    ]
  },
  {
    name: "Customer Support & BPO",
    icon: "💬",
    subcategories: [
      "Voice / Chat / Email Support", "Technical Support", "Telecalling", "Helpdesk"
    ]
  },
  {
    name: "Legal & Compliance",
    icon: "⚖️",
    subcategories: [
      "Corporate Lawyer", "Legal Associate", "Compliance Officer", "Company Secretary"
    ]
  },
  {
    name: "Content & Communication",
    icon: "📝",
    subcategories: [
      "Content Writer", "Copywriter", "Editor", "PR & Media", "Technical Writer", "Translator"
    ]
  },
  {
    name: "Engineering & Manufacturing",
    icon: "🏗️",
    subcategories: [
      "Mechanical", "Civil", "Electrical", "Industrial / Automotive",
      "Plant Operations", "Quality Control"
    ]
  },
  {
    name: "Freelance & Remote",
    icon: "🌐",
    subcategories: [
      "Remote Developer", "Freelance Designer", "Online Content Creator",
      "Remote Sales", "Remote Admin"
    ]
  }
];

export const JobCategoriesGrid: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleSubcategory = (subcategory: string) => {
    setSelectedCategories(prev =>
      prev.includes(subcategory)
        ? prev.filter(name => name !== subcategory)
        : [...prev, subcategory]
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">🗂️ 50+ Job Categories</CardTitle>
          <Badge variant="outline" className="text-xs">
            {selectedCategories.length} Selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobCategories.map((category) => (
            <div key={category.name} className="border rounded-lg p-4">
              <div 
                className="flex items-center justify-between cursor-pointer mb-3"
                onClick={() => toggleCategory(category.name)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                {expandedCategories.includes(category.name) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>

              {expandedCategories.includes(category.name) && (
                <div className="space-y-2">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory} className="flex items-center space-x-2">
                      <Checkbox
                        id={subcategory}
                        checked={selectedCategories.includes(subcategory)}
                        onCheckedChange={() => toggleSubcategory(subcategory)}
                      />
                      <label 
                        htmlFor={subcategory} 
                        className="text-xs cursor-pointer hover:text-blue-600"
                      >
                        {subcategory}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
