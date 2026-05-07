import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle2, ListChecks } from 'lucide-react';
import { updateMetaTags } from '@/utils/metaTags';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';

const CareerGoals: React.FC = () => {
  const [goals, setGoals] = React.useState<string[]>(['Improve system design skills', 'Publish 2 technical blog posts']);
  const [newGoal, setNewGoal] = React.useState('');

  React.useEffect(() => {
    updateMetaTags({
      title: 'Career Goals | Goal Management',
      description: 'Set and track your career goals with a simple, focused goal management page.'
    });
  }, []);

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(prev => [newGoal.trim(), ...prev]);
    setNewGoal('');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageShell width="lg" pad="md">
        <PageHeader
          eyebrow="Career"
          title="Career Goals"
          description="Smart goal setting and milestone tracking."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Current Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a new goal (e.g., Earn AWS certification)"
                />
                <Button onClick={addGoal} variant="default">Add</Button>
              </div>
              <ul className="space-y-2">
                {goals.map((g, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Create SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound.</p>
              <div className="flex flex-wrap gap-2">
                <Badge>Certification</Badge>
                <Badge>Portfolio</Badge>
                <Badge>Networking</Badge>
                <Badge>Learning</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    </div>
  );
};

export default CareerGoals;
