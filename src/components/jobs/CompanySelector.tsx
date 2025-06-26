
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
}

interface CompanySelectorProps {
  companies: Company[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function CompanySelector({ companies, value, onValueChange, placeholder = "Select company" }: CompanySelectorProps) {
  const selectedCompany = companies.find(c => c.id === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-12">
        <div className="flex items-center space-x-3">
          {selectedCompany && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedCompany.logo_url} alt={selectedCompany.name} />
              <AvatarFallback>
                <Building2 className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={company.logo_url} alt={company.name} />
                <AvatarFallback>
                  <Building2 className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span>{company.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
