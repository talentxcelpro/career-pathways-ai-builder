
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Upload, Target, Map } from 'lucide-react';
import { AIResumeUploader } from '@/components/career-map/AIResumeUploader';
import { SkillsGapAnalyzer } from '@/components/career-map/SkillsGapAnalyzer';
import { CareerInputModal } from '@/components/career-map/CareerInputModal';
import { RoadmapDisplay } from '@/components/career-map/RoadmapDisplay';
import { DataIntegrationDashboard } from '@/components/career-map/DataIntegrationDashboard';
import { useAICareerMapping } from '@/hooks/useAICareerMapping';
import { useAuth } from '@/contexts/AuthContext';

const AIRoadmapBuilder = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [skillsGapAnalysis, setSkillsGapAnalysis] = useState<any>(null);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any>(null);
  const [showCareerModal, setShowCareerModal] = useState(false);

  const { generateRoadmap, isGeneratingRoadmap } = useAICareerMapping();

  const handleResumeProcessed = (resumeData: any) => {
    setParsedResume(resumeData);
    setActiveTab('analysis');
  };

  const handleAnalysisComplete = (analysis: any) => {
    setSkillsGapAnalysis(analysis);
    setActiveTab('roadmap');
  };

  const handleGenerateRoadmap = async (careerData: any) => {
    if (!parsedResume && !careerData.currentRole) return;

    const currentSkills = parsedResume?.skills?.technical || [];
    
    try {
      const result = await generateRoadmap.mutateAsync({
        currentRole: parsedResume?.currentRole?.title || careerData.currentRole,
        targetRole: careerData.targetRole,
        experienceLevel: parsedResume?.currentRole?.experienceLevel || 'Mid',
        currentSkills: currentSkills.map((skill: any) => ({
          name: skill.name,
          proficiency: skill.proficiency || 3,
          category: skill.category || 'Technical'
        })),
        timeframe: parseInt(careerData.timeframe),
        learningPreferences: careerData.description,
        userId: user?.id
      });

      if (result.success) {
        setGeneratedRoadmap(result.roadmap);
        setShowCareerModal(false);
      }
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
            <Brain className="h-8 w-8 text-violet-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Career Roadmap Builder</h1>
            <p className="text-muted-foreground text-lg">
              Upload your resume and get an AI-powered personalized career roadmap
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden md:inline">Upload Resume</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2" disabled={!parsedResume}>
              <Target className="h-4 w-4" />
              <span className="hidden md:inline">Skills Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2" disabled={!skillsGapAnalysis && !parsedResume}>
              <Map className="h-4 w-4" />
              <span className="hidden md:inline">Generate Roadmap</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2" disabled={!generatedRoadmap}>
              <Brain className="h-4 w-4" />
              <span className="hidden md:inline">Your Roadmap</span>
            </TabsTrigger>
          </TabsList>

          {/* Resume Upload Tab */}
          <TabsContent value="upload" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIResumeUploader 
                onResumeProcessed={handleResumeProcessed}
                userId={user?.id}
              />
              
              {parsedResume && (
                <Card>
                  <CardHeader>
                    <CardTitle>Parsed Resume Data</CardTitle>
                    <CardDescription>
                      AI has extracted the following information from your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Personal Info</h4>
                      <p className="text-sm text-gray-600">
                        {parsedResume.personalInfo?.name} - {parsedResume.personalInfo?.email}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Current Role</h4>
                      <p className="text-sm text-gray-600">
                        {parsedResume.currentRole?.title} ({parsedResume.currentRole?.experienceLevel})
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Key Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {parsedResume.skills?.technical?.slice(0, 8).map((skill: any, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {parsedResume.careerAnalysis && (
                      <div>
                        <h4 className="font-medium mb-2">Career Recommendations</h4>
                        <div className="space-y-2">
                          {parsedResume.careerAnalysis.potentialRoles?.slice(0, 3).map((role: string, index: number) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                              {role}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Skills Analysis Tab */}
          <TabsContent value="analysis" className="mt-6">
            <SkillsGapAnalyzer
              currentSkills={parsedResume?.skills?.technical?.map((skill: any) => ({
                name: skill.name,
                proficiency: skill.proficiency || 3,
                category: skill.category || 'Technical'
              })) || []}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </TabsContent>

          {/* Roadmap Generation Tab */}
          <TabsContent value="roadmap" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Your Personalized Roadmap</CardTitle>
                <CardDescription>
                  Based on your resume analysis, create a customized career development plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {skillsGapAnalysis && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Skills Gap Summary</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Overall Readiness: {skillsGapAnalysis.gapAnalysis?.readinessLevel} 
                        ({skillsGapAnalysis.gapAnalysis?.overallScore}%)
                      </p>
                      <p className="text-sm text-gray-600">
                        Estimated time to career readiness: {skillsGapAnalysis.gapAnalysis?.estimatedTimeToReadiness}
                      </p>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      onClick={() => setShowCareerModal(true)}
                      disabled={isGeneratingRoadmap}
                      className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {isGeneratingRoadmap ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Generating Roadmap...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4" />
                          Create AI Roadmap
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="mt-6">
            {generatedRoadmap && (
              <div className="space-y-6">
                <RoadmapDisplay 
                  roadmap={generatedRoadmap}
                  showActions={true}
                />
                
                {/* Add Data Integration Dashboard */}
                <div className="mt-8">
                  <DataIntegrationDashboard
                    targetRole={parsedResume?.currentRole?.title || 'Software Engineer'}
                    currentSkills={parsedResume?.skills?.technical?.map((s: any) => s.name) || []}
                    location="United States"
                    experienceLevel={parsedResume?.currentRole?.experienceLevel || 'Mid-level'}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Career Goal Modal */}
        <CareerInputModal
          open={showCareerModal}
          onOpenChange={setShowCareerModal}
          onSubmit={handleGenerateRoadmap}
          isLoading={isGeneratingRoadmap}
        />
      </div>
    </div>
  );
};

export default AIRoadmapBuilder;
