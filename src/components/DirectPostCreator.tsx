import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const DirectPostCreator = () => {
  const createPostDirectly = async () => {
    console.log('🚀 DIRECT POST CREATION STARTED');
    
    try {
      // Check auth first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('📋 Auth check result:', { user: user?.id, authError });
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        toast.error('Authentication error: ' + authError.message);
        return;
      }
      
      if (!user) {
        console.error('❌ No user found');
        toast.error('Please log in to create a post');
        return;
      }
      
      console.log('✅ User authenticated:', user.id);
      
      // Create the post directly
      const postData = {
        content: "🧪 Test post created directly via Supabase client. This should work if the database connection is OK!",
        post_type: "text",
        author_id: user.id,
        user_id: user.id,
        media_urls: [],
        tags: [],
        visibility: "public",
        origin: "network",
        link_previews: []
      };
      
      console.log('📝 Creating post with data:', postData);
      
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();
      
      console.log('📤 Insert result:', { data, error });
      
      if (error) {
        console.error('❌ Database error:', error);
        toast.error('Database error: ' + error.message);
        return;
      }
      
      console.log('✅ Post created successfully:', data);
      toast.success('Post created successfully!');
      
      // Refresh the page to see the new post
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast.error('Unexpected error: ' + (error as Error).message);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-2">Direct Post Creation Test</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This bypasses all hooks and creates a post directly via Supabase.
      </p>
      <Button 
        onClick={createPostDirectly}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        🧪 Create Post Directly
      </Button>
    </div>
  );
};