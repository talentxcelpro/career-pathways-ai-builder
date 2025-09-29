import { Button } from '@/components/ui/button';
import { useProfilePosts } from '@/hooks/useProfilePosts';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';

export const TestPostButton = () => {
  const { user } = useOptimizedAuth();
  const { createTestPost } = useProfilePosts(user?.id || '');

  const handleCreateTestPost = () => {
    console.log('🔄 Test post button clicked');
    createTestPost();
  };

  if (!user) {
    return null;
  }

  return (
    <Button 
      onClick={handleCreateTestPost}
      className="bg-gradient-to-r from-primary to-primary-glow text-white shadow-elegant hover:shadow-glow transition-all"
    >
      Create Test Post
    </Button>
  );
};