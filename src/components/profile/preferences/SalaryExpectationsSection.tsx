
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface SalaryExpectationsSectionProps {
  salaryMin: number;
  salaryMax: number;
  onSalaryMinChange: (value: number) => void;
  onSalaryMaxChange: (value: number) => void;
}

export const SalaryExpectationsSection = ({ 
  salaryMin, 
  salaryMax, 
  onSalaryMinChange, 
  onSalaryMaxChange 
}: SalaryExpectationsSectionProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Salary Expectations
        </CardTitle>
        <CardDescription>What's your expected salary range?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salaryMin">Minimum Salary</Label>
            <Input
              id="salaryMin"
              type="number"
              value={salaryMin}
              onChange={(e) => onSalaryMinChange(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="salaryMax">Maximum Salary</Label>
            <Input
              id="salaryMax"
              type="number"
              value={salaryMax}
              onChange={(e) => onSalaryMaxChange(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
