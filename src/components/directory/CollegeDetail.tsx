import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  GraduationCap, 
  MapPin, 
  Users, 
  ExternalLink, 
  Globe, 
  Phone, 
  Mail,
  Star,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Award,
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface College {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  established_year?: number;
  college_type: string;
  affiliation?: string;
  ranking?: number;
  accreditation?: string[];
  facilities?: string[];
  admission_process?: string;
  fees_structure?: string;
  scholarships?: string[];
  placement_stats?: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function CollegeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchCollege();
      checkBookmarkStatus();
    }
  }, [slug]);

  const fetchCollege = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'verified')
        .single();

      if (error) throw error;
      setCollege(data);
    } catch (error) {
      console.error('Error fetching college:', error);
      toast({
        title: "Error",
        description: "Failed to load college details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('college_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('college_slug', slug)
        .single();

      setIsBookmarked(!!data);
    } catch (error) {
      // Bookmark doesn't exist
    }
  };

  const toggleBookmark = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to bookmark colleges",
          variant: "destructive",
        });
        return;
      }

      if (isBookmarked) {
        await supabase
          .from('college_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('college_slug', slug);
        
        setIsBookmarked(false);
        toast({
          title: "Bookmark Removed",
          description: "College removed from your bookmarks",
        });
      } else {
        await supabase
          .from('college_bookmarks')
          .insert({
            user_id: user.id,
            college_slug: slug!,
            college_name: college?.name || ''
          });
        
        setIsBookmarked(true);
        toast({
          title: "Bookmarked",
          description: "College added to your bookmarks",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">College Not Found</h1>
        <p className="text-muted-foreground mb-6">The college you're looking for doesn't exist or hasn't been verified yet.</p>
        <Button asChild>
          <Link to="/colleges">Browse Colleges</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={college.logo_url || ''} alt={college.name} />
              <AvatarFallback>
                <GraduationCap className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{college.name}</h1>
              <p className="text-lg text-muted-foreground">{college.college_type}</p>
            </div>
          </div>
          <Button onClick={toggleBookmark} variant="outline">
            {isBookmarked ? (
              <>
                <BookmarkCheck className="h-4 w-4 mr-2" />
                Bookmarked
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmark
              </>
            )}
          </Button>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {college.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {college.location}
            </div>
          )}
          {college.established_year && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Established {college.established_year}
            </div>
          )}
          {college.ranking && (
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-1" />
              Rank #{college.ranking}
            </div>
          )}
        </div>

        {/* Accreditation */}
        {college.accreditation && college.accreditation.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {college.accreditation.map((acc, index) => (
              <Badge key={index} variant="secondary">
                {acc}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About {college.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {college.description || 'No description available.'}
              </p>
            </CardContent>
          </Card>

          {/* Admission Process */}
          {college.admission_process && (
            <Card>
              <CardHeader>
                <CardTitle>Admission Process</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {college.admission_process}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Facilities */}
          {college.facilities && college.facilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {college.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                      {facility}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scholarships */}
          {college.scholarships && college.scholarships.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Scholarships Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {college.scholarships.map((scholarship, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Award className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                      {scholarship}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {college.website && (
                <div className="flex items-center text-sm">
                  <Globe className="h-4 w-4 mr-3 text-muted-foreground" />
                  <a 
                    href={college.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3 ml-1 inline" />
                  </a>
                </div>
              )}
              {college.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <a 
                    href={`mailto:${college.email}`}
                    className="text-primary hover:underline"
                  >
                    {college.email}
                  </a>
                </div>
              )}
              {college.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                  <a 
                    href={`tel:${college.phone}`}
                    className="text-primary hover:underline"
                  >
                    {college.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>College Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span>{college.college_type}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Established</span>
                <span>{college.established_year || 'N/A'}</span>
              </div>
              <Separator />
              {college.affiliation && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Affiliation</span>
                    <span>{college.affiliation}</span>
                  </div>
                  <Separator />
                </>
              )}
              {college.ranking && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ranking</span>
                    <span>#{college.ranking}</span>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary">Verified</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to={`/colleges/${college.id}/courses`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Courses
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/colleges/${college.id}/apply`}>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Apply Now
                  </Link>
                </Button>
                {college.website && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={college.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}