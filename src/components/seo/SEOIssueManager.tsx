import React, { useState } from 'react';
import { SEOIssueDetail } from './SEOIssueDetail';
import { SEOPageEditor } from './SEOPageEditor';
import { SEOBulkOperations } from './SEOBulkOperations';
import { SEOProgressTracker } from './SEOProgressTracker';
import { SEODashboard } from './SEODashboard';

interface SEOIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  affectedPages: Array<{
    url: string;
    title: string;
    issue: string;
    priority: number;
  }>;
  fixInstructions: string[];
  automatedFix?: boolean;
  estimatedTime: string;
}

const mockIssues: SEOIssue[] = [
  {
    id: 'meta-desc-missing',
    type: 'warning',
    category: 'Content',
    title: 'Missing Meta Descriptions',
    description: '12 pages are missing optimized meta descriptions',
    impact: 'medium',
    difficulty: 'easy',
    affectedPages: [
      {
        url: '/jobs/software-engineer-bangalore',
        title: 'Software Engineer Jobs in Bangalore',
        issue: 'No meta description found',
        priority: 1
      },
      {
        url: '/jobs/data-scientist-mumbai',
        title: 'Data Scientist Jobs in Mumbai',
        issue: 'No meta description found',
        priority: 1
      },
      {
        url: '/companies/microsoft',
        title: 'Microsoft Careers - Job Openings',
        issue: 'No meta description found',
        priority: 2
      }
    ],
    fixInstructions: [
      'Identify pages without meta descriptions using the SEO audit tool',
      'Write compelling, keyword-rich descriptions (120-160 characters)',
      'Include your target keyword naturally in the description',
      'Make each description unique and actionable',
      'Test the descriptions in search result preview tools'
    ],
    automatedFix: true,
    estimatedTime: '2-4 hours'
  },
  {
    id: 'slow-loading',
    type: 'error',
    category: 'Technical',
    title: 'Slow Page Load Times',
    description: '5 pages have load times greater than 3 seconds',
    impact: 'high',
    difficulty: 'medium',
    affectedPages: [
      {
        url: '/jobs/search',
        title: 'Job Search Results',
        issue: 'Load time: 4.2 seconds',
        priority: 1
      },
      {
        url: '/companies/list',
        title: 'Company Directory',
        issue: 'Load time: 3.8 seconds',
        priority: 1
      }
    ],
    fixInstructions: [
      'Analyze page performance using Google PageSpeed Insights',
      'Optimize and compress images using modern formats (WebP, AVIF)',
      'Minify and compress CSS and JavaScript files',
      'Enable browser caching for static resources',
      'Consider implementing a Content Delivery Network (CDN)',
      'Remove unused code and third-party scripts'
    ],
    automatedFix: false,
    estimatedTime: '1-2 days'
  },
  {
    id: 'mobile-issues',
    type: 'warning',
    category: 'Mobile',
    title: 'Mobile Optimization Opportunities',
    description: '8 pages have mobile usability issues',
    impact: 'medium',
    difficulty: 'medium',
    affectedPages: [
      {
        url: '/jobs/apply',
        title: 'Job Application Form',
        issue: 'Touch targets too small',
        priority: 1
      },
      {
        url: '/profile/edit',
        title: 'Edit Profile',
        issue: 'Content wider than screen',
        priority: 2
      }
    ],
    fixInstructions: [
      'Test pages using Google Mobile-Friendly Test',
      'Ensure touch targets are at least 44px in size',
      'Make sure content fits within the viewport width',
      'Optimize font sizes for mobile readability',
      'Test form usability on mobile devices',
      'Implement responsive design principles'
    ],
    automatedFix: false,
    estimatedTime: '3-5 days'
  }
];

type ViewMode = 'dashboard' | 'issue-detail' | 'page-editor' | 'bulk-operations' | 'progress-tracker';

export const SEOIssueManager: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedIssue, setSelectedIssue] = useState<SEOIssue | null>(null);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string>('');
  const [resolvedIssues, setResolvedIssues] = useState<string[]>([]);

  const handleIssueClick = (issueData: any) => {
    // Find the matching issue from our mock data
    const issue = mockIssues.find(i => 
      i.description === issueData.description || 
      i.title.toLowerCase().includes(issueData.description.toLowerCase().split(' ')[0])
    );
    
    if (issue) {
      setSelectedIssue(issue);
      setCurrentView('issue-detail');
    }
  };

  const handleOpportunityClick = (opportunityData: any) => {
    // Convert opportunity to issue format
    const issue: SEOIssue = {
      id: `opp-${Date.now()}`,
      type: 'info',
      category: 'Opportunity',
      title: opportunityData.title,
      description: opportunityData.description,
      impact: opportunityData.impact,
      difficulty: opportunityData.effort === 'low' ? 'easy' : opportunityData.effort === 'medium' ? 'medium' : 'hard',
      affectedPages: [
        {
          url: '/jobs/list',
          title: 'Job Listings',
          issue: 'Opportunity for improvement',
          priority: 1
        }
      ],
      fixInstructions: [
        'Analyze the current implementation',
        'Plan the improvement strategy',
        'Execute the changes systematically',
        'Monitor results and iterate'
      ],
      automatedFix: false,
      estimatedTime: opportunityData.effort === 'low' ? '1-2 days' : opportunityData.effort === 'medium' ? '3-5 days' : '1-2 weeks'
    };
    
    setSelectedIssue(issue);
    setCurrentView('issue-detail');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedIssue(null);
    setSelectedPageUrl('');
  };

  const handleEditPage = (pageUrl: string) => {
    setSelectedPageUrl(pageUrl);
    setCurrentView('page-editor');
  };

  const handleMarkIssueResolved = (issueId: string) => {
    setResolvedIssues(prev => [...prev, issueId]);
    setCurrentView('dashboard');
    setSelectedIssue(null);
  };

  const handlePageSave = (pageData: any) => {
    console.log('Page data saved:', pageData);
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'issue-detail':
        return (
          <SEOIssueDetail
            issue={selectedIssue}
            onBack={handleBackToDashboard}
            onMarkResolved={handleMarkIssueResolved}
          />
        );
      
      case 'page-editor':
        return (
          <SEOPageEditor
            pageUrl={selectedPageUrl}
            onSave={handlePageSave}
            onClose={handleBackToDashboard}
          />
        );
      
      case 'bulk-operations':
        return <SEOBulkOperations />;
      
      case 'progress-tracker':
        return <SEOProgressTracker />;
      
      default:
        return (
          <SEODashboard
            onIssueClick={handleIssueClick}
            onOpportunityClick={handleOpportunityClick}
            resolvedIssues={resolvedIssues}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {currentView === 'dashboard' && (
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentView('bulk-operations')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Bulk Operations
          </button>
          <button
            onClick={() => setCurrentView('progress-tracker')}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Progress Tracker
          </button>
        </div>
      )}
      
      {renderCurrentView()}
    </div>
  );
};