
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { JobPreferencesUpload } from "@/components/profile/documents/JobPreferencesUpload";
import { PreferredRolesSection } from "@/components/profile/preferences/PreferredRolesSection";
import { PreferredLocationsSection } from "@/components/profile/preferences/PreferredLocationsSection";
import { SalaryExpectationsSection } from "@/components/profile/preferences/SalaryExpectationsSection";
import { PreferredIndustriesSection } from "@/components/profile/preferences/PreferredIndustriesSection";
import { DesiredBenefitsSection } from "@/components/profile/preferences/DesiredBenefitsSection";
import { AdditionalNotesSection } from "@/components/profile/preferences/AdditionalNotesSection";
import { SmartFeedPreferences } from "@/components/profile/preferences/SmartFeedPreferences";
import { useSmartFeedPreferences } from "@/hooks/useSmartFeedPreferences";
import { Settings, Zap, Briefcase } from "lucide-react";

const ProfilePreferences = () => {
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState({
    preferredRoles: ["Software Engineer", "Full Stack Developer"] as string[],
    locations: ["Remote", "San Francisco", "New York"] as string[],
    salaryMin: 80000,
    salaryMax: 150000,
    workType: "Remote",
    industries: ["Technology", "Fintech"] as string[],
    companySize: ["Startup", "Medium"] as string[],
    benefits: ["Health Insurance", "401k", "Flexible Hours"] as string[],
    additionalNotes: "Looking for a role with growth opportunities and modern tech stack."
  });

  const { 
    preferences: smartFeedPreferences, 
    loading: smartFeedLoading, 
    saving: smartFeedSaving,
    updatePreferences: updateSmartFeedPreferences,
    savePreferences: saveSmartFeedPreferences
  } = useSmartFeedPreferences();

  const handleJobPreferencesSave = () => {
    toast({
      title: "Preferences Saved",
      description: "Your job preferences have been updated successfully.",
    });
  };

  const handleSmartFeedSave = async () => {
    const success = await saveSmartFeedPreferences(smartFeedPreferences);
    if (success) {
      // Toast is already shown in the hook
    }
  };

  return (
    <ProfileLayout 
      title="Preferences" 
      description="Manage your job search and smart feed preferences"
    >
      <Tabs defaultValue="job-preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="job-preferences" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Job Preferences
          </TabsTrigger>
          <TabsTrigger value="smart-feed" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart Feed
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="job-preferences" className="mt-6">
          <div className="space-y-6">
            {/* Import/Export Section */}
            <JobPreferencesUpload />

            {/* Preferred Roles */}
            <PreferredRolesSection
              roles={preferences.preferredRoles}
              onRolesChange={(roles) => setPreferences(prev => ({ ...prev, preferredRoles: roles }))}
            />

            {/* Locations */}
            <PreferredLocationsSection
              locations={preferences.locations}
              onLocationsChange={(locations) => setPreferences(prev => ({ ...prev, locations }))}
            />

            {/* Salary Range */}
            <SalaryExpectationsSection
              salaryMin={preferences.salaryMin}
              salaryMax={preferences.salaryMax}
              onSalaryMinChange={(salaryMin) => setPreferences(prev => ({ ...prev, salaryMin }))}
              onSalaryMaxChange={(salaryMax) => setPreferences(prev => ({ ...prev, salaryMax }))}
            />

            {/* Industries */}
            <PreferredIndustriesSection
              industries={preferences.industries}
              onIndustriesChange={(industries) => setPreferences(prev => ({ ...prev, industries }))}
            />

            {/* Benefits */}
            <DesiredBenefitsSection
              benefits={preferences.benefits}
              onBenefitsChange={(benefits) => setPreferences(prev => ({ ...prev, benefits }))}
            />

            {/* Additional Notes */}
            <AdditionalNotesSection
              notes={preferences.additionalNotes}
              onNotesChange={(additionalNotes) => setPreferences(prev => ({ ...prev, additionalNotes }))}
            />

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleJobPreferencesSave} 
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Save Job Preferences
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="smart-feed" className="mt-6">
          <div className="space-y-6">
            {smartFeedLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading preferences...</p>
              </div>
            ) : (
              <>
                <SmartFeedPreferences
                  preferences={smartFeedPreferences}
                  onPreferencesChange={updateSmartFeedPreferences}
                />
                
                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSmartFeedSave} 
                    disabled={smartFeedSaving}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {smartFeedSaving ? "Saving..." : "Save Smart Feed Preferences"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </ProfileLayout>
  );
};

export default ProfilePreferences;
