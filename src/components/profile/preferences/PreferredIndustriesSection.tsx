
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building, X } from "lucide-react";

interface PreferredIndustriesSectionProps {
  industries: string[];
  onIndustriesChange: (industries: string[]) => void;
}

export const PreferredIndustriesSection = ({ industries, onIndustriesChange }: PreferredIndustriesSectionProps) => {
  const [newIndustry, setNewIndustry] = useState("");

  const addIndustry = () => {
    if (newIndustry.trim() && !industries.includes(newIndustry.trim())) {
      onIndustriesChange([...industries, newIndustry.trim()]);
      setNewIndustry("");
    }
  };

  const removeIndustry = (industry: string) => {
    onIndustriesChange(industries.filter(i => i !== industry));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Preferred Industries
        </CardTitle>
        <CardDescription>Which industries interest you?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {industries.map((industry, index) => (
              <Badge key={index} variant="secondary" className="pr-2">
                {industry}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => removeIndustry(industry)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add preferred industry"
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIndustry()}
            />
            <Button onClick={addIndustry}>
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
