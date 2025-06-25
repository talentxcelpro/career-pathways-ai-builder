
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Camera, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";

const ProfileEdit = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    fullName: "Alex Johnson",
    title: "Senior Software Engineer", 
    location: "San Francisco, CA",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    website: "alexjohnson.dev",
    linkedinUrl: "",
    githubUrl: "",
    about: "Passionate software engineer with 5+ years of experience building scalable web applications.",
    skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
    industry: "Technology",
    experienceYears: 5,
    currentCompany: "TechCorp Inc.",
    salary: {
      min: 120000,
      max: 180000,
      currency: "USD"
    }
  });

  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileLayout 
      title="Edit Profile" 
      description="Update your professional information and preferences"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your primary contact and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profile.fullName}
                onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Your full name"
              />
              <Input
                label="Professional Title"
                value={profile.title}
                onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Senior Software Engineer"
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
              <Input
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
              <Input
                label="Location"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State/Country"
              />
              <Input
                label="Website/Portfolio"
                value={profile.website}
                onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                placeholder="yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Summary */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
            <CardDescription>Tell potential employers about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={profile.about}
              onChange={(e) => setProfile(prev => ({ ...prev, about: e.target.value }))}
              placeholder="Write a compelling summary of your professional background..."
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
            <CardDescription>Add your technical and professional skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="relative group">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
            <CardDescription>Additional information about your career</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Industry</label>
                <Select value={profile.industry} onValueChange={(value) => setProfile(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                label="Years of Experience"
                type="number"
                value={profile.experienceYears}
                onChange={(e) => setProfile(prev => ({ ...prev, experienceYears: parseInt(e.target.value) }))}
                placeholder="5"
              />
              <Input
                label="Current Company"
                value={profile.currentCompany}
                onChange={(e) => setProfile(prev => ({ ...prev, currentCompany: e.target.value }))}
                placeholder="Company name"
                className="md:col-span-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Social & Professional Links</CardTitle>
            <CardDescription>Connect your professional profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="LinkedIn URL"
                value={profile.linkedinUrl}
                onChange={(e) => setProfile(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              <Input
                label="GitHub URL"
                value={profile.githubUrl}
                onChange={(e) => setProfile(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/yourusername"
              />
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfileEdit;
