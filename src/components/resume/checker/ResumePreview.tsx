
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, FileText } from 'lucide-react';

interface ResumePreviewProps {
  data: any;
}

const templates = [
  { id: 'original', name: 'Original', color: 'bg-gray-100' },
  { id: 'enhancv', name: 'Enhancv', color: 'bg-blue-100' },
  { id: 'double-column', name: 'Double Column', color: 'bg-green-100' },
  { id: 'ivy-league', name: 'Ivy League', color: 'bg-purple-100' },
  { id: 'elegant', name: 'Elegant', color: 'bg-pink-100' }
];

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('original');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Resume Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Template</label>
          <div className="grid grid-cols-1 gap-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate === template.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTemplate(template.id)}
                className="justify-start"
              >
                <div className={`w-3 h-3 rounded mr-2 ${template.color}`}></div>
                {template.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Preview Area */}
        <div className="border rounded-lg p-4 bg-white min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
              <span className="text-lg font-bold text-gray-600">
                {data.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{data.name || 'Your Name'}</h3>
              <p className="text-gray-600">{data.email || 'email@example.com'}</p>
              <p className="text-gray-600">{data.phone || 'Phone Number'}</p>
            </div>
            
            {data.experience && data.experience.length > 0 && (
              <div className="text-left space-y-2">
                <h4 className="font-semibold border-b pb-1">Experience</h4>
                {data.experience.slice(0, 2).map((exp: any, index: number) => (
                  <div key={index} className="text-sm space-y-1">
                    <div className="font-medium">{exp.title}</div>
                    <div className="text-gray-600">{exp.company} • {exp.duration}</div>
                    <div className="text-gray-700 text-xs line-clamp-2">
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button className="w-full" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Edit with Template
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
