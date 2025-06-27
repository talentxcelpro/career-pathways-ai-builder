
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Briefcase, Building, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { JobPreferencesUpload } from "@/components/profile/documents/JobPreferencesUpload";

const ProfilePreferences = () => {
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState({
    preferredRoles: ["Software Engineer", "Full Stack Developer"],
    locations: ["Remote", "San Francisco", "New York"],
    salaryMin: 80000,
    salaryMax: 150000,
    workType: "Remote",
    industries: ["Technology", "Fintech"],
    companySize: ["Startup", "Medium"],
    benefits: ["Health Insurance", "401k", "Flexible Hours"],
    additionalNotes: "Looking for a role with growth opportunities and modern tech stack."
  });

  const [newRole, setNewRole] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newBenefit, setNewBenefit] = useState("");

  const addItem = (field: keyof typeof preferences, value: string, setter: (val: string) => void) => {
    if (value.trim() && !preferences[field].includes(value.trim())) {
      setPreferences(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter("");
    }
  };

  const removeItem = (field: keyof typeof preferences, item: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
  };

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
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Preferred Roles
            </CardTitle>
            <CardDescription>What job titles are you interested in?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {preferences.preferredRoles.map((role, index) => (
                  <Badge key={index} variant="secondary" className="pr-2">
                    {role}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2"
                      onClick={() => removeItem('preferredRoles', role)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add preferred role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('preferredRoles', newRole, setNewRole)}
                />
                <Button onClick={() => addItem('preferredRoles', newRole, setNewRole)}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Preferred Locations
            </CardTitle>
            <CardDescription>Where would you like to work?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {preferences.locations.map((location, index) => (
                  <Badge key={index} variant="secondary" className="pr-2">
                    {location}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2"
                      onClick={() => removeItem('locations', location)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add preferred location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('locations', newLocation, setNewLocation)}
                />
                <Button onClick={() => addItem('locations', newLocation, setNewLocation)}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Range */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Salary Expectations
            </CardTitle>
            <CardDescription>What's your expected salary range?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salaryMin">Minimum Salary</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={preferences.salaryMin}
                  onChange={(e) => setPreferences(prev => ({ ...prev, salaryMin: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="salaryMax">Maximum Salary</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={preferences.salaryMax}
                  onChange={(e) => setPreferences(prev => ({ ...prev, salaryMax: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Industries */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Preferred Industries
            </CardTitle>
            <CardDescription>Which industries interest you?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {preferences.industries.map((industry, index) => (
                  <Badge key={index} variant="secondary" className="pr-2">
                    {industry}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2"
                      onClick={() => removeItem('industries', industry)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add preferred industry"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('industries', newIndustry, setNewIndustry)}
                />
                <Button onClick={() => addItem('industries', newIndustry, setNewIndustry)}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Desired Benefits
            </CardTitle>
            <CardDescription>What benefits are important to you?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {preferences.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="pr-2">
                    {benefit}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2"
                      onClick={() => removeItem('benefits', benefit)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add desired benefit"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('benefits', newBenefit, setNewBenefit)}
                />
                <Button onClick={() => addItem('benefits', newBenefit, setNewBenefit)}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>Any other preferences or requirements?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Share any additional preferences, requirements, or notes about your job search..."
              value={preferences.additionalNotes}
              onChange={(e) => setPreferences(prev => ({ ...prev, additionalNotes: e.target.value }))}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

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
