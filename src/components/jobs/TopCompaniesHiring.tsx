import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building, Users, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  industry?: string;
  description: string;
  open_jobs: number;
  employee_count_range?: string;
}

export const TopCompaniesHiring: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select(`
            id,
            name,
            logo_url,
            industry,
            description,
            employee_count_range,
            jobs!inner(id)
          `)
          .eq('is_verified', true)
          .eq('jobs.is_active', true)
          .limit(6);

        if (error) throw error;

        // Transform the data to count jobs
        const companiesWithJobCount = data?.map(company => ({
          id: company.id,
          name: company.name,
          logo_url: company.logo_url,
          industry: company.industry,
          description: company.description,
          employee_count_range: company.employee_count_range,
          open_jobs: company.jobs?.length || 0
        })) || [];

        setCompanies(companiesWithJobCount);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <div className="bg-white py-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-1">
          <h2 className="text-xs font-medium text-gray-900 mb-0.5">
            💼 Top Companies Hiring
          </h2>
          <p className="text-xs text-gray-600">Join industry leaders and fast-growing startups</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-2">
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8 ring-1 ring-gray-100">
                    <AvatarImage src={company.logo_url} alt={company.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {company.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-xs text-gray-900 mb-0.5 group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-0.5">{company.industry}</p>
                    <p className="text-xs text-gray-500 mb-1 line-clamp-1">{company.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Building className="h-2 w-2" />
                        {company.employee_count_range || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-2 w-2" />
                        {company.open_jobs} jobs
                      </span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs py-1 group-hover:bg-primary group-hover:text-white transition-colors"
                    >
                      View Jobs
                      <ArrowRight className="h-2 w-2 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-2">
          <Button variant="outline" size="sm" className="text-xs py-1">
            View All Companies
            <ArrowRight className="h-2 w-2 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};