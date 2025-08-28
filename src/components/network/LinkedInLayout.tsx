import React from 'react';
import { Outlet } from 'react-router-dom';
import { NetworkSidebar } from './NetworkSidebar';
import { NetworkNavbar } from './NetworkNavbar';
import { NewPostFloater } from './NewPostFloater';
import { NetworkMessagingSidebar } from './NetworkMessagingSidebar';

export const LinkedInLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-muted/20 font-system">
      {/* Top Navigation */}
      <NetworkNavbar />
      
      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <NetworkSidebar />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-6">
            <Outlet />
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {/* Suggestions and trending content will go here */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <NewPostFloater />
      <NetworkMessagingSidebar />
    </div>
  );
};