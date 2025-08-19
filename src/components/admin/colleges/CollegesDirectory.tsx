import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCollegesManagement } from '@/hooks/useCollegesManagement';
import { 
  Plus,
  Search,
  MapPin,
  Users,
  Calendar,
  Crown,
  Shield,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  School
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateCollegeDialog } from './CreateCollegeDialog';

export const CollegesDirectory: React.FC = () => {
  const {
    colleges,
    collegeStats,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    stateFilter,
    setStateFilter,
    verificationFilter,
    setVerificationFilter,
    premiumFilter,
    setPremiumFilter,
    isLoading,
    deleteCollege
  } = useCollegesManagement();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const getVerificationBadge = (status: string) => {
    const variants: Record<string, string> = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800'
    };
    return variants[status] || variants.pending;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      government: 'bg-blue-100 text-blue-800',
      private: 'bg-purple-100 text-purple-800',
      autonomous: 'bg-green-100 text-green-800',
      central: 'bg-orange-100 text-orange-800',
      deemed: 'bg-pink-100 text-pink-800'
    };
    return variants[type] || variants.private;
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-64"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Colleges Directory</h2>
          <p className="text-muted-foreground">Manage verified and trusted college profiles</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add College
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="College Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="autonomous">Autonomous</SelectItem>
                <SelectItem value="central">Central</SelectItem>
                <SelectItem value="deemed">Deemed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {collegeStats?.states?.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={premiumFilter} onValueChange={setPremiumFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Premium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Colleges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colleges?.map((college: any) => (
          <Card key={college.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-center relative">
              {college.banner_image_url ? (
                <img 
                  src={college.banner_image_url} 
                  alt={college.college_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <School className="h-12 w-12 text-primary/50" />
              )}
              
              {/* Premium Badge */}
              {college.is_premium && (
                <div className="absolute top-2 right-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                </div>
              )}
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{college.college_name}</CardTitle>
                <Badge className={getVerificationBadge(college.verification_status)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {college.verification_status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {college.description || 'No description available'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{college.city}, {college.state}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{college.student_count || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className={getTypeBadge(college.college_type)}>
                  {college.college_type}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Est. {college.established_year || 'N/A'}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="font-semibold">{college.college_programs?.[0]?.count || 0}</div>
                  <div className="text-muted-foreground">Programs</div>
                </div>
                <div>
                  <div className="font-semibold">{college.college_inquiries?.[0]?.count || 0}</div>
                  <div className="text-muted-foreground">Inquiries</div>
                </div>
                <div>
                  <div className="font-semibold">{college.college_events?.[0]?.count || 0}</div>
                  <div className="text-muted-foreground">Events</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {college.website_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={college.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteCollege.mutate(college.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {colleges?.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No colleges found</h3>
            <p className="text-muted-foreground mb-4">Add your first college to get started</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add College
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateCollegeDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
};