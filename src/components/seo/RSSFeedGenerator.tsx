import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rss, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const RSSFeedGenerator = () => {
  const generateRSSFeed = async () => {
    try {
      const { data: jobs } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url,
            website,
            industry
          )
        `)
        .eq('is_active', true)
        .order('posted_at', { ascending: false })
        .limit(50);

      if (!jobs) return;

      const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>TalentXcel - Latest Job Openings</title>
    <link>https://talentxcel.in</link>
    <description>Latest job opportunities from TalentXcel - India's AI-powered career platform</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>TalentXcel RSS Generator</generator>
    <image>
      <url>https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png</url>
      <title>TalentXcel</title>
      <link>https://talentxcel.in</link>
    </image>
${jobs.map(job => `    <item>
      <title><![CDATA[${job.title} at ${job.companies?.name || 'Company'}]]></title>
      <link>https://talentxcel.in/jobs/${job.id}</link>
      <description><![CDATA[${job.description?.substring(0, 200)}...]]></description>
      <content:encoded><![CDATA[
        <h3>${job.title}</h3>
        <p><strong>Company:</strong> ${job.companies?.name || 'Not specified'}</p>
        <p><strong>Location:</strong> ${job.location || 'Remote'}</p>
        <p><strong>Employment Type:</strong> ${job.employment_type?.replace('_', ' ') || 'Full-time'}</p>
        ${job.salary_min && job.salary_max ? `<p><strong>Salary:</strong> ₹${Math.round(job.salary_min/100000)}L - ₹${Math.round(job.salary_max/100000)}L</p>` : ''}
        <p>${job.description}</p>
        <p><a href="https://talentxcel.in/jobs/${job.id}">Apply Now</a></p>
      ]]></content:encoded>
      <pubDate>${new Date(job.posted_at || job.created_at).toUTCString()}</pubDate>
      <guid>https://talentxcel.in/jobs/${job.id}</guid>
      <category>${job.companies?.industry || 'Technology'}</category>
      ${job.skills_required ? job.skills_required.map(skill => `<category>${skill}</category>`).join('\n      ') : ''}
    </item>`).join('\n')}
  </channel>
</rss>`;

      // Create and download RSS file
      const blob = new Blob([rssXml], { type: 'application/rss+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jobs-feed.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating RSS feed:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rss className="h-5 w-5" />
          RSS Feed Generator
        </CardTitle>
        <CardDescription>
          Generate RSS feeds for job postings and content syndication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <h4 className="font-medium mb-2">Jobs RSS Feed</h4>
            <p className="text-sm text-gray-600 mb-3">Latest job postings for syndication</p>
            <Button onClick={generateRSSFeed} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Jobs RSS
            </Button>
          </div>
          
          <div className="text-center">
            <h4 className="font-medium mb-2">Companies RSS Feed</h4>
            <p className="text-sm text-gray-600 mb-3">Company profiles and updates</p>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Companies RSS
            </Button>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">RSS Integration</h4>
          <p className="text-sm text-blue-700">
            RSS feeds can be integrated into job boards, content aggregators, and social media platforms 
            to automatically syndicate your content and improve SEO visibility.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
