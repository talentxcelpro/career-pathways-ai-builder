import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Text as FabricText, Line } from 'fabric';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>();
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: isFullscreen ? window.innerWidth : 800,
      height: isFullscreen ? window.innerHeight : 500,
      backgroundColor: '#fafafa',
      selection: false,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!fabricCanvas || nodes.length === 0) return;

    setAnimating(true);
    // Clear canvas
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#fafafa';

    // Create connections between nodes with animation
    const createConnections = () => {
      for (let i = 0; i < nodes.length - 1; i++) {
        const currentNode = nodes[i];
        const nextNode = nodes[i + 1];
        
        const line = new Line([
          currentNode.position.x + 50,
          currentNode.position.y + 25,
          nextNode.position.x,
          nextNode.position.y + 25
        ], {
          stroke: nextNode.status === 'upcoming' ? '#e5e7eb' : '#3b82f6',
          strokeWidth: 3,
          selectable: false,
          strokeDashArray: nextNode.status === 'upcoming' ? [5, 5] : [],
          opacity: 0
        });

        fabricCanvas.add(line);
      }
    };

    // Create nodes with simple styling (removed animations for stability)
    const createNodes = () => {
      nodes.forEach((node, index) => {
        const getNodeColor = () => {
          switch (node.status) {
            case 'completed': return '#10b981';
            case 'current': return '#3b82f6';
            case 'upcoming': return '#9ca3af';
            default: return '#6b7280';
          }
        };

        const circle = new Circle({
          left: node.position.x,
          top: node.position.y,
          radius: 25,
          fill: getNodeColor(),
          stroke: node.id === currentNodeId ? '#1d4ed8' : '#ffffff',
          strokeWidth: node.id === currentNodeId ? 4 : 2,
          selectable: false,
        });

        const nodeText = new FabricText(String(node.level), {
          left: node.position.x - 8,
          top: node.position.y - 8,
          fontSize: 16,
          fill: '#ffffff',
          fontWeight: 'bold',
          selectable: false,
        });

        const titleText = new FabricText(node.title, {
          left: node.position.x - 40,
          top: node.position.y + 40,
          fontSize: 12,
          fill: '#1f2937',
          fontWeight: 'bold',
          textAlign: 'center',
          selectable: false,
        });

        fabricCanvas.add(circle, nodeText, titleText);

        // Click handlers
        circle.on('mousedown', () => {
          setSelectedNode(node);
          onNodeClick(node.id);
        });

        circle.on('mouseover', () => {
          circle.set('scaleX', 1.1);
          circle.set('scaleY', 1.1);
          fabricCanvas.renderAll();
        });

        circle.on('mouseout', () => {
          circle.set('scaleX', 1);
          circle.set('scaleY', 1);
          fabricCanvas.renderAll();
        });
      });
    };

    createConnections();
    createNodes();

    fabricCanvas.renderAll();
  }, [fabricCanvas, nodes, currentNodeId, onNodeClick]);

  const resetCanvas = () => {
    if (fabricCanvas) {
      fabricCanvas.viewportTransform = [1, 0, 0, 1, 0, 0];
      fabricCanvas.renderAll();
    }
  };

  const exportCanvas = () => {
    if (fabricCanvas) {
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-roadmap.png`;
      link.href = dataURL;
      link.click();
    }
  };

  const currentNode = nodes.find(node => node.id === currentNodeId);

  return (
    <div className={cn("space-y-6 animate-fade-in", className)}>
      <Card className="border-0 shadow-apple-medium bg-white/95 backdrop-blur-apple rounded-apple overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-text-primary flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-text-secondary mt-1">{description}</p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-3 py-1 shadow-apple-light">
                <Brain className="h-3 w-3 mr-1" />
                AI Optimized
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={resetCanvas}
                className="h-8 w-8 p-0 rounded-apple-lg"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCanvas}
                className="h-8 w-8 p-0 rounded-apple-lg"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-text-primary">Interactive Career Progression</span>
            </div>
            <p className="text-xs text-text-secondary">
              Click on any node to explore detailed information and AI insights
            </p>
          </div>

          <div className="relative">
            <canvas 
              ref={canvasRef} 
              className="border border-gray-200 rounded-apple-lg shadow-apple-subtle w-full"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            
            {/* Interactive Legend */}
            <div className="absolute top-4 right-4 space-y-2">
              <div className="flex items-center gap-2 text-xs bg-white/90 backdrop-blur-sm px-3 py-2 rounded-apple-lg shadow-apple-subtle">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/90 backdrop-blur-sm px-3 py-2 rounded-apple-lg shadow-apple-subtle">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/90 backdrop-blur-sm px-3 py-2 rounded-apple-lg shadow-apple-subtle">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>Upcoming</span>
              </div>
            </div>

            {/* Loading Animation Overlay */}
            {animating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-apple-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-apple-lg flex items-center justify-center mx-auto mb-3 animate-pulse">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">Building your path...</p>
                </div>
              </div>
            )}
          </div>

          {/* Node Details Panel */}
          {selectedNode && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-apple-lg border border-blue-100 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {selectedNode.title}
                </h3>
                <div className="flex gap-2">
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    {selectedNode.confidence}% confidence
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    {selectedNode.match}% match
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                    <Clock className="h-3 w-3" />
                    Duration: {selectedNode.duration}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                    <Zap className="h-3 w-3" />
                    Status: <span className="capitalize font-medium">{selectedNode.status}</span>
                  </div>
                  
                  {/* Progress Bars */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>AI Confidence</span>
                        <span>{selectedNode.confidence}%</span>
                      </div>
                      <Progress value={selectedNode.confidence} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Profile Match</span>
                        <span>{selectedNode.match}%</span>
                      </div>
                      <Progress value={selectedNode.match} className="h-2" />
                    </div>
                  </div>
                </div>
                
                {selectedNode.skills.length > 0 && (
                  <div>
                    <p className="text-xs text-text-secondary mb-2">Key Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-white/80">
                          {skill}
                        </Badge>
                      ))}
                      {selectedNode.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-white/80">
                          +{selectedNode.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      size="sm"
                      className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-apple-lg"
                    >
                      <ArrowRight className="h-3 w-3 mr-2" />
                      {selectedNode.status === 'current' ? 'Continue Path' : 'View Details'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Progress Summary */}
          {currentNode && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-apple-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Currently: {currentNode.title}</span>
              </div>
              <p className="text-xs text-green-700">
                AI recommends focusing on {currentNode.skills.slice(0, 2).join(' and ')} to accelerate your progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};