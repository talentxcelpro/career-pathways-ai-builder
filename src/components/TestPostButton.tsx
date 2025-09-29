import { Button } from '@/components/ui/button';
import { useProfilePosts } from '@/hooks/useProfilePosts';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';

export const TestPostButton = () => {
  const { user } = useOptimizedAuth();
  const { createTestPost } = useProfilePosts(user?.id || '');

  console.log('🔍 TestPostButton render - user:', user?.id);
  console.log('🔍 TestPostButton render - createTestPost:', typeof createTestPost);

  const handleCreateTestPost = () => {
    console.log('🔄 Test post button clicked!');
    console.log('🔄 User ID:', user?.id);
    console.log('🔄 createTestPost function:', createTestPost);
    
    if (!createTestPost) {
      console.error('❌ createTestPost function is undefined!');
      return;
    }
    
    try {
      createTestPost();
      console.log('🔄 createTestPost() called successfully');
    } catch (error) {
      console.error('❌ Error calling createTestPost:', error);
    }
  };

  if (!user) {
    console.log('⚠️ No user found, not rendering TestPostButton');
    return null;
  }

  console.log('✅ Rendering TestPostButton for user:', user.id);

  return (
    <Button 
      onClick={handleCreateTestPost}
      className="bg-gradient-to-r from-primary to-primary-glow text-white shadow-elegant hover:shadow-glow transition-all"
    >
      Create Test Post (Debug)
    </Button>
  );
};