import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
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
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  tagline?: string;
  founded_year?: number;
  size?: string;
  industries?: string[];
  culture?: string;
  benefits?: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export default function CompanyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchCompany();
      checkBookmarkStatus();
    }
  }, [slug]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'verified')
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company:', error);
      toast({
        title: "Error",
        description: "Failed to load company details",
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
        .from('company_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('company_slug', slug)
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
          description: "Please log in to bookmark companies",
          variant: "destructive",
        });
        return;
      }

      if (isBookmarked) {
        await supabase
          .from('company_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('company_slug', slug);
        
        setIsBookmarked(false);
        toast({
          title: "Bookmark Removed",
          description: "Company removed from your bookmarks",
        });
      } else {
        await supabase
          .from('company_bookmarks')
          .insert({
            user_id: user.id,
            company_slug: slug!,
            company_name: company?.name || ''
          });
        
        setIsBookmarked(true);
        toast({
          title: "Bookmarked",
          description: "Company added to your bookmarks",
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

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Company Not Found</h1>
        <p className="text-muted-foreground mb-6">The company you're looking for doesn't exist or hasn't been verified yet.</p>
        <Button asChild>
          <Link to="/companies">Browse Companies</Link>
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
              <AvatarImage src={company.logo_url || ''} alt={company.name} />
              <AvatarFallback>
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <p className="text-lg text-muted-foreground">{company.tagline}</p>
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
          {company.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {company.location}
            </div>
          )}
          {company.size && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {company.size}
            </div>
          )}
          {company.founded_year && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Founded {company.founded_year}
            </div>
          )}
        </div>

        {/* Industries */}
        {company.industries && company.industries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {company.industries.map((industry, index) => (
              <Badge key={index} variant="secondary">
                {industry}
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
              <CardTitle>About {company.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {company.description || 'No description available.'}
              </p>
            </CardContent>
          </Card>

          {/* Company Culture */}
          {company.culture && (
            <Card>
              <CardHeader>
                <CardTitle>Company Culture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {company.culture}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {company.benefits && company.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {company.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                      {benefit}
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
              {company.website && (
                <div className="flex items-center text-sm">
                  <Globe className="h-4 w-4 mr-3 text-muted-foreground" />
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3 ml-1 inline" />
                  </a>
                </div>
              )}
              {company.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <a 
                    href={`mailto:${company.email}`}
                    className="text-primary hover:underline"
                  >
                    {company.email}
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                  <a 
                    href={`tel:${company.phone}`}
                    className="text-primary hover:underline"
                  >
                    {company.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Company Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Industry</span>
                <span>{company.industries?.[0] || 'N/A'}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Company Size</span>
                <span>{company.size || 'N/A'}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Founded</span>
                <span>{company.founded_year || 'N/A'}</span>
              </div>
              <Separator />
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
                  <Link to={`/jobs?company=${company.slug}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Jobs
                  </Link>
                </Button>
                {company.website && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
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