
import React from 'react';

const Index = () => {
  console.log('🎯 INDEX: Component rendering');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Index Page Test</h1>
        <p className="text-muted-foreground">If you can see this, the Index component is rendering correctly.</p>
        <div className="mt-8 p-4 border rounded-lg">
          <p>This is a simplified version to test for rendering issues.</p>
          <p>The original complex component will be restored once we identify the problem.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
