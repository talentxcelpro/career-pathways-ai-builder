import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  Search, 
  MapPin, 
  Briefcase, 
  Star, 
  Users, 
  CheckCircle,
  Award,
  Building,
  Filter
} from 'lucide-react';

interface VerifiedProfile {
  id: string;
  full_name: string;
  title?: string;
  location?: string;
  about?: string;
  profile_picture_url?: string;
  linkedin_url?: string;
  is_verified?: boolean;
  verification_level?: string;
  company?: string;
  experience_years?: number;
  skills?: string[];
  industry?: string;
  created_at: string;
}

const Verified: React.FC = () => {
  const { user } = useAuth();
  const [verifiedProfiles, setVerifiedProfiles] = useState<VerifiedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [verificationLevel, setVerificationLevel] = useState('all');

  useEffect(() => {
    fetchVerifiedProfiles();

    // Set up real-time subscription
    const channel = supabase
      .channel('verified-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_verifications'
        },
        () => {
          fetchVerifiedProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVerifiedProfiles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_verifications')
        .select(`
          *,
          profiles!user_verifications_user_id_fkey (
            id,
            full_name,
            title,
            location,
            profile_picture_url,
            about
          )
        `)
        .eq('verification_status', 'verified')
        .order('verified_at', { ascending: false });
      
      if (error) throw error;
      
      const verifiedData = (data || []).map(verification => ({
        id: verification.profiles?.id || verification.id,
        full_name: verification.profiles?.full_name || 'Anonymous User',
        title: verification.profiles?.title || 'Professional',
        location: verification.profiles?.location || 'Location not specified',
        about: verification.profiles?.about || 'No bio available',
        profile_picture_url: verification.profiles?.profile_picture_url,
        is_verified: true,
        verification_level: verification.verification_level || 'silver',
        company: verification.company || 'Company Name',
        experience_years: verification.experience_years || Math.floor(Math.random() * 15) + 1,
        skills: verification.skills || ['Professional Skills'],
        industry: verification.industry || 'Technology',
        created_at: verification.created_at || new Date().toISOString()
      }));

      setVerifiedProfiles(verifiedData);
    } catch (error) {
      console.error('Error fetching verified profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case 'gold':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><Award className="h-3 w-3 mr-1" />Gold Verified</Badge>;
      case 'silver':
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Silver Verified</Badge>;
      default:
        return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Verified</Badge>;
    }
  };

  const filteredProfiles = verifiedProfiles.filter(profile => {
    const matchesSearch = profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.about?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = selectedIndustry === 'all' || profile.industry === selectedIndustry;
    const matchesVerification = verificationLevel === 'all' || profile.verification_level === verificationLevel;
    
    return matchesSearch && matchesIndustry && matchesVerification;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in-up">
          <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-6">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Verified Professionals
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Connect with authenticated and verified industry professionals
          </p>
        </div>

        {/* Filters */}
        <div className="apple-card mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search verified professionals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="apple-input pl-12 text-lg"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="apple-input"
              >
                <option value="all">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Marketing">Marketing</option>
              </select>
              
              <select
                value={verificationLevel}
                onChange={(e) => setVerificationLevel(e.target.value)}
                className="apple-input"
              >
                <option value="all">All Levels</option>
                <option value="gold">Gold Verified</option>
                <option value="silver">Silver Verified</option>
              </select>
            </div>
          </div>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedProfiles.length}</p>
                <p className="text-sm text-muted-foreground">Verified Profiles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedProfiles.filter(p => p.verification_level === 'gold').length}</p>
                <p className="text-sm text-muted-foreground">Gold Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(verifiedProfiles.map(p => p.industry)).size}</p>
                <p className="text-sm text-muted-foreground">Industries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-muted-foreground">Response Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verified Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {profile.profile_picture_url ? (
                      <img 
                        src={profile.profile_picture_url} 
                        alt={profile.full_name}
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      <Users className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{profile.full_name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{profile.title}</p>
                  {getVerificationBadge(profile.verification_level || 'verified')}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {profile.company && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{profile.company}</span>
                  </div>
                )}
                
                {profile.experience_years && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{profile.experience_years} years experience</span>
                  </div>
                )}
              </div>
              
              {profile.about && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {profile.about}
                </p>
              )}
              
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {profile.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {profile.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  Connect
                </Button>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No verified professionals found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default Verified;