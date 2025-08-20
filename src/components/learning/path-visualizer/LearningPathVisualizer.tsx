import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Lock, 
  Play,
  Star,
  Trophy,
  Target
} from 'lucide-react';

// Custom Node Component
const CourseNode = ({ data }: { data: any }) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Play className="h-4 w-4 text-blue-500" />;
      case 'locked': return <Lock className="h-4 w-4 text-gray-400" />;
      default: return <BookOpen className="h-4 w-4 text-primary" />;
    }
  };

  const getNodeStyle = () => {
    const baseStyle = "border-2 rounded-lg p-4 bg-background shadow-lg min-w-[200px]";
    switch (data.status) {
      case 'completed': return `${baseStyle} border-green-500`;
      case 'in-progress': return `${baseStyle} border-blue-500`;
      case 'locked': return `${baseStyle} border-gray-300 opacity-60`;
      default: return `${baseStyle} border-primary`;
    }
  };

  return (
    <div className={getNodeStyle()}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{data.title}</h3>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {data.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {data.duration}h
            </span>
          </div>
          {data.status === 'in-progress' && (
            <Progress value={data.progress || 0} className="h-2 mb-2" />
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-xs">{data.rating}</span>
            </div>
            {data.status !== 'locked' && (
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                {data.status === 'completed' ? 'Review' : 'Continue'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  course: CourseNode,
};

interface LearningPathVisualizerProps {
  pathData: {
    id: string;
    title: string;
    description: string;
    totalCourses: number;
    completedCourses: number;
    estimatedHours: number;
    courses: Array<{
      id: string;
      title: string;
      description: string;
      duration: number;
      difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
      status: 'available' | 'in-progress' | 'completed' | 'locked';
      progress?: number;
      rating: number;
      prerequisites: string[];
      position: { x: number; y: number };
    }>;
  };
}

export const LearningPathVisualizer: React.FC<LearningPathVisualizerProps> = ({ pathData }) => {
  // Transform course data into React Flow nodes
  const initialNodes: Node[] = useMemo(() => 
    pathData.courses.map((course, index) => ({
      id: course.id,
      type: 'course',
      position: course.position,
      data: {
        title: course.title,
        duration: course.duration,
        difficulty: course.difficulty,
        status: course.status,
        progress: course.progress,
        rating: course.rating,
      },
    })), [pathData.courses]
  );

  // Create edges based on prerequisites
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    pathData.courses.forEach((course) => {
      course.prerequisites.forEach((prereqId) => {
        edges.push({
          id: `${prereqId}-${course.id}`,
          source: prereqId,
          target: course.id,
          type: 'smoothstep',
          animated: course.status === 'available',
          style: { stroke: course.status === 'locked' ? '#9CA3AF' : '#3B82F6' },
        });
      });
    });
    return edges;
  }, [pathData.courses]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const completionPercentage = Math.round((pathData.completedCourses / pathData.totalCourses) * 100);

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {pathData.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{pathData.description}</p>
          </div>
          <Badge className="bg-primary/10 text-primary">
            {completionPercentage}% Complete
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{pathData.completedCourses}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{pathData.totalCourses}</div>
            <div className="text-xs text-muted-foreground">Total Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{pathData.estimatedHours}h</div>
            <div className="text-xs text-muted-foreground">Est. Time</div>
          </div>
        </div>
        
        <Progress value={completionPercentage} className="mt-4" />
      </CardHeader>
      
      <CardContent className="p-0 h-[400px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <Controls position="top-right" />
          <Background />
          <MiniMap 
            zoomable 
            pannable 
            position="bottom-right"
            style={{ backgroundColor: 'hsl(var(--muted))' }}
          />
        </ReactFlow>
      </CardContent>
    </Card>
  );
};