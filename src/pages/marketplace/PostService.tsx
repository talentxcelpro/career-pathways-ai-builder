
import React from 'react';
import ServiceSetupForm from '@/components/marketplace/ServiceSetupForm';

export default function PostService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create Your Service</h1>
          <p className="text-muted-foreground mt-2">
            Set up your professional service and start connecting with clients
          </p>
        </div>
        
        <ServiceSetupForm />
      </div>
    </div>
  );
}
