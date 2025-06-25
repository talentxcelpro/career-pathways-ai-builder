
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, Edit, Trash2, Camera, Video, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";

const ProfileMedia = () => {
  const { toast } = useToast();
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  
  const [portfolioItems] = useState([
    {
      id: 1,
      title: "E-commerce Platform",
      type: "project",
      description: "Full-stack web application built with React and Node.js",
      imageUrl: "/placeholder.svg",
      projectUrl: "https://github.com/user/ecommerce-platform",
      tags: ["React", "Node.js", "MongoDB"]
    },
    {
      id: 2,
      title: "Mobile Banking App",
      type: "project",
      description: "React Native mobile application for banking services",
      imageUrl: "/placeholder.svg",
      projectUrl: "https://github.com/user/banking-app",
      tags: ["React Native", "TypeScript", "Firebase"]
    }
  ]);

  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: "",
    description: "",
    projectUrl: "",
    type: "project"
  });

  const handlePhotoUpload = () => {
    toast({
      title: "Photo Uploaded",
      description: "Your profile photo has been updated successfully.",
    });
  };

  const handleVideoUpload = () => {
    toast({
      title: "Video Uploaded",
      description: "Your video resume has been uploaded successfully.",
    });
  };

  const handleAddPortfolio = () => {
    if (!newPortfolioItem.title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title for your portfolio item.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Portfolio Item Added",
      description: "Your portfolio item has been added successfully.",
    });
    setShowAddPortfolio(false);
    setNewPortfolioItem({ title: "", description: "", projectUrl: "", type: "project" });
  };

  return (
    <ProfileLayout 
      title="Media & Portfolio" 
      description="Upload your profile photo, video resume, and showcase your work"
    >
      <div className="space-y-6">
        {/* Profile Photo & Video */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Profile Media</CardTitle>
            <CardDescription>Update your profile photo and video resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Photo */}
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  AJ
                </div>
                <h3 className="font-medium mb-2">Profile Photo</h3>
                <p className="text-sm text-gray-600 mb-4">Upload a professional headshot. JPG or PNG format, max 5MB.</p>
                <Button onClick={handlePhotoUpload} variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </div>

              {/* Video Resume */}
              <div className="text-center">
                <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-medium mb-2">Video Resume</h3>
                <p className="text-sm text-gray-600 mb-4">Record a 60-90 second video introduction. MP4 format, max 50MB.</p>
                <Button onClick={handleVideoUpload} variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Portfolio & Projects</CardTitle>
                <CardDescription>Showcase your best work and projects</CardDescription>
              </div>
              <Button onClick={() => setShowAddPortfolio(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Portfolio Form */}
            {showAddPortfolio && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-4">Add New Portfolio Item</h4>
                <div className="space-y-4">
                  <Input
                    placeholder="Project title"
                    value={newPortfolioItem.title}
                    onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Project description"
                    value={newPortfolioItem.description}
                    onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px]"
                  />
                  <Input
                    placeholder="Project URL (GitHub, live demo, etc.)"
                    value={newPortfolioItem.projectUrl}
                    onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, projectUrl: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddPortfolio}>Add Project</Button>
                    <Button variant="outline" onClick={() => setShowAddPortfolio(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolioItems.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Project
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Media Guidelines */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Media Guidelines</CardTitle>
            <CardDescription>Best practices for your profile media</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Profile Photo Tips</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Use a high-quality, recent photo</li>
                  <li>• Face should be clearly visible</li>
                  <li>• Professional attire recommended</li>
                  <li>• Neutral background works best</li>
                  <li>• Smile and make eye contact</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Video Resume Tips</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Keep it between 60-90 seconds</li>
                  <li>• Good lighting and audio quality</li>
                  <li>• Professional appearance</li>
                  <li>• Introduce yourself and key skills</li>
                  <li>• Practice before recording</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
};

export default ProfileMedia;
