
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from "@/components/profile/ProfileLayout";
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { SocialLinksManager } from '@/components/profile/SocialLinksManager';
import { ProfileVisibilitySettings } from '@/components/profile/ProfileVisibilitySettings';
import { useFileUpload } from '@/hooks/useFileUpload';
import { generateCustomProfileUrl } from '@/utils/profileHelpers';

const ProfileEdit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'resumes',
    maxSize: 50 * 1024 * 1024, // 50MB for resumes
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });
  
  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Get profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.id
  });

  const [formData, setFormData] = useState({
    full_name: '',
    title: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    about: '',
    skills: [] as string[],
    industry: '',
    current_company: '',
    experience_years: 0,
    profile_picture_url: '',
    social_links: {} as Record<string, string>,
    profile_visibility: 'public' as 'public' | 'private' | 'connections_only',
    allow_profile_sharing: true,
    custom_profile_url: '',
    resume_url: ''
  });

  const [newSkill, setNewSkill] = useState("");

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        title: profile.title || '',
        location: profile.location || '',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        about: profile.about || '',
        skills: profile.skills || [],
        industry: profile.industry || '',
        current_company: profile.current_company || '',
        experience_years: profile.experience_years || 0,
        profile_picture_url: profile.profile_picture_url || '',
        social_links: (profile.social_links && typeof profile.social_links === 'object' && !Array.isArray(profile.social_links)) 
          ? profile.social_links as Record<string, string> 
          : {},
        profile_visibility: (profile.profile_visibility === 'public' || profile.profile_visibility === 'private' || profile.profile_visibility === 'connections_only') 
          ? profile.profile_visibility 
          : 'public',
        allow_profile_sharing: profile.allow_profile_sharing ?? true,
        custom_profile_url: profile.custom_profile_url || generateCustomProfileUrl(profile.full_name || ''),
        resume_url: profile.resume_url || ''
      });
    }
  }, [profile]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!currentUser?.id) throw new Error('No user ID');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', currentUser?.id] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      navigate('/profile');
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?.id) return;

    try {
      const url = await uploadFile(file, currentUser.id, 'resume');
      if (url) {
        setFormData(prev => ({ ...prev, resume_url: url }));
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
    }
  };

  const handleSave = () => {
    if (!formData.full_name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    saveProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <ProfileLayout title="Edit Profile" description="Update your professional information">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout 
      title="Edit Profile" 
      description="Update your professional information and preferences"
    >
      <div className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a professional photo</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePictureUpload
              currentImageUrl={formData.profile_picture_url}
              userName={formData.full_name}
              userId={currentUser?.id || ''}
              onImageChange={(url) => setFormData(prev => ({ ...prev, profile_picture_url: url }))}
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your primary contact and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name *</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Professional Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State/Country"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Website/Portfolio</label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="yourwebsite.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>Upload your latest resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.resume_url && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Resume uploaded successfully
                  </p>
                  <a 
                    href={formData.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View current resume
                  </a>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload">
                  <Button variant="outline" className="cursor-pointer" disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX (max 50MB)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
            <CardDescription>Tell potential employers about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.about}
              onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
              placeholder="Write a compelling summary of your professional background..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.about.length}/500 characters
            </p>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
            <CardDescription>Add your technical and professional skills from our comprehensive list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Software Development */}
                <div>
                  <label className="text-sm font-medium mb-2 block">💻 Software Development</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="React.js">React.js</SelectItem>
                      <SelectItem value="Node.js">Node.js</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Django">Django</SelectItem>
                      <SelectItem value="Java">Java</SelectItem>
                      <SelectItem value="Spring Boot">Spring Boot</SelectItem>
                      <SelectItem value="C++">C++</SelectItem>
                      <SelectItem value="Git/GitHub">Git/GitHub</SelectItem>
                      <SelectItem value="REST APIs">REST APIs</SelectItem>
                      <SelectItem value="GraphQL">GraphQL</SelectItem>
                      <SelectItem value="Docker">Docker</SelectItem>
                      <SelectItem value="Kubernetes">Kubernetes</SelectItem>
                      <SelectItem value="CI/CD">CI/CD</SelectItem>
                      <SelectItem value="SQL">SQL</SelectItem>
                      <SelectItem value="MongoDB">MongoDB</SelectItem>
                      <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                      <SelectItem value="AWS">AWS</SelectItem>
                      <SelectItem value="Azure">Azure</SelectItem>
                      <SelectItem value="Google Cloud Platform (GCP)">Google Cloud Platform (GCP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* UI/UX & Design */}
                <div>
                  <label className="text-sm font-medium mb-2 block">🎨 UI/UX & Design</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Adobe Photoshop">Adobe Photoshop</SelectItem>
                      <SelectItem value="Adobe Illustrator">Adobe Illustrator</SelectItem>
                      <SelectItem value="Figma">Figma</SelectItem>
                      <SelectItem value="Sketch">Sketch</SelectItem>
                      <SelectItem value="Adobe XD">Adobe XD</SelectItem>
                      <SelectItem value="Wireframing">Wireframing</SelectItem>
                      <SelectItem value="Prototyping">Prototyping</SelectItem>
                      <SelectItem value="User Research">User Research</SelectItem>
                      <SelectItem value="Design Thinking">Design Thinking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Data & Analytics */}
                <div>
                  <label className="text-sm font-medium mb-2 block">📊 Data & Analytics</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excel (Advanced)">Excel (Advanced)</SelectItem>
                      <SelectItem value="Power BI">Power BI</SelectItem>
                      <SelectItem value="Tableau">Tableau</SelectItem>
                      <SelectItem value="Python (Pandas, NumPy)">Python (Pandas, NumPy)</SelectItem>
                      <SelectItem value="R Programming">R Programming</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                      <SelectItem value="Deep Learning">Deep Learning</SelectItem>
                      <SelectItem value="Data Visualization">Data Visualization</SelectItem>
                      <SelectItem value="Data Cleaning">Data Cleaning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Web Development */}
                <div>
                  <label className="text-sm font-medium mb-2 block">🌐 Web Development</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HTML5">HTML5</SelectItem>
                      <SelectItem value="CSS3">CSS3</SelectItem>
                      <SelectItem value="Bootstrap">Bootstrap</SelectItem>
                      <SelectItem value="Tailwind CSS">Tailwind CSS</SelectItem>
                      <SelectItem value="JavaScript (ES6+)">JavaScript (ES6+)</SelectItem>
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="Angular">Angular</SelectItem>
                      <SelectItem value="Vue.js">Vue.js</SelectItem>
                      <SelectItem value="WebSockets">WebSockets</SelectItem>
                      <SelectItem value="Responsive Design">Responsive Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile Development */}
                <div>
                  <label className="text-sm font-medium mb-2 block">📱 Mobile Development</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flutter">Flutter</SelectItem>
                      <SelectItem value="React Native">React Native</SelectItem>
                      <SelectItem value="Swift">Swift</SelectItem>
                      <SelectItem value="Kotlin">Kotlin</SelectItem>
                      <SelectItem value="Android SDK">Android SDK</SelectItem>
                      <SelectItem value="iOS Development">iOS Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cybersecurity */}
                <div>
                  <label className="text-sm font-medium mb-2 block">🔐 Cybersecurity</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ethical Hacking">Ethical Hacking</SelectItem>
                      <SelectItem value="Penetration Testing">Penetration Testing</SelectItem>
                      <SelectItem value="Network Security">Network Security</SelectItem>
                      <SelectItem value="Vulnerability Assessment">Vulnerability Assessment</SelectItem>
                      <SelectItem value="Firewalls & IDS/IPS">Firewalls & IDS/IPS</SelectItem>
                      <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Business & Management */}
                <div>
                  <label className="text-sm font-medium mb-2 block">📈 Business & Management</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Project Management">Project Management</SelectItem>
                      <SelectItem value="Agile & Scrum">Agile & Scrum</SelectItem>
                      <SelectItem value="Business Analysis">Business Analysis</SelectItem>
                      <SelectItem value="Product Management">Product Management</SelectItem>
                      <SelectItem value="Stakeholder Communication">Stakeholder Communication</SelectItem>
                      <SelectItem value="Strategic Planning">Strategic Planning</SelectItem>
                      <SelectItem value="Risk Management">Risk Management</SelectItem>
                      <SelectItem value="Financial Forecasting">Financial Forecasting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Marketing & Communications */}
                <div>
                  <label className="text-sm font-medium mb-2 block">📢 Marketing & Communications</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                      <SelectItem value="SEO/SEM">SEO/SEM</SelectItem>
                      <SelectItem value="Content Writing">Content Writing</SelectItem>
                      <SelectItem value="Copywriting">Copywriting</SelectItem>
                      <SelectItem value="Branding">Branding</SelectItem>
                      <SelectItem value="Email Marketing">Email Marketing</SelectItem>
                      <SelectItem value="Social Media Strategy">Social Media Strategy</SelectItem>
                      <SelectItem value="Google Analytics">Google Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sales & Customer Service */}
                <div>
                  <label className="text-sm font-medium mb-2 block">🛒 Sales & Customer Service</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                      <SelectItem value="CRM (Salesforce, HubSpot)">CRM (Salesforce, HubSpot)</SelectItem>
                      <SelectItem value="B2B Sales">B2B Sales</SelectItem>
                      <SelectItem value="Negotiation Skills">Negotiation Skills</SelectItem>
                      <SelectItem value="Client Relationship Management">Client Relationship Management</SelectItem>
                      <SelectItem value="Inbound/Outbound Sales">Inbound/Outbound Sales</SelectItem>
                      <SelectItem value="Cold Calling">Cold Calling</SelectItem>
                      <SelectItem value="Customer Retention">Customer Retention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Operations & Administration */}
                <div>
                  <label className="text-sm font-medium mb-2 block">🏢 Operations & Administration</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MS Office Suite">MS Office Suite</SelectItem>
                      <SelectItem value="Google Workspace">Google Workspace</SelectItem>
                      <SelectItem value="Data Entry">Data Entry</SelectItem>
                      <SelectItem value="Documentation">Documentation</SelectItem>
                      <SelectItem value="Time Management">Time Management</SelectItem>
                      <SelectItem value="Inventory Management">Inventory Management</SelectItem>
                      <SelectItem value="Vendor Coordination">Vendor Coordination</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Languages & Communication */}
                <div>
                  <label className="text-sm font-medium mb-2 block">🌍 Languages & Communication</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English (Fluent)">English (Fluent)</SelectItem>
                      <SelectItem value="Hindi (Native)">Hindi (Native)</SelectItem>
                      <SelectItem value="Tamil">Tamil</SelectItem>
                      <SelectItem value="Bengali">Bengali</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Communication Skills">Communication Skills</SelectItem>
                      <SelectItem value="Presentation Skills">Presentation Skills</SelectItem>
                      <SelectItem value="Public Speaking">Public Speaking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Teaching & Training */}
                <div>
                  <label className="text-sm font-medium mb-2 block">🧑‍🏫 Teaching & Training</label>
                  <Select onValueChange={(value) => value && !formData.skills.includes(value) && setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instructional Design">Instructional Design</SelectItem>
                      <SelectItem value="eLearning Tools">eLearning Tools</SelectItem>
                      <SelectItem value="Classroom Management">Classroom Management</SelectItem>
                      <SelectItem value="Curriculum Development">Curriculum Development</SelectItem>
                      <SelectItem value="Online Teaching">Online Teaching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Custom skill input for skills not in the list */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-2 block">Add Custom Skill</label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter a custom skill not listed above"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
            <CardDescription>Additional information about your career</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Industry</label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                >
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
              <div>
                <label className="text-sm font-medium mb-2 block">Years of Experience</label>
                <Input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                  placeholder="5"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Current Company</label>
                <Input
                  value={formData.current_company}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_company: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <SocialLinksManager
          socialLinks={formData.social_links}
          onSocialLinksChange={(links) => setFormData(prev => ({ ...prev, social_links: links }))}
        />

        {/* Privacy & Visibility */}
        <ProfileVisibilitySettings
          visibility={formData.profile_visibility}
          allowSharing={formData.allow_profile_sharing}
          customUrl={formData.custom_profile_url}
          onVisibilityChange={(visibility) => setFormData(prev => ({ ...prev, profile_visibility: visibility }))}
          onSharingChange={(allow) => setFormData(prev => ({ ...prev, allow_profile_sharing: allow }))}
        />

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveProfileMutation.isPending}>
            {saveProfileMutation.isPending ? (
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
