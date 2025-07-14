import React from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const EdgeFunctionTest = () => {
  const testKeywordOptimizer = async () => {
    try {
      console.log('Testing ai-keyword-optimizer...');
      const { data, error } = await supabase.functions.invoke('ai-keyword-optimizer', {
        body: {
          resumeContent: { name: "Test User", skills: ["JavaScript"] },
          targetRole: "Software Developer"
        }
      });
      
      console.log('Response:', { data, error });
      
      if (error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.success('Function called successfully!');
      }
    } catch (err) {
      console.error('Test failed:', err);
      toast.error(`Test failed: ${err.message}`);
    }
  };

  return (
    <div className="p-4">
      <Button onClick={testKeywordOptimizer}>
        Test AI Keyword Optimizer
      </Button>
    </div>
  );
};