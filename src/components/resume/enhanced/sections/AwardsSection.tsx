
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Trophy, Calendar } from "lucide-react";
import { Award } from "@/types/enhanced-resume";

interface AwardsSectionProps {
  data: Award[];
  onChange: (data: Award[]) => void;
}

export const AwardsSection: React.FC<AwardsSectionProps> = ({
  data,
  onChange,
}) => {
  const addAward = () => {
    const newAward: Award = {
      id: crypto.randomUUID(),
      name: "",
      issuer: "",
      date: "",
      description: "",
    };
    onChange([...data, newAward]);
  };

  const updateAward = (id: string, field: keyof Award, value: any) => {
    onChange(
      data.map((award) =>
        award.id === id ? { ...award, [field]: value } : award
      )
    );
  };

  const removeAward = (id: string) => {
    onChange(data.filter((award) => award.id !== id));
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Awards & Honors
        </CardTitle>
        <Button onClick={addAward} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Award
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((award, index) => (
          <Card key={award.id} className="p-6 border-l-4 border-l-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Award #{index + 1}
              </div>
              <Button
                onClick={() => removeAward(award.id)}
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor={`name-${award.id}`}>Award Name *</Label>
                <Input
                  id={`name-${award.id}`}
                  value={award.name}
                  onChange={(e) => updateAward(award.id, "name", e.target.value)}
                  placeholder="e.g., Employee of the Year"
                />
              </div>
              <div>
                <Label htmlFor={`issuer-${award.id}`}>Issuing Organization *</Label>
                <Input
                  id={`issuer-${award.id}`}
                  value={award.issuer}
                  onChange={(e) => updateAward(award.id, "issuer", e.target.value)}
                  placeholder="e.g., ABC Corporation"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor={`date-${award.id}`}>Date Received *</Label>
                <Input
                  id={`date-${award.id}`}
                  type="month"
                  value={award.date}
                  onChange={(e) => updateAward(award.id, "date", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`description-${award.id}`}>Description</Label>
              <Textarea
                id={`description-${award.id}`}
                value={award.description}
                onChange={(e) => updateAward(award.id, "description", e.target.value)}
                placeholder="Describe the award and why you received it..."
                rows={3}
              />
            </div>
          </Card>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No awards added yet.</p>
            <p className="text-sm">Click "Add Award" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
