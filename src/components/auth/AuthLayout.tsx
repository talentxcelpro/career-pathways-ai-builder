
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleOneTapLogin } from './GoogleOneTapLogin';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, description }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <GoogleOneTapLogin autoSelect />
        {/* Enhanced Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
            <img 
              src="/lovable-uploads/92d46ee5-0b5a-4272-905d-72a40b1c8bdc.png" 
              alt="TalentXcel logo"
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/lovable-uploads/1a30569a-4f31-4bd4-abe8-79d630d989f9.png'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              TalentXcel
            </h1>
            <p className="text-sm text-slate-600 font-medium">Careers, Designed — Not Discovered</p>
          </div>
        </div>
        
        {/* Enhanced Auth Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-blue-50/30 pointer-events-none"></div>
          
          <CardHeader className="text-center pb-4 relative z-10">
            <CardTitle className="text-xl font-bold text-slate-900">{title}</CardTitle>
            <CardDescription className="text-sm text-slate-600 font-medium">{description}</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0 relative z-10">
            {children}
          </CardContent>
        </Card>

        {/* Enhanced Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500 font-medium">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
