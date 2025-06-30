
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const FeaturesPreview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What happens next?</CardTitle>
        <CardDescription>Our AI will analyze and enhance your resume</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Content Extraction</h4>
              <p className="text-sm text-gray-600">AI extracts all sections including experience, education, and skills</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">ATS Optimization</h4>
              <p className="text-sm text-gray-600">Automatic formatting and keyword optimization for ATS systems</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Enhancement Suggestions</h4>
              <p className="text-sm text-gray-600">AI provides improvement suggestions for better impact</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-semibold text-sm">4</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Ready to Edit</h4>
              <p className="text-sm text-gray-600">Open in our editor with your enhanced content</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
