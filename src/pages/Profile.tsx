
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Camera, Plus, X, MapPin, Mail, Phone, Globe } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    fullName: "Alex Johnson",
    title: "Senior Software Engineer",
    location: "San Francisco, CA",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    website: "alexjohnson.dev",
    about: "Passionate software engineer with 5+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud technologies. Love solving complex problems and mentoring junior developers.",
    skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Python", "Docker"],
    experience: [
      {
        id: 1,
        title: "Senior Software Engineer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        startDate: "2022-01",
        endDate: "Present",
        description: "Led development of microservices architecture serving 100k+ users. Mentored 3 junior developers and improved system performance by 40%."
      },
      {
        id: 2,
        title: "Software Engineer",
        company: "StartupLab",
        location: "Remote",
        startDate: "2020-06",
        endDate: "2021-12",
        description: "Built full-stack web applications using React and Node.js. Implemented CI/CD pipelines and reduced deployment time by 60%."
      }
    ],
    education: [
      {
        id: 1,
        degree: "Bachelor of Science in Computer Science",
        school: "University of California, Berkeley",
        startDate: "2016-09",
        endDate: "2020-05",
        description: "Graduated Magna Cum Laude. Relevant coursework: Data Structures, Algorithms, Database Systems, Software Engineering."
      }
    ]
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                {isEditing && (
                  <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full p-2 h-10 w-10">
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={profile.fullName}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      className="text-2xl font-bold"
                      placeholder="Full Name"
                    />
                    <Input
                      value={profile.title}
                      onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                      className="text-xl"
                      placeholder="Professional Title"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.fullName}</h1>
                    <p className="text-xl text-gray-600 mb-4">{profile.title}</p>
                  </>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {isEditing ? (
                      <Input
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Location"
                        className="h-8"
                      />
                    ) : (
                      <span>{profile.location}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {isEditing ? (
                      <Input
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Email"
                        className="h-8"
                      />
                    ) : (
                      <span>{profile.email}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {isEditing ? (
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone"
                        className="h-8"
                      />
                    ) : (
                      <span>{profile.phone}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    {isEditing ? (
                      <Input
                        value={profile.website}
                        onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="Website"
                        className="h-8"
                      />
                    ) : (
                      <span>{profile.website}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={profile.about}
                onChange={(e) => setProfile(prev => ({ ...prev, about: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{profile.about}</p>
            )}
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="relative group">
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
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
            )}
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {profile.experience.map((exp, index) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-blue-600 font-medium">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.location} • {exp.startDate} - {exp.endDate}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2">{exp.description}</p>
                  {index < profile.experience.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
            {isEditing && (
              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {profile.education.map((edu, index) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-blue-600 font-medium">{edu.school}</p>
                      <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2">{edu.description}</p>
                  {index < profile.education.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
            {isEditing && (
              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
