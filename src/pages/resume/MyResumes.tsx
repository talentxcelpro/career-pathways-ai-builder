import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { Plus, FileText, Edit, Trash2, Clock, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Resume {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_primary: boolean;
  ats_score: number;
}

const MyResumes = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('ai_resumes')
        .select('id, title, created_at, updated_at, is_primary, ats_score')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const { error } = await supabase
        .from('ai_resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Resume deleted successfully');
      loadResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Resumes | TalentXcel Resume Builder</title>
        <meta name="description" content="Manage all your resumes in one place" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Resumes</h1>
              <p className="text-muted-foreground">Manage and edit your resumes</p>
            </div>
            <Button onClick={() => navigate('/resume/build')} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create New Resume
            </Button>
          </div>

          {resumes.length === 0 ? (
            <Card className="text-center p-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No resumes yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first resume to get started
              </p>
              <Button onClick={() => navigate('/resume/build')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Resume
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card 
                  key={resume.id}
                  className="group hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/resume/build/${resume.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <FileText className="w-10 h-10 text-primary" />
                      {resume.is_primary && (
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <CardTitle className="text-lg mt-4">{resume.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3" />
                      Updated {new Date(resume.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">ATS Score</span>
                      <span className={`text-lg font-semibold ${
                        resume.ats_score >= 80 ? 'text-green-600' :
                        resume.ats_score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {resume.ats_score}%
                      </span>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/resume/build/${resume.id}`)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(resume.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyResumes;