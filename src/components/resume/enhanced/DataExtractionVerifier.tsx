import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  Database,
  Eye,
  RefreshCw,
  FileText
} from "lucide-react";
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface DataExtractionVerifierProps {
  originalData?: any;
  processedData?: EnhancedResumeData;
  onRefresh?: () => void;
}

export const DataExtractionVerifier: React.FC<DataExtractionVerifierProps> = ({
  originalData,
  processedData,
  onRefresh
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getExtractionStatus = (originalValue: any, processedValue: any) => {
    if (!originalValue && !processedValue) return 'empty';
    if (originalValue && processedValue) return 'success';
    if (originalValue && !processedValue) return 'missing';
    return 'unknown';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'empty': return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-100 text-green-800">Extracted</Badge>;
      case 'missing': return <Badge variant="destructive">Missing</Badge>;
      case 'empty': return <Badge variant="secondary">Empty</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const analyzeDataExtraction = () => {
    if (!originalData || !processedData) return null;

    const sections = [
      {
        id: 'personalInfo',
        title: 'Personal Information',
        original: originalData.personalInfo,
        processed: processedData.personalInfo,
        fields: ['fullName', 'email', 'phone', 'location', 'summary']
      },
      {
        id: 'experience',
        title: 'Work Experience',
        original: originalData.experience,
        processed: processedData.experience,
        isArray: true
      },
      {
        id: 'education',
        title: 'Education',
        original: originalData.education,
        processed: processedData.education,
        isArray: true
      },
      {
        id: 'skills',
        title: 'Skills',
        original: originalData.skills,
        processed: processedData.skills,
        custom: true // Special handling for skills
      },
      {
        id: 'certifications',
        title: 'Certifications',
        original: originalData.certifications,
        processed: processedData.certifications,
        isArray: true
      },
      {
        id: 'projects',
        title: 'Projects',
        original: originalData.projects,
        processed: processedData.projects,
        isArray: true
      }
    ];

    return sections;
  };

  const sections = analyzeDataExtraction();

  const renderFieldComparison = (original: any, processed: any, fieldName: string) => {
    const originalValue = original?.[fieldName];
    const processedValue = processed?.[fieldName];
    const status = getExtractionStatus(originalValue, processedValue);

    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          <span className="text-sm font-medium">{fieldName}</span>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(status)}
          {originalValue && (
            <span className="text-xs text-muted-foreground max-w-32 truncate">
              {typeof originalValue === 'string' 
                ? originalValue.substring(0, 30) + (originalValue.length > 30 ? '...' : '')
                : JSON.stringify(originalValue).substring(0, 30) + '...'
              }
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderArrayComparison = (original: any, processed: any, sectionTitle: string) => {
    const originalCount = Array.isArray(original) ? original.length : 0;
    const processedCount = Array.isArray(processed) ? processed.length : 0;
    const status = originalCount === processedCount ? 'success' : 
                  originalCount > processedCount ? 'missing' : 'unknown';

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(status)}
            <span className="text-sm font-medium">Count Verification</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{originalCount} → {processedCount}</Badge>
            {getStatusBadge(status)}
          </div>
        </div>
        
        {originalCount > 0 && (
          <div className="bg-gray-50 rounded p-3">
            <h5 className="text-xs font-medium text-gray-600 mb-2">Original Data Sample:</h5>
            <pre className="text-xs text-gray-700 max-h-20 overflow-y-auto">
              {JSON.stringify(original?.[0] || {}, null, 2)}
            </pre>
          </div>
        )}
        
        {processedCount > 0 && (
          <div className="bg-blue-50 rounded p-3">
            <h5 className="text-xs font-medium text-blue-600 mb-2">Processed Data Sample:</h5>
            <pre className="text-xs text-blue-700 max-h-20 overflow-y-auto">
              {JSON.stringify(processed?.[0] || {}, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const renderSkillsComparison = (original: any, processed: any) => {
    const originalSkills = Array.isArray(original) ? original : [];
    const processedSkills = processed?.technical || [];
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Skills Transformation</span>
          <Badge variant="outline">
            {originalSkills.length} objects → {processedSkills.length} strings
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded p-3">
            <h5 className="text-xs font-medium text-gray-600 mb-2">Original Skills (Objects):</h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {originalSkills.slice(0, 5).map((skill: any, index: number) => (
                <div key={index} className="text-xs bg-white rounded px-2 py-1">
                  {skill.skill || skill.name || 'Unknown'} 
                  <span className="text-gray-500 ml-1">({skill.category})</span>
                </div>
              ))}
              {originalSkills.length > 5 && (
                <div className="text-xs text-gray-500">+{originalSkills.length - 5} more...</div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded p-3">
            <h5 className="text-xs font-medium text-blue-600 mb-2">Processed Skills (Strings):</h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {processedSkills.slice(0, 5).map((skill: string, index: number) => (
                <div key={index} className="text-xs bg-white rounded px-2 py-1">
                  {skill}
                </div>
              ))}
              {processedSkills.length > 5 && (
                <div className="text-xs text-blue-500">+{processedSkills.length - 5} more...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!sections) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Extraction Verifier</span>
          </CardTitle>
          <CardDescription>
            No data available for verification. Load a resume to see extraction analysis.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalSections = sections.length;
  const successfulSections = sections.filter(section => {
    if (section.custom) return true; // Skip complex validation for custom sections
    if (section.isArray) {
      const originalCount = Array.isArray(section.original) ? section.original.length : 0;
      const processedCount = Array.isArray(section.processed) ? section.processed.length : 0;
      return originalCount === processedCount;
    }
    return section.original && section.processed;
  }).length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Extraction Verification</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </CardTitle>
          <CardDescription>
            Verify that all resume data was extracted and processed correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {successfulSections === totalSections ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              )}
              <div>
                <p className="font-medium">
                  {successfulSections}/{totalSections} sections extracted successfully
                </p>
                <p className="text-sm text-muted-foreground">
                  {successfulSections === totalSections 
                    ? "All data extracted correctly" 
                    : `${totalSections - successfulSections} sections need attention`
                  }
                </p>
              </div>
            </div>
            <Badge variant={successfulSections === totalSections ? "default" : "secondary"}>
              {Math.round((successfulSections / totalSections) * 100)}% Complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section Analysis */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const hasData = section.original || section.processed;
          
          return (
            <Card key={section.id}>
              <Collapsible 
                open={isExpanded} 
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{section.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasData ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <Badge variant={hasData ? "default" : "secondary"}>
                          {hasData ? "Data Found" : "No Data"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {section.fields ? (
                      // Personal Info fields
                      <div className="space-y-1">
                        {section.fields.map(field => 
                          renderFieldComparison(section.original, section.processed, field)
                        )}
                      </div>
                    ) : section.custom ? (
                      // Skills special handling
                      renderSkillsComparison(section.original, section.processed)
                    ) : section.isArray ? (
                      // Array data (experience, education, etc.)
                      renderArrayComparison(section.original, section.processed, section.title)
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No specific verification available for this section type
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};