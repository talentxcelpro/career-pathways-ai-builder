import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Trophy } from "lucide-react";
import { Award } from "@/types/enhanced-resume";

interface AwardsSectionProps {
  data: Award[];
  onChange: (data: Award[]) => void;
}

export const AwardsSection: React.FC<AwardsSectionProps> = ({
  data,
  onChange
}) => {
  const addAward = () => {
    const newAward: Award = {
      id: crypto.randomUUID(),
      title: '',
      issuer: '',
      date: '',
      description: '',
      category: 'professional',
      level: 'local'
    };
    onChange([...data, newAward]);
  };

  const updateAward = (id: string, updates: Partial<Award>) => {
    onChange(data.map(award => 
      award.id === id ? { ...award, ...updates } : award
    ));
  };

  const removeAward = (id: string) => {
    onChange(data.filter(award => award.id !== id));
  };

  const getCategoryColor = (category: Award['category']) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-green-100 text-green-800';
      case 'community': return 'bg-purple-100 text-purple-800';
      case 'competition': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: Award['level']) => {
    switch (level) {
      case 'international': return 'bg-red-100 text-red-800';
      case 'national': return 'bg-yellow-100 text-yellow-800';
      case 'regional': return 'bg-blue-100 text-blue-800';
      case 'local': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Awards & Achievements</h3>
        </div>
        <Button onClick={addAward} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Award
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No awards yet</p>
            <Button onClick={addAward} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Award
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((award, index) => (
            <Card key={award.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">
                      Award #{index + 1}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(award.category)}>
                        {award.category}
                      </Badge>
                      <Badge className={getLevelColor(award.level)}>
                        {award.level}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAward(award.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`title-${award.id}`}>Award Title *</Label>
                    <Input
                      id={`title-${award.id}`}
                      value={award.title}
                      onChange={(e) => updateAward(award.id, { title: e.target.value })}
                      placeholder="e.g., Employee of the Year"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`issuer-${award.id}`}>Issuing Organization *</Label>
                    <Input
                      id={`issuer-${award.id}`}
                      value={award.issuer}
                      onChange={(e) => updateAward(award.id, { issuer: e.target.value })}
                      placeholder="e.g., TechCorp Inc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`date-${award.id}`}>Date Received *</Label>
                    <Input
                      id={`date-${award.id}`}
                      type="month"
                      value={award.date}
                      onChange={(e) => updateAward(award.id, { date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`category-${award.id}`}>Category</Label>
                    <Select
                      value={award.category}
                      onValueChange={(value: Award['category']) => 
                        updateAward(award.id, { category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`level-${award.id}`}>Level</Label>
                    <Select
                      value={award.level}
                      onValueChange={(value: Award['level']) => 
                        updateAward(award.id, { level: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`description-${award.id}`}>Description *</Label>
                  <Textarea
                    id={`description-${award.id}`}
                    value={award.description}
                    onChange={(e) => updateAward(award.id, { description: e.target.value })}
                    placeholder="Describe what this award recognizes and why you received it..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};