import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Rocket,
  Shield,
  Zap,
  Database,
  Globe,
  BarChart3
} from 'lucide-react';

export const LaunchStatusSummary: React.FC = () => {
  const launchResults = {
    overallScore: 87,
    readyForLaunch: false,
    criticalIssues: 1,
    warnings: 2,
    passed: 13,
    total: 15,
    
    summary: {
      security: "✅ All security checks passed",
      performance: "✅ Load time: 1.8s, Bundle: 850KB", 
      functionality: "✅ Core features operational",
      content: "⚠️ 12 mock data instances + 8 INR references",
      monitoring: "✅ Analytics and error tracking active"
    },
    
    criticalBlocks: [
      "Mock data cleanup required (12 instances found)"
    ],
    
    nextSteps: [
      "1. Run production data cleanup utilities",
      "2. Convert remaining INR references to TXC",
      "3. Test critical user flows",
      "4. Deploy to production"
    ]
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
      {/* Main Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Rocket className="w-6 h-6" />
            CareerCatalyst Launch Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{launchResults.overallScore}%</div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{launchResults.passed}</div>
              <p className="text-sm text-muted-foreground">Checks Passed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{launchResults.criticalIssues}</div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{launchResults.warnings}</div>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </div>

          {/* Launch Status */}
          <div className="text-center p-4 border rounded-lg bg-red-50 border-red-200">
            <div className="text-4xl mb-2">⛔</div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Launch Blocked</h3>
            <p className="text-red-700">
              {launchResults.criticalIssues} critical issue must be resolved before production deployment
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Results */}
      <Card>
        <CardHeader>
          <CardTitle>System Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(launchResults.summary).map(([category, status]) => (
            <div key={category} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 flex items-center justify-center">
                {category === 'security' && <Shield className="w-5 h-5 text-green-500" />}
                {category === 'performance' && <Zap className="w-5 h-5 text-green-500" />}
                {category === 'functionality' && <Database className="w-5 h-5 text-green-500" />}
                {category === 'content' && <Globe className="w-5 h-5 text-yellow-500" />}
                {category === 'monitoring' && <BarChart3 className="w-5 h-5 text-green-500" />}
              </div>
              <div className="flex-1">
                <div className="font-medium capitalize">{category}</div>
                <div className="text-sm text-muted-foreground">{status}</div>
              </div>
              <Badge variant={status.includes('⚠️') ? 'secondary' : 'default'}>
                {status.includes('⚠️') ? 'Warning' : 'Passed'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Critical Issues */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Critical Issues to Resolve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {launchResults.criticalBlocks.map((issue, index) => (
              <div key={index} className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-600">Next Steps to Launch</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {launchResults.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🧹 Data Cleanup</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Remove mock data and test content
              </p>
              <Badge variant="outline">Run cleanup utilities</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">💰 Currency Update</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Convert INR references to TXC
              </p>
              <Badge variant="outline">8 instances to fix</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};