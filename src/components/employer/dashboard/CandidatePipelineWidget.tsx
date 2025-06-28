
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface PipelineStage {
  stage: string;
  count: number;
  color: string;
  nextStage?: string;
}

interface CandidatePipelineWidgetProps {
  pipelineData?: PipelineStage[];
}

export const CandidatePipelineWidget = ({ pipelineData }: CandidatePipelineWidgetProps) => {
  const navigate = useNavigate();
  
  const defaultPipeline: PipelineStage[] = [
    { stage: "Applied", count: 42, color: "bg-blue-500", nextStage: "Shortlisted" },
    { stage: "Shortlisted", count: 18, color: "bg-yellow-500", nextStage: "Interview" },
    { stage: "Interview", count: 8, color: "bg-purple-500", nextStage: "Offered" },
    { stage: "Offered", count: 3, color: "bg-green-500", nextStage: "Hired" },
    { stage: "Hired", count: 1, color: "bg-emerald-600" },
    { stage: "Rejected", count: 12, color: "bg-red-500" }
  ];

  const pipeline = pipelineData || defaultPipeline;
  const totalCandidates = pipeline.reduce((sum, stage) => sum + stage.count, 0);
  const conversionRate = pipeline.find(s => s.stage === "Hired")?.count || 0;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Candidate Pipeline</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {totalCandidates} total candidates • {((conversionRate/totalCandidates)*100).toFixed(1)}% hire rate
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs font-semibold">+15%</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {pipeline.slice(0, 4).map((stage, index) => (
            <div 
              key={stage.stage}
              className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/employer/crm/candidates?stage=${stage.stage.toLowerCase()}`)}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                <span className="text-sm font-medium text-slate-800">{stage.stage}</span>
              </div>
              <Badge variant="secondary" className="text-xs font-semibold">
                {stage.count}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-slate-800">Rejected</span>
          </div>
          <Badge variant="outline" className="text-xs font-semibold text-red-700 border-red-200">
            {pipeline.find(s => s.stage === "Rejected")?.count || 0}
          </Badge>
        </div>

        <div className="pt-2">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/crm/candidates')}
          >
            <span className="text-sm font-semibold text-blue-700">View Full Pipeline</span>
            <ArrowRight className="h-3 w-3 text-blue-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
