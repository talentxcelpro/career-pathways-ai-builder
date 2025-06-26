
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Building } from "lucide-react";
import { Link } from "react-router-dom";

export const FeaturedJobs = () => {
  const featuredJobs = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
      posted: "2 days ago",
      salary: "$120k - $160k",
      skills: ["React", "TypeScript", "Node.js"]
    },
    {
      id: "2",
      title: "Product Manager",
      company: "StartupXYZ",
      location: "Remote",
      type: "Full-time",
      posted: "1 week ago",
      salary: "$100k - $140k",
      skills: ["Product Strategy", "Analytics", "Agile"]
    },
    {
      id: "3",
      title: "UX Designer",
      company: "Design Studio",
      location: "New York, NY",
      type: "Contract",
      posted: "3 days ago",
      salary: "$80k - $110k",
      skills: ["Figma", "User Research", "Prototyping"]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Featured Jobs</CardTitle>
            <CardDescription>
              Recommended opportunities for you
            </CardDescription>
          </div>
          <Link to="/jobs">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {featuredJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.posted}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">{job.type}</Badge>
              </div>
              
              <div className="mb-3">
                <span className="font-medium text-green-600">{job.salary}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm" asChild>
                  <Link to={`/jobs/${job.id}`}>View Details</Link>
                </Button>
                <Button size="sm" variant="outline">Save</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
