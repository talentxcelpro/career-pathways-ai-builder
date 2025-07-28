import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SEOSection {
  id: string | number;
  name: string;
  slug: string;
  count?: number;
}

export const SEOInternalLinks = () => {
  const [roles, setRoles] = useState<SEOSection[]>([]);
  const [locations, setLocations] = useState<SEOSection[]>([]);
  const [skills, setSkills] = useState<SEOSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSEOSections = async () => {
      try {
        const [rolesRes, locationsRes, skillsRes] = await Promise.all([
          supabase.from('seo_roles').select('*').limit(12),
          supabase.from('seo_locations').select('*').limit(12),
          supabase.from('seo_skills').select('*').limit(12)
        ]);

        setRoles(rolesRes.data || []);
        setLocations(locationsRes.data || []);
        setSkills(skillsRes.data || []);
      } catch (error) {
        console.error('Error fetching SEO sections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSEOSections();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-6 bg-muted rounded w-32"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-4 bg-muted rounded w-full"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-12 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Explore Jobs by Category
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover thousands of opportunities across different roles, locations, and skill sets
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Jobs by Role */}
          <div className="bg-background rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
              Jobs by Role
            </h3>
            <div className="space-y-2">
              {roles.map((role) => (
                <Link
                  key={role.id}
                  to={`/jobs/role/${role.slug}`}
                  className="block text-muted-foreground hover:text-primary transition-colors duration-200 py-1 text-sm"
                >
                  {role.name} Jobs
                  {role.count && (
                    <span className="text-xs text-muted-foreground/70 ml-1">
                      ({role.count})
                    </span>
                  )}
                </Link>
              ))}
              <Link
                to="/jobs/roles"
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium mt-2"
              >
                View all roles →
              </Link>
            </div>
          </div>

          {/* Jobs by Location */}
          <div className="bg-background rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
              Jobs by Location
            </h3>
            <div className="space-y-2">
              {locations.map((location) => (
                <Link
                  key={location.id}
                  to={`/jobs/location/${location.slug}`}
                  className="block text-muted-foreground hover:text-primary transition-colors duration-200 py-1 text-sm"
                >
                  Jobs in {location.name}
                  {location.count && (
                    <span className="text-xs text-muted-foreground/70 ml-1">
                      ({location.count})
                    </span>
                  )}
                </Link>
              ))}
              <Link
                to="/jobs/locations"
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium mt-2"
              >
                View all cities →
              </Link>
            </div>
          </div>

          {/* Jobs by Skills */}
          <div className="bg-background rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <span className="w-2 h-2 bg-destructive rounded-full mr-3"></span>
              Jobs by Skills
            </h3>
            <div className="space-y-2">
              {skills.map((skill) => (
                <Link
                  key={skill.id}
                  to={`/jobs/skill/${skill.slug}`}
                  className="block text-muted-foreground hover:text-primary transition-colors duration-200 py-1 text-sm"
                >
                  {skill.name} Jobs
                  {skill.count && (
                    <span className="text-xs text-muted-foreground/70 ml-1">
                      ({skill.count})
                    </span>
                  )}
                </Link>
              ))}
              <Link
                to="/jobs/skills"
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium mt-2"
              >
                View all skills →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};