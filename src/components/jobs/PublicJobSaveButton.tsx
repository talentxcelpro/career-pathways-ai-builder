
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Heart, User } from 'lucide-react';
import { toast } from 'sonner';

interface PublicJobSaveButtonProps {
  jobId: string;
  className?: string;
}

export const PublicJobSaveButton: React.FC<PublicJobSaveButtonProps> = ({ 
  jobId, 
  className = "" 
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndSavedStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        // Check if job is saved
        const { data } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('user_id', user.id)
          .eq('job_id', jobId)
          .single();
        
        setIsSaved(!!data);
      }
      
      setLoading(false);
    };
    
    checkUserAndSavedStatus();
  }, [jobId]);

  const handleSaveClick = async () => {
    if (!currentUser) {
      toast.error('Please login to save jobs');
      navigate('/auth/login');
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('job_id', jobId);
        
        setIsSaved(false);
        toast.success('Job removed from saved');
      } else {
        await supabase
          .from('saved_jobs')
          .insert({ user_id: currentUser.id, job_id: jobId });
        
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Heart className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSaveClick}
      className={`${isSaved ? 'text-red-500 border-red-200' : ''} ${className}`}
    >
      {currentUser ? (
        <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      ) : (
        <User className="h-4 w-4" />
      )}
    </Button>
  );
};
