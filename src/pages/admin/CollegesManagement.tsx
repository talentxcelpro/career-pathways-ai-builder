import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

const CollegesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const colleges = [
    {
      id: 1,
      name: "IIT Delhi",
      type: "Public",
      location: "Delhi, India",
      students: 11000,
      status: "verified",
      created: "2023-01-15"
    },
    {
      id: 2,
      name: "Stanford University",
      type: "Private",
      location: "California, USA",
      students: 17000,
      status: "pending",
      created: "2023-02-20"
    }
  ];

  const stats = [
    { title: "Total Colleges", value: "1,247", change: "+12%" },
    { title: "Verified Colleges", value: "892", change: "+8%" },
    { title: "Pending Verification", value: "89", change: "+15%" },
    { title: "New This Month", value: "24", change: "+20%" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Colleges Management</h1>
          <p className="text-muted-foreground">Manage colleges, verification, and content</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add College
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>College Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>

          {/* Colleges Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">College</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Students</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map((college) => (
                    <tr key={college.id} className="border-b">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{college.name}</div>
                          <div className="text-sm text-muted-foreground">Added {college.created}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{college.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{college.location}</td>
                      <td className="px-4 py-3 text-sm">{college.students.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={college.status === 'verified' ? 'default' : 'secondary'}
                          className={college.status === 'verified' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {college.status === 'verified' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollegesManagement;