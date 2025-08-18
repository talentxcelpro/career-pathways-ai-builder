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
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const careerMetrics = [
    { label: 'Current Level', value: 'Mid-Level Developer', icon: Briefcase },
    { label: 'Experience', value: '3.5 years', icon: Clock },
    { label: 'Skills Mastered', value: '12/20', icon: Star },
    { label: 'Next Milestone', value: 'Senior Developer', icon: Target },
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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Your Career Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-80 w-full">
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Current Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: 'Complete React Advanced Course',
                    progress: 75,
                    deadline: '2 weeks',
                    type: 'Learning'
                  },
                  {
                    title: 'Build Portfolio Project',
                    progress: 45,
                    deadline: '1 month',
                    type: 'Project'
                  },
                  {
                    title: 'Attend Tech Conference',
                    progress: 100,
                    deadline: 'Completed',
                    type: 'Networking'
                  },
                ].map((goal, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{goal.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {goal.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{goal.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button className="w-full" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Set New Goal
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};