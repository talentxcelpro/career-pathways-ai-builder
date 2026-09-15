
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  month: string;
  views: number;
  connections: number;
}

interface ProfileViewsChartProps {
  chartData: ChartData[];
}

export const ProfileViewsChart = ({ chartData }: ProfileViewsChartProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Profile Views Over Time</CardTitle>
        <CardDescription>Track how your profile visibility changes over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-12 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm mb-2"
                style={{ height: `${(data.views / 200) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-600">{data.month}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
