
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { JobPreferencesUpload } from "@/components/profile/documents/JobPreferencesUpload";
import { PreferredRolesSection } from "@/components/profile/preferences/PreferredRolesSection";
import { PreferredLocationsSection } from "@/components/profile/preferences/PreferredLocationsSection";
import { SalaryExpectationsSection } from "@/components/profile/preferences/SalaryExpectationsSection";
import { PreferredIndustriesSection } from "@/components/profile/preferences/PreferredIndustriesSection";
import { DesiredBenefitsSection } from "@/components/profile/preferences/DesiredBenefitsSection";
import { AdditionalNotesSection } from "@/components/profile/preferences/AdditionalNotesSection";

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

  const handleSave = () => {
    toast({
      title: "Preferences Saved",
      description: "Your job preferences have been updated successfully.",
    });
  };

  return (
    <ProfileLayout 
      title="Job Preferences" 
      description="Set your job search preferences and upload preference files"
    >
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
          <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-blue-600">
            Save Preferences
          </Button>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePreferences;
