
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ExternalLink } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface SourceData {
  source: string;
  applications: number;
  hires: number;
  conversionRate: number;
  cost: number;
  color: string;
}

export const SourceAttributionWidget = () => {
  const navigate = useNavigate();
  
  const sourceData: SourceData[] = [
    { source: 'Direct Apply', applications: 45, hires: 8, conversionRate: 17.8, cost: 0, color: '#3B82F6' },
    { source: 'LinkedIn', applications: 32, hires: 4, conversionRate: 12.5, cost: 1200, color: '#10B981' },
    { source: 'Job Boards', applications: 28, hires: 3, conversionRate: 10.7, cost: 800, color: '#F59E0B' },
    { source: 'Referrals', applications: 15, hires: 5, conversionRate: 33.3, cost: 500, color: '#8B5CF6' },
    { source: 'Social Media', applications: 12, hires: 1, conversionRate: 8.3, cost: 300, color: '#EF4444' }
  ];

  const totalApplications = sourceData.reduce((sum, source) => sum + source.applications, 0);
  const totalHires = sourceData.reduce((sum, source) => sum + source.hires, 0);
  const bestSource = sourceData.reduce((best, current) => 
    current.conversionRate > best.conversionRate ? current : best
  );

  const pieData = sourceData.map(source => ({
    name: source.source,
    value: source.applications,
    color: source.color
  }));

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Source Attribution</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {totalApplications} applications • {totalHires} hires
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Best Source:</div>
            <div className="text-sm font-semibold text-violet-700">{bestSource.source}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pie Chart */}
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} applications`, 'Applications']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Source List */}
          <div className="space-y-2">
            {sourceData.slice(0, 3).map((source) => (
              <div key={source.source} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: source.color }}></div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">{source.source}</span>
                    <div className="text-xs text-slate-600">
                      {source.applications} apps • {source.hires} hires
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {source.conversionRate}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <div 
              className="flex items-center justify-center gap-2 p-2 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer"
              onClick={() => navigate('/employer/analytics/sources')}
            >
              <span className="text-sm font-semibold text-violet-700">Source Analysis</span>
              <ExternalLink className="h-3 w-3 text-violet-700" />
            </div>
            <div 
              className="flex items-center justify-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => navigate('/employer/analytics/roi')}
            >
              <span className="text-sm font-semibold text-slate-700">ROI Report</span>
              <BarChart3 className="h-3 w-3 text-slate-700" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
