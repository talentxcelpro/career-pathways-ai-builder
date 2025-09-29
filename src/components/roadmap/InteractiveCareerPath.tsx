import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, Clock, Star, TrendingUp, Zap, Calendar, ArrowRight, RotateCcw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CareerNode {
  id: string;
  title: string;
  level: number;
  position: { x: number; y: number };
  status: 'completed' | 'current' | 'upcoming';
  duration: string;
  skills: string[];
  confidence: number;
  match: number;
}

interface InteractiveCareerPathProps {
  title: string;
  description: string;
  nodes: CareerNode[];
  currentNodeId: string;
  onNodeClick: (nodeId: string) => void;
  className?: string;
}

export const InteractiveCareerPath: React.FC<InteractiveCareerPathProps> = ({
  title,
  description,
  nodes,
  currentNodeId,
  onNodeClick,
  className
}) => {
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleNodeClick = (node: CareerNode) => {
    setSelectedNode(node);
    onNodeClick(node.id);
  };

  const resetCanvas = () => {
    setSelectedNode(null);
  };

  const downloadPath = () => {
    console.log('Download path functionality');
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'current': return 'bg-blue-500';
      case 'upcoming': return 'bg-gray-400';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetCanvas}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPath}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Simplified Career Path Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nodes.map((node, index) => (
              <div
                key={node.id}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                  node.id === currentNodeId ? "border-blue-500 bg-blue-50" : "border-gray-200",
                  "relative"
                )}
                onClick={() => handleNodeClick(node)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-bold", getNodeColor(node.status))}>
                    {node.level}
                  </div>
                  <Badge variant={node.status === 'completed' ? 'default' : node.status === 'current' ? 'secondary' : 'outline'}>
                    {node.status}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-gray-800 mb-2">{node.title}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {node.duration}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="h-4 w-4 mr-1" />
                    Match: {node.match}%
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Brain className="h-4 w-4 mr-1" />
                      Confidence: {node.confidence}%
                    </div>
                    <Progress value={node.confidence} className="h-2" />
                  </div>
                </div>
                
                {index < nodes.length - 1 && (
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 hidden md:block">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Selected Node Details */}
          {selectedNode && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">{selectedNode.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Progress Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Duration:</span>
                        <span>{selectedNode.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Match Score:</span>
                        <span>{selectedNode.match}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Confidence:</span>
                        <span>{selectedNode.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};