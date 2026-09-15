import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentCreationStudio } from "@/components/content/ContentCreationStudio";

const ContentStudioPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Content Creation Studio</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered content creation with templates, scheduling, and performance analytics
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Professional Content Creation</CardTitle>
            <CardDescription>
              Create, schedule, and analyze your professional content with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContentCreationStudio />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentStudioPage;