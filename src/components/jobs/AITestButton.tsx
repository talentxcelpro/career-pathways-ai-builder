import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { TestTube, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AITestButton: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);

  const testAIFunction = async () => {
    setIsTesting(true);
    try {
      console.log('Testing AI job generator function...');
      
      const testData = {
        type: 'job_summary',
        job_title: 'Software Engineer',
        industry_domain: 'Technology',
        employment_type: 'full-time',
        work_mode: 'Remote',
        location_city: 'Mumbai',
        experience_level: 'mid-level',
        required_skills: ['JavaScript', 'React'],
        company_name: 'Test Company'
      };

      console.log('Test request data:', testData);

      const { data, error } = await supabase.functions.invoke('ai-job-generator', {
        body: testData
      });

      console.log('Test response:', { data, error });

      if (error) {
        console.error('Test failed with error:', error);
        toast.error(`AI function test failed: ${error.message}`);
      } else if (data?.content) {
        console.log('Test successful! Generated content:', data.content);
        toast.success('AI function is working correctly!');
      } else {
        console.log('Test completed but no content received:', data);
        toast.warning('AI function responded but returned no content');
      }

    } catch (error: any) {
      console.error('Test error:', error);
      toast.error(`Test error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={testAIFunction}
      disabled={isTesting}
      className="fixed bottom-4 right-4 z-50 bg-background shadow-lg"
    >
      {isTesting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <TestTube className="h-4 w-4 mr-2" />
      )}
      Test AI
    </Button>
  );
};

export default AITestButton;