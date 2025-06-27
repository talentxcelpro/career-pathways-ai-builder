
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
          Salary Expectations (INR)
        </CardTitle>
        <CardDescription>What's your expected salary range in Indian Rupees?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salaryMin">Minimum Salary (₹)</Label>
            <Input
              id="salaryMin"
              type="number"
              value={salaryMin}
              onChange={(e) => onSalaryMinChange(parseInt(e.target.value) || 0)}
              placeholder="e.g., 600000"
            />
          </div>
          <div>
            <Label htmlFor="salaryMax">Maximum Salary (₹)</Label>
            <Input
              id="salaryMax"
              type="number"
              value={salaryMax}
              onChange={(e) => onSalaryMaxChange(parseInt(e.target.value) || 0)}
              placeholder="e.g., 1200000"
            />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <p>Typical ranges: Entry Level (₹3-8L), Mid Level (₹8-15L), Senior Level (₹15-30L+)</p>
        </div>
      </CardContent>
    </Card>
  );
};
