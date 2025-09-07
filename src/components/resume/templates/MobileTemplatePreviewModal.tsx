import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Palette, Maximize, Minimize, Star, Users, Eye } from 'lucide-react';
import { resumeTemplates } from '@/data/resumeTemplates';

interface MobileTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  onSelect: (templateId: string) => void;
}

export const MobileTemplatePreviewModal: React.FC<MobileTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  templateId,
  onSelect
}) => {
  const template = resumeTemplates.find(t => t.id === templateId);

  if (!template) return null;

  const renderMockResume = () => (
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <h1 className="text-2xl font-bold">Sarah Johnson</h1>
        <p className="text-blue-100">Senior Product Manager</p>
        <div className="mt-2 text-sm text-blue-100">
          <p>sarah.johnson@email.com | +1 (555) 123-4567</p>
          <p>San Francisco, CA</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Summary */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-blue-200 pb-1">
            Professional Summary
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Results-driven Product Manager with 8+ years of experience leading cross-functional teams 
            to deliver innovative solutions. Proven track record of launching products that drive 
            30%+ revenue growth.
          </p>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-blue-200 pb-1">
            Experience
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">Senior Product Manager</h3>
              <p className="text-blue-600 font-medium text-sm">TechCorp Inc.</p>
              <p className="text-gray-500 text-xs">2021 - Present</p>
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                <li>• Led product development for mobile app with 2M+ users</li>
                <li>• Increased user engagement by 45% through data-driven features</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Product Manager</h3>
              <p className="text-blue-600 font-medium text-sm">StartupXYZ</p>
              <p className="text-gray-500 text-xs">2019 - 2021</p>
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                <li>• Launched 3 new features resulting in $2M revenue increase</li>
                <li>• Managed product roadmap and stakeholder communications</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-blue-200 pb-1">
            Skills
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {['Product Strategy', 'Agile/Scrum', 'Data Analysis', 'User Research', 'A/B Testing', 'SQL'].map((skill) => (
              <div key={skill} className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {skill}
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-blue-200 pb-1">
            Education
          </h2>
          <div>
            <h3 className="font-semibold text-gray-800">MBA in Technology Management</h3>
            <p className="text-blue-600 font-medium text-sm">Stanford University</p>
            <p className="text-gray-500 text-xs">2019</p>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[90vh] p-0 overflow-hidden z-50">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold">{template.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          
          {/* Template stats */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.8</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span>12K+ uses</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                ATS {template.atsScore}%
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          <div className="flex justify-center">
            {renderMockResume()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white">
          <div className="flex flex-wrap gap-2 mb-3">
            {template.features.slice(0, 4).map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Live Preview
            </Button>
            <Button 
              onClick={() => {
                onSelect(template.id);
                onClose();
              }}
              className="flex-1"
            >
              Use Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};