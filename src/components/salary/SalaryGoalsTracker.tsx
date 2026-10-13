import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trash2,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface SalaryGoal {
  targetSalary: number; // in INR
  targetRole: string;
  targetDate: string;
  currentSalary: number;
  milestones: { id: string; title: string; completed: boolean }[];
}

interface HistoricalEntry {
  id: string;
  year: string;
  salary: number; // in INR
  role: string;
  company?: string;
}

const LOCAL_STORAGE_KEY_GOAL = 'talentxcel_salary_goal';
const LOCAL_STORAGE_KEY_HISTORY = 'talentxcel_salary_history';

export const SalaryGoalsTracker: React.FC<{ initialSalary?: number; initialRole?: string }> = ({
  initialSalary,
  initialRole
}) => {
  const { user } = useAuth();

  const [goal, setGoal] = useState<SalaryGoal>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_GOAL);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      targetSalary: initialSalary ? Math.round(initialSalary * 1.30) : 1800000,
      targetRole: initialRole || 'Senior Software Engineer',
      targetDate: '2026-12-31',
      currentSalary: initialSalary || 1400000,
      milestones: [
        { id: '1', title: 'Complete Cloud Architecture Certification', completed: true },
        { id: '2', title: 'Lead end-to-end design of 1 major production service', completed: false },
        { id: '3', title: 'Conduct quarterly salary benchmark audit', completed: true },
        { id: '4', title: 'Present promotion / appraisal business case', completed: false }
      ]
    };
  });

  const [history, setHistory] = useState<HistoricalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'h1', year: '2024', salary: 900000, role: 'Software Engineer', company: 'Tech Services' },
      { id: 'h2', year: '2025', salary: 1250000, role: 'Software Engineer II', company: 'Product Scaleup' },
      { id: 'h3', year: '2026', salary: initialSalary || 1550000, role: initialRole || 'Senior Engineer', company: 'Current Firm' }
    ];
  });

  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [newHistoryYear, setNewHistoryYear] = useState('2023');
  const [newHistorySalary, setNewHistorySalary] = useState('');
  const [newHistoryRole, setNewHistoryRole] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_GOAL, JSON.stringify(goal));
      localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {}
  }, [goal, history]);

  // Sync to Supabase if authenticated
  const handleSaveToCloud = async () => {
    if (!user) {
      toast.info('Sign in to sync your salary goals across all devices.');
      return;
    }

    try {
      const { error } = await supabase
        .from('tool_saved_results')
        .insert({
          user_id: user.id,
          tool_slug: 'salary-goals-tracker',
          result_title: `Salary Goal: ₹${(goal.targetSalary / 100000).toFixed(1)} LPA (${goal.targetRole})`,
          result_type: 'data',
          result_data: { goal, history },
          tags: ['salary-goal', 'career-growth']
        });

      if (error) throw error;
      toast.success('Salary goals synced to your TalentXcel cloud account!');
    } catch (err: any) {
      console.warn('Sync failed:', err);
      toast.error('Unable to sync to cloud. Local progress is saved.');
    }
  };

  const formatLakhs = (amount: number): string => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(1)} LPA`;
  };

  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((goal.currentSalary - (history[0]?.salary || goal.currentSalary * 0.7)) /
          (goal.targetSalary - (history[0]?.salary || goal.currentSalary * 0.7))) *
          100
      )
    )
  );

  const toggleMilestone = (id: string) => {
    setGoal({
      ...goal,
      milestones: goal.milestones.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      )
    });
  };

  const addMilestone = () => {
    if (newMilestoneText.trim()) {
      setGoal({
        ...goal,
        milestones: [
          ...goal.milestones,
          { id: Date.now().toString(), title: newMilestoneText.trim(), completed: false }
        ]
      });
      setNewMilestoneText('');
      toast.success('Milestone added!');
    }
  };

  const removeMilestone = (id: string) => {
    setGoal({
      ...goal,
      milestones: goal.milestones.filter((m) => m.id !== id)
    });
  };

  const addHistoryEntry = () => {
    const sal = parseFloat(newHistorySalary) * 100000;
    if (sal > 0 && newHistoryYear && newHistoryRole) {
      setHistory([
        ...history,
        {
          id: Date.now().toString(),
          year: newHistoryYear,
          salary: sal,
          role: newHistoryRole
        }
      ].sort((a, b) => parseInt(a.year) - parseInt(b.year)));
      setNewHistorySalary('');
      setNewHistoryRole('');
      toast.success('Compensation record added!');
    } else {
      toast.error('Please enter valid year, salary in lakhs, and role.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Compensation & Progress Card */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Compensation Growth Target & Trajectory
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Set transparent career milestones and track your historical progression over time.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveToCloud}
              className="self-start sm:self-auto text-xs font-semibold"
            >
              {user ? 'Sync to Cloud Account' : 'Save Locally'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Top Target Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Current Position</span>
              <div className="text-2xl font-bold text-slate-200">
                {formatLakhs(goal.currentSalary)}
              </div>
              <span className="text-xs text-slate-400">{history[history.length - 1]?.role || 'Current Role'}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">Target Earning Goal</span>
              <div className="text-2xl font-extrabold text-emerald-400">
                {formatLakhs(goal.targetSalary)}
              </div>
              <span className="text-xs text-slate-400">{goal.targetRole}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Target Review Date</span>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-400" />
                {goal.targetDate}
              </div>
              <span className="text-xs text-slate-400">Remaining to Target: {formatLakhs(Math.max(0, goal.targetSalary - goal.currentSalary))}</span>
            </div>
          </div>

          {/* Goal Edit Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Target Salary (₹ Lakhs)
              </label>
              <Input
                type="number"
                step="0.5"
                value={(goal.targetSalary / 100000).toString()}
                onChange={(e) => setGoal({ ...goal, targetSalary: (parseFloat(e.target.value) || 0) * 100000 })}
                className="text-xs h-9 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Target Position / Role
              </label>
              <Input
                value={goal.targetRole}
                onChange={(e) => setGoal({ ...goal, targetRole: e.target.value })}
                className="text-xs h-9 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Target Timeline
              </label>
              <Input
                type="date"
                value={goal.targetDate}
                onChange={(e) => setGoal({ ...goal, targetDate: e.target.value })}
                className="text-xs h-9 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Milestones Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Career & Negotiation Milestones ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} Completed)
            </h4>

            <div className="space-y-2">
              {goal.milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleMilestone(m.id)}
                    className="flex items-center gap-2.5 text-left flex-1"
                  >
                    {m.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span className={m.completed ? 'line-through text-slate-400' : 'font-medium text-slate-800 dark:text-slate-200'}>
                      {m.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMilestone(m.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Input
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                placeholder="Add actionable milestone (e.g. Complete AWS Certification)..."
                className="text-xs h-9 bg-white dark:bg-slate-900"
              />
              <Button size="sm" onClick={addMilestone} className="text-xs shrink-0 h-9">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Milestone
              </Button>
            </div>
          </div>

          {/* Historical Compensation Log */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Verified Historical Compensation Timeline
            </h4>

            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs bg-white dark:bg-slate-900">
                      {item.year}
                    </Badge>
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.role}</span>
                      {item.company && <span className="text-slate-400 ml-1.5">• {item.company}</span>}
                    </div>
                  </div>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatLakhs(item.salary)}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Record Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
              <Input
                placeholder="Year (e.g. 2023)"
                value={newHistoryYear}
                onChange={(e) => setNewHistoryYear(e.target.value)}
                className="text-xs h-9"
              />
              <Input
                placeholder="CTC in Lakhs (e.g. 10.5)"
                value={newHistorySalary}
                onChange={(e) => setNewHistorySalary(e.target.value)}
                className="text-xs h-9"
              />
              <Input
                placeholder="Role (e.g. Analyst)"
                value={newHistoryRole}
                onChange={(e) => setNewHistoryRole(e.target.value)}
                className="text-xs h-9"
              />
              <Button size="sm" onClick={addHistoryEntry} className="text-xs h-9 font-semibold">
                <Plus className="h-3.5 w-3.5 mr-1" /> Log Record
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
