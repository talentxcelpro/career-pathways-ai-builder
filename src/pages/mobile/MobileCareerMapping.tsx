import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCareerMapManagement } from '@/hooks/useCareerMapManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Target, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Briefcase, 
  GraduationCap,
  MapPin,
  Clock,
  Star,
  Users,
  ChevronRight,
  Plus,
  Brain,
  Rocket,
  BarChart,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  MoreVertical,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Career stage node types
const CareerStageNode = ({ data }: { data: any }) => (
  <div className={cn(
    "bg-white border-2 rounded-lg p-3 min-w-[180px] text-center shadow-lg",
    data.current ? "border-primary bg-primary/5" : "border-border",
    data.completed ? "border-green-500 bg-green-50" : ""
  )}>
    <div className="flex items-center justify-center mb-2">
      {data.icon}
    </div>
    <h3 className="font-semibold text-sm mb-1">{data.title}</h3>
    <p className="text-xs text-muted-foreground mb-2">{data.description}</p>
    {data.progress !== undefined && (
      <Progress value={data.progress} className="h-1 mb-2" />
    )}
    <div className="flex items-center justify-center gap-1">
      {data.skills?.slice(0, 2).map((skill: string, index: number) => (
        <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
          {skill}
        </Badge>
      ))}
    </div>
  </div>
);

// Skill node component
const SkillNode = ({ data }: { data: any }) => (
  <div className={cn(
    "bg-white border rounded-full px-3 py-1 text-xs font-medium shadow-md",
    data.level === 'expert' ? "border-green-500 bg-green-50" :
    data.level === 'intermediate' ? "border-blue-500 bg-blue-50" :
    "border-orange-500 bg-orange-50"
  )}>
    {data.label}
  </div>
);

const nodeTypes = {
  careerStage: CareerStageNode,
  skill: SkillNode,
};

// Initial nodes for career path
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'careerStage',
    position: { x: 50, y: 50 },
    data: {
      title: 'Entry Level',
      description: 'Junior Developer',
      current: false,
      completed: true,
      progress: 100,
      skills: ['HTML', 'CSS', 'JavaScript'],
      icon: <GraduationCap className="h-6 w-6 text-green-500" />
    },
  },
  {
    id: '2',
    type: 'careerStage',
    position: { x: 300, y: 50 },
    data: {
      title: 'Mid-Level',
      description: 'Frontend Developer',
      current: true,
      completed: false,
      progress: 65,
      skills: ['React', 'TypeScript', 'Node.js'],
      icon: <Briefcase className="h-6 w-6 text-blue-500" />
    },
  },
  {
    id: '3',
    type: 'careerStage',
    position: { x: 550, y: 50 },
    data: {
      title: 'Senior Level',
      description: 'Senior Developer',
      current: false,
      completed: false,
      progress: 25,
      skills: ['Architecture', 'Mentoring', 'Strategy'],
      icon: <Award className="h-6 w-6 text-purple-500" />
    },
  },
  {
    id: '4',
    type: 'careerStage',
    position: { x: 800, y: 50 },
    data: {
      title: 'Leadership',
      description: 'Tech Lead',
      current: false,
      completed: false,
      progress: 0,
      skills: ['Team Lead', 'Product', 'Vision'],
      icon: <Users className="h-6 w-6 text-orange-500" />
    },
  },
  // Skills nodes
  {
    id: 'skill-1',
    type: 'skill',
    position: { x: 150, y: 200 },
    data: { label: 'React', level: 'intermediate' },
  },
  {
    id: 'skill-2',
    type: 'skill',
    position: { x: 250, y: 200 },
    data: { label: 'TypeScript', level: 'intermediate' },
  },
  {
    id: 'skill-3',
    type: 'skill',
    position: { x: 350, y: 200 },
    data: { label: 'Node.js', level: 'beginner' },
  },
  {
    id: 'skill-4',
    type: 'skill',
    position: { x: 450, y: 200 },
    data: { label: 'AWS', level: 'beginner' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#10b981' },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#3b82f6' },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#8b5cf6' },
  },
  // Skills connections
  {
    id: 'e2-skill1',
    source: '2',
    target: 'skill-1',
    type: 'straight',
    style: { stroke: '#94a3b8', strokeDasharray: '4,4' },
  },
  {
    id: 'e2-skill2',
    source: '2',
    target: 'skill-2',
    type: 'straight',
    style: { stroke: '#94a3b8', strokeDasharray: '4,4' },
  },
  {
    id: 'e3-skill3',
    source: '3',
    target: 'skill-3',
    type: 'straight',
    style: { stroke: '#94a3b8', strokeDasharray: '4,4' },
  },
  {
    id: 'e3-skill4',
    source: '3',
    target: 'skill-4',
    type: 'straight',
    style: { stroke: '#94a3b8', strokeDasharray: '4,4' },
  },
];

export const MobileCareerMapping: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [newGoal, setNewGoal] = useState({
    target_role: '',
    current_position: '',
    timeline_months: 12,
    target_company: '',
    skills_needed: []
  });
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { careerMapStats, careerGoals, isLoading } = useCareerMapManagement();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Fetch user's roadmaps
  const { data: roadmaps = [], isLoading: roadmapsLoading } = useQuery({
    queryKey: ['user-roadmaps'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Create career goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('career_goals')
        .insert({
          ...goalData,
          user_id: user.id,
          is_active: true,
          milestones: [],
          progress_notes: ''
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Career goal created successfully!');
      setShowCreateGoal(false);
      setNewGoal({
        target_role: '',
        current_position: '',
        timeline_months: 12,
        target_company: '',
        skills_needed: []
      });
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create career goal');
    }
  });

  const careerMetrics = [
    { label: 'Total Roadmaps', value: careerMapStats?.totalRoadmaps || 0, icon: MapPin },
    { label: 'Active Goals', value: careerMapStats?.activeGoals || 0, icon: Target },
    { label: 'Career Switches', value: careerMapStats?.careerSwitches || 0, icon: TrendingUp },
    { label: 'Active Users', value: careerMapStats?.activeUsers || 0, icon: Users },
  ];

  const recommendations = [
    {
      title: 'Master System Design',
      description: 'Learn scalable architecture patterns',
      priority: 'High',
      timeToComplete: '3 months',
      type: 'skill'
    },
    {
      title: 'Lead a Project',
      description: 'Take ownership of a team project',
      priority: 'Medium',
      timeToComplete: '6 months',
      type: 'experience'
    },
    {
      title: 'AWS Certification',
      description: 'Get AWS Solutions Architect certification',
      priority: 'Medium',
      timeToComplete: '2 months',
      type: 'certification'
    },
  ];

  return (
    <MobileLayout 
      showBottomNav={true}
      className="bg-gradient-to-br from-background via-background to-muted/20"
    >
      <div className="flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="flex-1 flex flex-col space-y-4">
            {/* AI Tools Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Career Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Link to="/career-map/ai-roadmap-builder">
                  <div className="p-3 border rounded-lg text-center hover:bg-muted/50 transition-colors">
                    <Rocket className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-xs font-medium">AI Roadmap</p>
                  </div>
                </Link>
                <Link to="/career-map/skills-gap">
                  <div className="p-3 border rounded-lg text-center hover:bg-muted/50 transition-colors">
                    <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-xs font-medium">Skills Gap</p>
                  </div>
                </Link>
                <Link to="/career-map/switch">
                  <div className="p-3 border rounded-lg text-center hover:bg-muted/50 transition-colors">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-xs font-medium">Career Switch</p>
                  </div>
                </Link>
                <Link to="/career-map/my-roadmaps">
                  <div className="p-3 border rounded-lg text-center hover:bg-muted/50 transition-colors">
                    <MapPin className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-xs font-medium">My Roadmaps</p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Your Career Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 w-full">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    className="rounded-b-lg"
                    style={{ background: 'transparent' }}
                  >
                    <Background color="#e2e8f0" gap={20} />
                    <MiniMap 
                      nodeColor="#3b82f6"
                      nodeStrokeWidth={2}
                      className="!bg-white/80 !border !border-border !rounded-lg"
                    />
                  </ReactFlow>
                </div>
              </CardContent>
            </Card>

            {/* My Roadmaps Section */}
            {roadmaps.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-primary" />
                      My Roadmaps
                    </CardTitle>
                    <Link to="/career-map/my-roadmaps">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScrollArea className="h-40">
                    {roadmaps.slice(0, 3).map((roadmap) => (
                      <div key={roadmap.id} className="flex items-start justify-between p-3 border rounded-lg mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{roadmap.title}</h4>
                          <p className="text-xs text-muted-foreground mb-1">{roadmap.current_position} → {roadmap.target_role}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={roadmap.progress_percentage || 0} className="h-1 flex-1" />
                            <span className="text-xs text-muted-foreground">{roadmap.progress_percentage || 0}%</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/career-map/${roadmap.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={rec.priority === 'High' ? 'destructive' : 'secondary'} 
                          className="text-xs px-1 py-0"
                        >
                          {rec.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{rec.timeToComplete}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {careerMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-4 text-center">
                    <metric.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                    <p className="font-semibold text-sm">{metric.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Skill Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { skill: 'React', level: 85, color: 'bg-blue-500' },
                  { skill: 'TypeScript', level: 70, color: 'bg-green-500' },
                  { skill: 'Node.js', level: 45, color: 'bg-orange-500' },
                  { skill: 'System Design', level: 25, color: 'bg-purple-500' },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.skill}</span>
                      <span className="text-sm text-muted-foreground">{item.level}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={cn("h-2 rounded-full transition-all duration-500", item.color)}
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="flex-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Career Goals
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCreateGoal(!showCreateGoal)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Goal
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showCreateGoal && (
                  <div className="p-4 border rounded-lg space-y-3 bg-muted/20">
                    <h4 className="font-medium text-sm">Create New Goal</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="target_role" className="text-xs">Target Role</Label>
                        <Input
                          id="target_role"
                          placeholder="e.g., Senior Developer"
                          value={newGoal.target_role}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, target_role: e.target.value }))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="current_position" className="text-xs">Current Position</Label>
                        <Input
                          id="current_position"
                          placeholder="e.g., Junior Developer"
                          value={newGoal.current_position}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, current_position: e.target.value }))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="timeline" className="text-xs">Timeline (months)</Label>
                        <Input
                          id="timeline"
                          type="number"
                          min="1"
                          max="60"
                          value={newGoal.timeline_months}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, timeline_months: parseInt(e.target.value) || 12 }))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="target_company" className="text-xs">Target Company (Optional)</Label>
                        <Input
                          id="target_company"
                          placeholder="e.g., Google, Microsoft"
                          value={newGoal.target_company}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, target_company: e.target.value }))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => createGoalMutation.mutate(newGoal)}
                          disabled={!newGoal.target_role || !newGoal.current_position || createGoalMutation.isPending}
                          className="text-xs"
                        >
                          {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowCreateGoal(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <ScrollArea className="h-64">
                  {isLoading ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Loading goals...
                    </div>
                  ) : careerGoals.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">No career goals yet</p>
                      <p className="text-xs text-muted-foreground">Create your first goal to start tracking your progress</p>
                    </div>
                  ) : (
                    careerGoals.map((goal) => (
                      <div key={goal.id} className="p-3 border rounded-lg mb-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{goal.target_role}</h4>
                            <p className="text-xs text-muted-foreground">
                              From {goal.current_position}
                            </p>
                            {goal.target_company && (
                              <p className="text-xs text-muted-foreground">
                                at {goal.target_company}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={goal.is_active ? "default" : "secondary"} 
                                className="text-xs px-1 py-0"
                              >
                                {goal.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {goal.timeline_months} months
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Goal
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this goal?')) {
                                    // Add delete functionality here
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created {new Date(goal.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};