// src/components/seo/jobs/MatrixFAQAccordion.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { JobRoleConfig } from '@/config/jobs/roles';
import { JobExperienceConfig } from '@/config/jobs/experiences';
import { JobLocationConfig } from '@/config/jobs/locations';

interface MatrixFAQAccordionProps {
  role: JobRoleConfig;
  experience: JobExperienceConfig;
  location: JobLocationConfig;
}

export const MatrixFAQAccordion: React.FC<MatrixFAQAccordionProps> = ({
  role,
  experience,
  location,
}) => {
  const faqs = [
    {
      q: `What is the average salary for ${role.title} (${experience.label}) in ${location.cityName}?`,
      a: `In ${location.cityName}, ${role.title} professionals with ${experience.label.toLowerCase()} typically earn competitive compensation packages tailored to regional market standards. Top factors increasing salary include proficiency in ${role.skills.slice(0, 3).join(', ')} and demonstrable production impact.`
    },
    {
      q: `Which companies are hiring for ${role.title} roles in ${location.cityName}?`,
      a: `Tech enterprises, high-growth startups, IT service consulting firms, and regional product centers in ${location.cityName} regularly recruit for ${role.title}. TalentXcel partners directly with verified hiring teams to list unadvertised openings.`
    },
    {
      q: `What skills should I highlight on my resume for ${role.title} in ${location.cityName}?`,
      a: `Ensure your resume prominently highlights core competencies including ${role.skills.slice(0, 5).join(', ')}. Use our free ATS Resume Scanner on TalentXcel to benchmark your resume match rate against actual recruiter requirements.`
    },
    {
      q: `Are remote or hybrid ${role.title} jobs available in ${location.cityName}?`,
      a: `Yes, many organizations offering ${role.title} roles in ${location.cityName} provide hybrid flexibility or 100% remote telecommute arrangements depending on the team requirements.`
    }
  ];

  return (
    <section className="space-y-4 pt-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-blue-500" />
        <h3 className="text-xl font-bold text-foreground">
          Frequently Asked Questions: {role.title} Jobs in {location.cityName}
        </h3>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <Card key={i} className="border border-border/60 bg-card rounded-xl">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-bold text-foreground leading-snug">
                {faq.q}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-5 pb-4 text-xs text-muted-foreground leading-relaxed">
              {faq.a}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
