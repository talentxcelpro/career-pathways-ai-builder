
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ProfileCompleteness = () => {
  const completionItems = [
    { item: "✓ Profile Photo", status: "Complete", color: "text-green-600" },
    { item: "✓ Professional Summary", status: "Complete", color: "text-green-600" },
    { item: "⚠ Video Resume", status: "Missing", color: "text-orange-600" },
    { item: "⚠ Portfolio Projects", status: "Needs More", color: "text-orange-600" }
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Profile Completeness</CardTitle>
        <CardDescription>Improve your profile to increase visibility</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Overall Completeness</span>
            <span className="text-lg font-bold text-green-600">85%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
          </div>
          
          <div className="space-y-2 mt-4">
            {completionItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{item.item}</span>
                <span className={item.color}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
