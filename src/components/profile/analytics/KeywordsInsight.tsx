
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const KeywordsInsight = () => {
  const keywords = [
    { keyword: "Software Engineer", count: 45, percentage: 28 },
    { keyword: "React Developer", count: 32, percentage: 20 },
    { keyword: "Full Stack", count: 28, percentage: 17 },
    { keyword: "JavaScript", count: 24, percentage: 15 },
    { keyword: "Node.js", count: 20, percentage: 12 }
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Top Keywords</CardTitle>
        <CardDescription>Keywords that led people to your profile</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {keywords.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.keyword}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
