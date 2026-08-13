
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-3 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10 my-auto py-2">
        <GoogleOneTapLogin autoSelect />
        {/* Compact Brand Header */}
        <div className="text-center mb-3">
          <div className="mx-auto w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-1.5 shadow-md relative">
            <img 
              src="/lovable-uploads/92d46ee5-0b5a-4272-905d-72a40b1c8bdc.png" 
              alt="TalentXcel logo"
              className="w-7 h-7 rounded-md object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/lovable-uploads/1a30569a-4f31-4bd4-abe8-79d630d989f9.png'; }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              TalentXcel
            </h1>
            <p className="text-xs text-slate-500 font-medium">Careers, Designed — Not Discovered</p>
          </div>
        </div>
        
        {/* Compact Auth Card */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-blue-50/30 pointer-events-none"></div>
          
          <CardHeader className="text-center pb-2 pt-4 px-5 relative z-10 space-y-0.5">
            <CardTitle className="text-lg font-bold text-slate-900">{title}</CardTitle>
            <CardDescription className="text-xs text-slate-500 font-medium">{description}</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-2 pb-5 px-5 relative z-10">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
