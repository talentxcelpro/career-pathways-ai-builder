import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  MapPin, 
  Target, 
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Lightbulb,
  Trash2,
  Edit,
  Save,
  X,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CareerNode {
  id: string;
  title: string;
  description: string;
  type: 'current' | 'milestone' | 'goal' | 'skill' | 'experience';
  status: 'completed' | 'in_progress' | 'planned' | 'blocked';
  timeframe: string;
  requirements: string[];
  skills: string[];
  position: { x: number; y: number };
  connections: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: string;
  completionDate?: Date;
  startDate?: Date;
}

interface CareerPath {
  id: string;
  name: string;
  description: string;
  totalNodes: number;
  completedNodes: number;
  estimatedTimeToCompletion: string;
  industry: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

const sampleNodes: CareerNode[] = [
  {
    id: '1',
    title: 'Current Position',
    description: 'Software Developer at TechCorp',
    type: 'current',
    status: 'completed',
    timeframe: 'Now',
    requirements: [],
    skills: ['JavaScript', 'React', 'Node.js'],
    position: { x: 100, y: 200 },
    connections: ['2', '3'],
    difficulty: 'medium',
    priority: 'medium',
    estimatedDuration: 'Current',
    completionDate: new Date()
  },
  {
    id: '2',
    title: 'Learn Cloud Architecture',
    description: 'Master AWS/Azure cloud services and architecture patterns',
    type: 'skill',
    status: 'in_progress',
    timeframe: '3-6 months',
    requirements: ['AWS Fundamentals', 'System Design Knowledge'],
    skills: ['AWS', 'Azure', 'Cloud Architecture', 'DevOps'],
    position: { x: 300, y: 150 },
    connections: ['4'],
    difficulty: 'hard',
    priority: 'high',
    estimatedDuration: '4 months',
    startDate: new Date()
  },
  {
    id: '3',
    title: 'Team Leadership Experience',
    description: 'Lead a development team of 3-5 engineers',
    type: 'experience',
    status: 'planned',
    timeframe: '6-12 months',
    requirements: ['Management Training', 'Mentoring Skills'],
    skills: ['Leadership', 'Team Management', 'Project Planning'],
    position: { x: 300, y: 250 },
    connections: ['4'],
    difficulty: 'medium',
    priority: 'high',
    estimatedDuration: '8 months'
  },
  {
    id: '4',
    title: 'Senior Software Engineer',
    description: 'Promotion to senior engineering role',
    type: 'milestone',
    status: 'planned',
    timeframe: '12-18 months',
    requirements: ['Technical Leadership', 'Cloud Expertise', 'Team Experience'],
    skills: ['Advanced Programming', 'Architecture Design', 'Mentoring'],
    position: { x: 500, y: 200 },
    connections: ['5'],
    difficulty: 'hard',
    priority: 'critical',
    estimatedDuration: '6 months'
  },
  {
    id: '5',
    title: 'Engineering Manager',
    description: 'Transition to engineering management role',
    type: 'goal',
    status: 'planned',
    timeframe: '2-3 years',
    requirements: ['Leadership Experience', 'Business Acumen', 'Technical Expertise'],
    skills: ['People Management', 'Strategic Planning', 'Budget Management'],
    position: { x: 700, y: 200 },
    connections: [],
    difficulty: 'hard',
    priority: 'critical',
    estimatedDuration: '1 year'
  }
];

const getNodeColor = (type: CareerNode['type'], status: CareerNode['status']) => {
  if (status === 'completed') return 'bg-green-100 border-green-300 text-green-800';
  if (status === 'in_progress') return 'bg-blue-100 border-blue-300 text-blue-800';
  if (status === 'blocked') return 'bg-red-100 border-red-300 text-red-800';
  
  switch (type) {
    case 'current': return 'bg-primary/10 border-primary text-primary';
    case 'milestone': return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'goal': return 'bg-purple-100 border-purple-300 text-purple-800';
    case 'skill': return 'bg-cyan-100 border-cyan-300 text-cyan-800';
    case 'experience': return 'bg-orange-100 border-orange-300 text-orange-800';
    default: return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};

const getStatusIcon = (status: CareerNode['status']) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
    case 'blocked': return <X className="h-4 w-4 text-red-600" />;
    default: return <Target className="h-4 w-4 text-gray-600" />;
  }
};

const getPriorityColor = (priority: CareerNode['priority']) => {
  switch (priority) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export const InteractiveRoadmapBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<CareerNode[]>(sampleNodes);
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNode, setNewNode] = useState<Partial<CareerNode>>({
    title: '',
    description: '',
    type: 'milestone',
    status: 'planned',
    timeframe: '',
    requirements: [],
    skills: [],
    difficulty: 'medium',
    priority: 'medium',
    estimatedDuration: ''
  });

  const handleNodeClick = useCallback((node: CareerNode) => {
    setSelectedNode(node);
    setIsEditMode(false);
  }, []);

  const handleAddNode = () => {
    if (newNode.title && newNode.description) {
      const node: CareerNode = {
        id: Math.random().toString(36).substr(2, 9),
        title: newNode.title!,
        description: newNode.description!,
        type: newNode.type as CareerNode['type'],
        status: newNode.status as CareerNode['status'],
        timeframe: newNode.timeframe!,
        requirements: newNode.requirements || [],
        skills: newNode.skills || [],
        position: { x: 300 + Math.random() * 200, y: 150 + Math.random() * 200 },
        connections: [],
        difficulty: newNode.difficulty as CareerNode['difficulty'],
        priority: newNode.priority as CareerNode['priority'],
        estimatedDuration: newNode.estimatedDuration!
      };
      
      setNodes(prev => [...prev, node]);
      setNewNode({
        title: '',
        description: '',
        type: 'milestone',
        status: 'planned',
        timeframe: '',
        requirements: [],
        skills: [],
        difficulty: 'medium',
        priority: 'medium',
        estimatedDuration: ''
      });
      setIsAddingNode(false);
    }
  };

  const handleUpdateNodeStatus = (nodeId: string, newStatus: CareerNode['status']) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { 
            ...node, 
            status: newStatus,
            completionDate: newStatus === 'completed' ? new Date() : undefined
          }
        : node
    ));
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setSelectedNode(null);
  };

  const calculateProgress = () => {
    const totalNodes = nodes.length;
    const completedNodes = nodes.filter(n => n.status === 'completed').length;
    const inProgressNodes = nodes.filter(n => n.status === 'in_progress').length;
    
    return {
      total: totalNodes,
      completed: completedNodes,
      inProgress: inProgressNodes,
      percentage: totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0
    };
  };

  const progress = calculateProgress();

  const renderConnections = () => {
    return nodes.map(node => 
      node.connections.map(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (!targetNode) return null;

        return (
          <svg
            key={`${node.id}-${targetId}`}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <line
              x1={node.position.x + 100}
              y1={node.position.y + 50}
              x2={targetNode.position.x + 10}
              y2={targetNode.position.y + 50}
              stroke="#e5e7eb"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#e5e7eb"
                />
              </marker>
            </defs>
          </svg>
        );
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Career Roadmap Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{progress.total}</p>
              <p className="text-sm text-muted-foreground">Total Milestones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{progress.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{progress.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(progress.percentage)}%</p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <Button 
          onClick={() => setIsAddingNode(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Milestone
        </Button>
        <Button variant="outline">
          <Lightbulb className="h-4 w-4 mr-2" />
          AI Suggestions
        </Button>
        <Button variant="outline">
          <Save className="h-4 w-4 mr-2" />
          Save Roadmap
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roadmap Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Career Roadmap Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden border">
                {renderConnections()}
                
                {nodes.map((node) => (
                  <motion.div
                    key={node.id}
                    className={`absolute w-48 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${getNodeColor(node.type, node.status)}`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      zIndex: 10
                    }}
                    onClick={() => handleNodeClick(node)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(node.status)}
                        <Badge variant="outline" className="text-xs">
                          {node.type}
                        </Badge>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(node.priority)}`} />
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">{node.title}</h4>
                    <p className="text-xs opacity-80 line-clamp-2">{node.description}</p>
                    
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span>{node.timeframe}</span>
                      <span className="font-medium">{node.estimatedDuration}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Node Details/Add Node Panel */}
        <div className="space-y-4">
          {selectedNode && !isAddingNode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(selectedNode.status)}
                    {selectedNode.title}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setIsEditMode(!isEditMode)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteNode(selectedNode.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium">Type</p>
                    <Badge className={getNodeColor(selectedNode.type, selectedNode.status)}>
                      {selectedNode.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">Priority</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedNode.priority)}`} />
                      <span className="capitalize">{selectedNode.priority}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Timeline</p>
                    <p>{selectedNode.timeframe}</p>
                  </div>
                  <div>
                    <p className="font-medium">Duration</p>
                    <p>{selectedNode.estimatedDuration}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['planned', 'in_progress', 'completed', 'blocked'] as const).map(status => (
                      <Button
                        key={status}
                        size="sm"
                        variant={selectedNode.status === status ? 'default' : 'outline'}
                        onClick={() => handleUpdateNodeStatus(selectedNode.id, status)}
                      >
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedNode.requirements.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-2">Requirements</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.requirements.map((req, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.skills.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isAddingNode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Add New Milestone
                  <Button size="sm" variant="ghost" onClick={() => setIsAddingNode(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newNode.title || ''}
                    onChange={(e) => setNewNode(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter milestone title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newNode.description || ''}
                    onChange={(e) => setNewNode(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this milestone"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newNode.type}
                      onChange={(e) => setNewNode(prev => ({ ...prev, type: e.target.value as CareerNode['type'] }))}
                    >
                      <option value="milestone">Milestone</option>
                      <option value="skill">Skill</option>
                      <option value="experience">Experience</option>
                      <option value="goal">Goal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newNode.priority}
                      onChange={(e) => setNewNode(prev => ({ ...prev, priority: e.target.value as CareerNode['priority'] }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Timeframe</label>
                    <Input
                      value={newNode.timeframe || ''}
                      onChange={(e) => setNewNode(prev => ({ ...prev, timeframe: e.target.value }))}
                      placeholder="e.g., 3-6 months"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Duration</label>
                    <Input
                      value={newNode.estimatedDuration || ''}
                      onChange={(e) => setNewNode(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                      placeholder="e.g., 4 months"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddNode} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingNode(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span className="font-medium">{Math.round(progress.percentage)}%</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Est. Time to Completion</span>
                <span className="font-medium">18 months</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Critical Path Items</span>
                <span className="font-medium text-red-600">
                  {nodes.filter(n => n.priority === 'critical').length}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Skills to Develop</span>
                <span className="font-medium text-blue-600">
                  {nodes.filter(n => n.type === 'skill' && n.status !== 'completed').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};