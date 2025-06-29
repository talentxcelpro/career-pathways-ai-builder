
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  FileText, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle,
  Plus,
  Edit,
  Eye
} from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const SEOContentCalendar = () => {
  const [view, setView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const contentEvents = [
    {
      id: 1,
      title: 'Launch "Remote Work Jobs" Landing Page',
      start: new Date(2024, 0, 15),
      end: new Date(2024, 0, 15),
      type: 'landing-page',
      status: 'completed',
      priority: 'high',
      estimatedTraffic: 5000,
      keywords: ['remote jobs', 'work from home', 'remote work'],
    },
    {
      id: 2,
      title: 'Update Salary Data for Tech Roles',
      start: new Date(2024, 0, 18),
      end: new Date(2024, 0, 18),
      type: 'content-update',
      status: 'in-progress',
      priority: 'medium',
      estimatedTraffic: 2000,
      keywords: ['tech salaries', 'software engineer salary', 'developer pay'],
    },
    {
      id: 3,
      title: 'Create "AI Jobs in India" Blog Post',
      start: new Date(2024, 0, 22),
      end: new Date(2024, 0, 22),
      type: 'blog-post',
      status: 'planned',
      priority: 'high',
      estimatedTraffic: 8000,
      keywords: ['AI jobs', 'artificial intelligence careers', 'machine learning jobs'],
    },
    {
      id: 4,
      title: 'Optimize Meta Tags for Job Category Pages',
      start: new Date(2024, 0, 25),
      end: new Date(2024, 0, 25),
      type: 'seo-optimization',
      status: 'planned',
      priority: 'medium',
      estimatedTraffic: 3000,
      keywords: ['job categories', 'software jobs', 'engineering jobs'],
    },
    {
      id: 5,
      title: 'Launch "Startup Jobs in Bangalore" Page',
      start: new Date(2024, 0, 28),
      end: new Date(2024, 0, 28),
      type: 'landing-page',
      status: 'planned',
      priority: 'high',
      estimatedTraffic: 6000,
      keywords: ['startup jobs bangalore', 'bangalore startups', 'tech startups'],
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Research trending keywords for Q1',
      dueDate: '2024-01-30',
      type: 'research',
      priority: 'high',
      assignee: 'SEO Team'
    },
    {
      id: 2,
      title: 'Create FAQ sections for top 10 job pages',
      dueDate: '2024-02-05',
      type: 'content-creation',
      priority: 'medium',
      assignee: 'Content Team'
    },
    {
      id: 3,
      title: 'Update company profiles with new data',
      dueDate: '2024-02-10',
      type: 'data-update',
      priority: 'low',
      assignee: 'Data Team'
    },
    {
      id: 4,
      title: 'Optimize images for Core Web Vitals',
      dueDate: '2024-02-15',
      type: 'technical-seo',
      priority: 'high',
      assignee: 'Dev Team'
    },
  ];

  const contentIdeas = [
    {
      title: 'Complete Guide to Software Engineer Interviews',
      type: 'Guide',
      estimatedTraffic: 12000,
      difficulty: 'Medium',
      keywords: ['software engineer interview', 'coding interview', 'tech interview'],
      competition: 'Low'
    },
    {
      title: 'Highest Paying Tech Companies in India 2024',
      type: 'List',
      estimatedTraffic: 18000,
      difficulty: 'Easy',
      keywords: ['highest paying tech companies', 'best tech companies india', 'tech company salaries'],
      competition: 'Medium'
    },
    {
      title: 'How to Switch from Non-Tech to Tech Career',
      type: 'Guide',
      estimatedTraffic: 8000,
      difficulty: 'Medium',
      keywords: ['career switch to tech', 'non-tech to tech', 'career transition'],
      competition: 'Low'
    },
    {
      title: 'Remote Work Benefits and Challenges in 2024',
      type: 'Article',
      estimatedTraffic: 6000,
      difficulty: 'Easy',
      keywords: ['remote work benefits', 'work from home', 'remote work challenges'],
      competition: 'High'
    },
  ];

  const getEventColor = (type) => {
    const colors = {
      'landing-page': '#3B82F6',
      'blog-post': '#10B981',
      'content-update': '#F59E0B',
      'seo-optimization': '#8B5CF6',
    };
    return colors[type] || '#6B7280';
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'default',
      'in-progress': 'secondary',
      'planned': 'outline',
    };
    return colors[status] || 'outline';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'destructive',
      'medium': 'secondary',
      'low': 'outline',
    };
    return colors[priority] || 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            SEO Content Calendar
          </h2>
          <p className="text-gray-600">Plan and track your SEO content strategy</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>Scheduled content creation and optimization tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: '500px' }}>
                <Calendar
                  localizer={localizer}
                  events={contentEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={(event) => setSelectedEvent(event)}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: getEventColor(event.type),
                      borderColor: getEventColor(event.type),
                    },
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>Due: {task.dueDate}</p>
                      <p>Assignee: {task.assignee}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Content Published</span>
                  <span className="font-semibold">8 pieces</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Traffic</span>
                  <span className="font-semibold">45K visits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Keywords Targeted</span>
                  <span className="font-semibold">120 terms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages Optimized</span>
                  <span className="font-semibold">25 pages</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Ideas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Content Ideas & Opportunities
          </CardTitle>
          <CardDescription>AI-suggested content based on keyword research and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentIdeas.map((idea, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{idea.title}</h4>
                    <Badge variant="outline" className="mt-1">{idea.type}</Badge>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-green-600">{idea.estimatedTraffic.toLocaleString()}</p>
                    <p className="text-gray-600">Est. Traffic</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty</span>
                    <span>{idea.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Competition</span>
                    <span>{idea.competition}</span>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {idea.keywords.slice(0, 2).map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{keyword}</Badge>
                      ))}
                      {idea.keywords.length > 2 && (
                        <Badge variant="secondary" className="text-xs">+{idea.keywords.length - 2}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Plus className="h-3 w-3 mr-1" />
                    Schedule
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    Research
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
