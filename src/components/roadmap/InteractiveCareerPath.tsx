import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Path, Text } from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Target, 
  Trophy, 
  Calendar, 
  Users, 
  BookOpen, 
  ArrowRight,
  RotateCcw,
  Download,
  Expand
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CareerNode {
  id: string;
  title: string;
  level: number;
  position: { x: number; y: number };
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  duration: string;
  skills: string[];
  confidence?: number;
  match?: number;
}

interface InteractiveCareerPathProps {
  title: string;
  description: string;
  nodes: CareerNode[];
  currentNodeId: string;
  onNodeClick?: (nodeId: string) => void;
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
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 500,
      backgroundColor: '#f8fafc',
      selection: false,
    });

    setFabricCanvas(canvas);
    
    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    // Clear canvas
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#f8fafc';

    // Draw connections between nodes
    for (let i = 0; i < nodes.length - 1; i++) {
      const currentNode = nodes[i];
      const nextNode = nodes[i + 1];
      
      const line = new Path(
        `M ${currentNode.position.x + 60} ${currentNode.position.y + 30} 
         Q ${(currentNode.position.x + nextNode.position.x) / 2 + 60} ${currentNode.position.y + 15}
         ${nextNode.position.x + 60} ${nextNode.position.y + 30}`,
        {
          stroke: currentNode.status === 'completed' ? '#10b981' : '#e5e7eb',
          strokeWidth: 3,
          fill: '',
          selectable: false,
          strokeDashArray: currentNode.status === 'upcoming' ? [5, 5] : undefined,
        }
      );
      
      fabricCanvas.add(line);
    }

    // Draw nodes
    nodes.forEach((node) => {
      const nodeGroup = new Path('', {
        selectable: true,
        hoverCursor: 'pointer',
        moveCursor: 'pointer',
      });

      // Node circle
      const circle = new Circle({
        radius: 30,
        left: node.position.x,
        top: node.position.y,
        fill: getNodeColor(node.status),
        stroke: node.id === currentNodeId ? '#3b82f6' : '#e5e7eb',
        strokeWidth: node.id === currentNodeId ? 4 : 2,
        selectable: false,
        shadow: {
          color: 'rgba(0,0,0,0.1)',
          blur: 10,
          offsetX: 2,
          offsetY: 2,
          affectStroke: false,
          includeDefaultValues: true,
          nonScaling: false
        }
      });

      // Node icon/number
      const nodeText = new Text((nodes.indexOf(node) + 1).toString(), {
        left: node.position.x + 22,
        top: node.position.y + 15,
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#ffffff',
        selectable: false,
        textAlign: 'center',
      });

      // Node title
      const titleText = new Text(node.title, {
        left: node.position.x + 70,
        top: node.position.y + 10,
        fontSize: 14,
        fontWeight: '600',
        fill: '#1f2937',
        selectable: false,
        width: 140,
      });

      // Duration badge
      const durationText = new Text(node.duration, {
        left: node.position.x + 70,
        top: node.position.y + 35,
        fontSize: 12,
        fill: '#6b7280',
        selectable: false,
      });

      fabricCanvas.add(circle, nodeText, titleText, durationText);

      // Add click handler
      circle.on('mousedown', () => {
        setSelectedNode(node);
        onNodeClick?.(node.id);
      });
    });

    fabricCanvas.renderAll();
  }, [fabricCanvas, nodes, currentNodeId, onNodeClick]);

  const getNodeColor = (status: CareerNode['status']) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'current': return '#3b82f6';
      case 'upcoming': return '#f59e0b';
      case 'locked': return '#9ca3af';
      default: return '#e5e7eb';
    }
  };

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

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {title}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetCanvas}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCanvas}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex">
          {/* Canvas Area */}
          <div className={cn(
            "flex-1 relative",
            isFullscreen ? "h-screen" : "h-[500px]"
          )}>
            <canvas 
              ref={canvasRef}
              className="border-r border-slate-200"
            />
            
            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Status Legend</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Upcoming</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>Locked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Node Details Panel */}
          {selectedNode && (
            <div className="w-80 bg-slate-50 border-l border-slate-200 p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getNodeColor(selectedNode.status) }}
                    ></div>
                    <h3 className="font-semibold text-slate-800">{selectedNode.title}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Level {selectedNode.level}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Duration: {selectedNode.duration}</span>
                  </div>

                  {selectedNode.confidence && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">AI Confidence</span>
                        <span className="font-medium">{selectedNode.confidence}%</span>
                      </div>
                      <Progress value={selectedNode.confidence} className="h-2" />
                    </div>
                  )}

                  {selectedNode.match && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Profile Match</span>
                        <span className="font-medium">{selectedNode.match}%</span>
                      </div>
                      <Progress value={selectedNode.match} className="h-2" />
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  disabled={selectedNode.status === 'locked'}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {selectedNode.status === 'current' ? 'Continue Learning' : 'View Details'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};