
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Plus, X, Save, MapPin, Briefcase, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";

const ProfilePreferences = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [preferences, setPreferences] = useState({
    jobAlerts: true,
    openToWork: true,
    remoteWork: true,
    preferredRoles: ["Software Engineer", "Full Stack Developer"],
    preferredLocations: ["San Francisco, CA", "Remote"],
    salaryRange: [120000, 180000],
    experienceLevel: "senior",
    jobTypes: ["full-time"],
    industries: ["Technology", "Software"],
    companySize: ["startup", "mid-size"],
    benefits: ["health-insurance", "401k", "flexible-hours"]
  });

  const [newRole, setNewRole] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const addRole = () => {
    if (newRole.trim() && !preferences.preferredRoles.includes(newRole.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferredRoles: [...prev.preferredRoles, newRole.trim()]
      }));
      setNewRole("");
    }
  };

  const removeRole = (role: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredRoles: prev.preferredRoles.filter(r => r !== role)
    }));
  };

  const addLocation = () => {
    if (newLocation.trim() && !preferences.preferredLocations.includes(newLocation.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferredLocations: [...prev.preferredLocations, newLocation.trim()]
      }));
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.filter(l => l !== location)
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Preferences Saved",
        description: "Your job preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileLayout 
      title="Job Preferences" 
      description="Set your job search preferences and receive personalized recommendations"
    >
      <div className="space-y-6">
        {/* Job Search Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Job Search Status</CardTitle>
            <CardDescription>Control your visibility to recruiters and job opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Open to Work</h4>
                <p className="text-sm text-gray-600">Let recruiters know you're actively seeking opportunities</p>
              </div>
              <Switch
                checked={preferences.openToWork}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, openToWork: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Job Alerts</h4>
                <p className="text-sm text-gray-600">Receive email notifications for matching job opportunities</p>
              </div>
              <Switch
                checked={preferences.jobAlerts}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, jobAlerts: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Remote Work</h4>
                <p className="text-sm text-gray-600">Include remote job opportunities in your matches</p>
              </div>
              <Switch
                checked={preferences.remoteWork}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, remoteWork: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferred Roles */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Preferred Job Roles
            </CardTitle>
            <CardDescription>Specify the types of positions you're interested in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {preferences.preferredRoles.map((role, index) => (
                  <Badge key={index} variant="secondary" className="relative group">
                    {role}
                    <button
                      onClick={() => removeRole(role)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Add a job role"
                  onKeyPress={(e) => e.key === 'Enter' && addRole()}
                />
                <Button onClick={addRole} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferred Locations */}
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
                {preferences.preferredLocations.map((location, index) => (
                  <Badge key={index} variant="secondary" className="relative group">
                    {location}
                    <button
                      onClick={() => removeLocation(location)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Add a location"
                  onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                />
                <Button onClick={addLocation} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Expectations */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Salary Expectations
            </CardTitle>
            <CardDescription>Set your expected salary range (USD)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="px-4">
                <Slider
                  value={preferences.salaryRange}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, salaryRange: value }))}
                  max={300000}
                  min={40000}
                  step={5000}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>${preferences.salaryRange[0].toLocaleString()}</span>
                <span>${preferences.salaryRange[1].toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Preferences */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Additional Preferences</CardTitle>
            <CardDescription>Fine-tune your job search criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Experience Level</label>
                <Select 
                  value={preferences.experienceLevel} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, experienceLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead/Principal</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Job Type</label>
                <Select 
                  value={preferences.jobTypes[0]} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, jobTypes: [value] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} className="px-8">
            {isLoading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePreferences;
