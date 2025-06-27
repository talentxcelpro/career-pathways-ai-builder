
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, X } from "lucide-react";

interface DesiredBenefitsSectionProps {
  benefits: string[];
  onBenefitsChange: (benefits: string[]) => void;
}

export const DesiredBenefitsSection = ({ benefits, onBenefitsChange }: DesiredBenefitsSectionProps) => {
  const [newBenefit, setNewBenefit] = useState("");

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      onBenefitsChange([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (benefit: string) => {
    onBenefitsChange(benefits.filter(b => b !== benefit));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Desired Benefits
        </CardTitle>
        <CardDescription>What benefits are important to you?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit, index) => (
              <Badge key={index} variant="secondary" className="pr-2">
                {benefit}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => removeBenefit(benefit)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add desired benefit"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
            />
            <Button onClick={addBenefit}>
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
