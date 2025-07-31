import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Settings, Clock, TrendingUp, Bot, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useContentGenerationSchedule, 
  useUpdateGenerationSchedule,
  useTriggerContentGeneration 
} from '@/hooks/useBotTemplateManagement';
import { useBots } from '@/hooks/useBotManagement';

export const ContentGenerationScheduler: React.FC = () => {
  const { data: schedules = [] } = useContentGenerationSchedule();
  const { data: bots = [] } = useBots();
  const updateSchedule = useUpdateGenerationSchedule();
  const triggerGeneration = useTriggerContentGeneration();

  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [manualConfig, setManualConfig] = useState({
    botIds: [] as string[],
    templateCount: 10
  });

  const activeSchedule = schedules.find(s => s.is_active);
  const activeBots = bots.filter(bot => bot.is_active);

  const handleToggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      await updateSchedule.mutateAsync({ 
        id: scheduleId, 
        is_active: isActive,
        // Reset daily count when enabling
        ...(isActive ? { current_day_count: 0 } : {})
      });
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const handleUpdateQuota = async (scheduleId: string, dailyQuota: number) => {
    try {
      await updateSchedule.mutateAsync({ 
        id: scheduleId, 
        daily_quota: dailyQuota 
      });
    } catch (error) {
      console.error('Error updating quota:', error);
    }
  };

  const handleTriggerManualGeneration = async () => {
    try {
      await triggerGeneration.mutateAsync({
        botIds: manualConfig.botIds.length > 0 ? manualConfig.botIds : undefined,
        templateCount: manualConfig.templateCount
      });
    } catch (error) {
      console.error('Error triggering manual generation:', error);
    }
  };

  const handleResetDailyCount = async (scheduleId: string) => {
    try {
      await updateSchedule.mutateAsync({ 
        id: scheduleId, 
        current_day_count: 0 
      });
      toast.success('Daily count reset successfully');
    } catch (error) {
      console.error('Error resetting daily count:', error);
    }
  };

  // Calculate progress for the day
  const getDailyProgress = (schedule: any) => {
    if (!schedule.daily_quota) return 0;
    return Math.min((schedule.current_day_count / schedule.daily_quota) * 100, 100);
  };

  // Get status color based on progress
  const getStatusColor = (schedule: any) => {
    const progress = getDailyProgress(schedule);
    if (!schedule.is_active) return 'bg-gray-500';
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  // Daily theme configuration based on your 7-day plan
  const dailyThemes = [
    { day: 'Monday', theme: 'Onboarding + Learning Tips', bots: ['Nikki', 'Shelly', 'Zoya'] },
    { day: 'Tuesday', theme: 'Job Matching + Resume', bots: ['Raj', 'Ishaan', 'Arjun'] },
    { day: 'Wednesday', theme: 'Mentorship + Community', bots: ['Meera', 'Ananya', 'Sana'] },
    { day: 'Thursday', theme: 'Interview + Upskilling', bots: ['Ishaan', 'Zoya', 'Nikki'] },
    { day: 'Friday', theme: 'Social Growth + App Support', bots: ['Sana', 'Arjun', 'Shelly'] },
    { day: 'Saturday', theme: 'Career Planning + FAQs', bots: ['Meera', 'Raj', 'Shelly'] },
    { day: 'Sunday', theme: 'Course Discovery + Engagement', bots: ['Nikki', 'Sana', 'Ananya'] }
  ];

  const currentDayTheme = dailyThemes[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Content Generation Scheduler</h2>
          <p className="text-muted-foreground">
            Automated content generation with 7-day theme rotation
          </p>
        </div>
        <Button 
          onClick={handleTriggerManualGeneration}
          disabled={triggerGeneration.isPending}
        >
          <Play className="mr-2 h-4 w-4" />
          Trigger Manual Generation
        </Button>
      </div>

      {/* Current Day Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Today's Theme: {currentDayTheme.theme}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-muted-foreground">Featured Bots</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentDayTheme.bots.map((botName) => (
                  <Badge key={botName} variant="outline">
                    {botName}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Schedule Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${activeSchedule ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {activeSchedule ? 'Running' : 'Stopped'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeSchedule ? 'Auto-generation active' : 'Manual mode only'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSchedule ? `${activeSchedule.current_day_count}/${activeSchedule.daily_quota}` : '0/0'}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${getStatusColor(activeSchedule)}`}
                style={{ width: `${activeSchedule ? getDailyProgress(activeSchedule) : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBots.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for generation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {activeSchedule ? (
                activeSchedule.next_run_at ? 
                  new Date(activeSchedule.next_run_at).toLocaleTimeString() : 
                  'Every 15 minutes'
              ) : 'Disabled'}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeSchedule ? activeSchedule.cron_expression : 'No schedule active'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Schedule Configuration */}
      {schedules.map((schedule) => (
        <Card key={schedule.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {schedule.schedule_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Last run: {schedule.last_run_at ? 
                    new Date(schedule.last_run_at).toLocaleString() : 
                    'Never'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={schedule.is_active}
                  onCheckedChange={(checked) => handleToggleSchedule(schedule.id, checked)}
                />
                <span className="text-sm">
                  {schedule.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`quota-${schedule.id}`}>Daily Quota</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id={`quota-${schedule.id}`}
                    type="number"
                    value={schedule.daily_quota}
                    onChange={(e) => handleUpdateQuota(schedule.id, parseInt(e.target.value))}
                    min="1"
                    max="1000"
                    className="w-24"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleResetDailyCount(schedule.id)}
                  >
                    Reset Count
                  </Button>
                </div>
              </div>

              <div>
                <Label>Cron Expression</Label>
                <div className="mt-1">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {schedule.cron_expression}
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Every 15 minutes
                  </p>
                </div>
              </div>

              <div>
                <Label>Generation Config</Label>
                <div className="mt-1 text-sm">
                  <p>Templates per run: {schedule.generation_config?.templates_per_run || 7}</p>
                  <p>SEO Optimization: {schedule.generation_config?.seo_optimization ? 'Yes' : 'No'}</p>
                  <p>Variation: {schedule.generation_config?.variation_enabled ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Daily Progress</span>
                <span>{schedule.current_day_count}/{schedule.daily_quota} posts</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${getStatusColor(schedule)}`}
                  style={{ width: `${getDailyProgress(schedule)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Manual Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Manual Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Select Bots (optional)</Label>
              <Select 
                value={manualConfig.botIds.length > 0 ? manualConfig.botIds[0] : ''}
                onValueChange={(value) => setManualConfig({
                  ...manualConfig,
                  botIds: value ? [value] : []
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All active bots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All active bots</SelectItem>
                  {activeBots.map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      {bot.name} - {bot.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="template-count">Template Count</Label>
              <Input
                id="template-count"
                type="number"
                value={manualConfig.templateCount}
                onChange={(e) => setManualConfig({
                  ...manualConfig,
                  templateCount: parseInt(e.target.value) || 10
                })}
                min="1"
                max="50"
                className="w-24"
              />
            </div>
          </div>

          <Button 
            onClick={handleTriggerManualGeneration}
            disabled={triggerGeneration.isPending}
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            {triggerGeneration.isPending ? 'Generating...' : 'Generate Content Now'}
          </Button>
        </CardContent>
      </Card>

      {/* 7-Day Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Content Theme Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyThemes.map((theme, index) => (
              <div 
                key={theme.day} 
                className={`p-4 rounded-lg border ${
                  index === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) ? 
                  'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <h4 className="font-medium">{theme.day}</h4>
                <p className="text-sm text-muted-foreground mb-2">{theme.theme}</p>
                <div className="flex flex-wrap gap-1">
                  {theme.bots.map((botName) => (
                    <Badge key={botName} variant="secondary" className="text-xs">
                      {botName}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};