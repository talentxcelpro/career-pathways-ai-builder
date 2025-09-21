import React from 'react';
import { Helmet } from 'react-helmet-async';
import { TXCPurchaseMonitor } from '@/components/txc/TXCPurchaseMonitor';
import { TXCTestSuite } from '@/components/txc/TXCTestSuite';
import TXCSystemStatus from '@/components/txc/TXCSystemStatus';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertTriangle } from "lucide-react";

export const TXCDiagnostics: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Helmet>
        <title>TXC Diagnostics | TalentXcel Pro</title>
        <meta name="description" content="Monitor and test TXC purchase system performance" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">TXC System Diagnostics</h1>
          </div>
          <p className="text-gray-600">
            Monitor TXC purchase system performance, run tests, and view system status.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Edge Functions</span>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Database</span>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">TXC Balance API</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Activity className="h-5 w-5 text-blue-500" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchases Today</span>
                    <span className="font-semibold">12</span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="font-semibold">1.2s</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span>Health Check</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Check</span>
                    <span className="font-semibold">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issues Found</span>
                    <span className="font-semibold text-green-600">0</span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Check</span>
                    <span className="font-semibold">5 min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            <TXCSystemStatus />
            <TXCPurchaseMonitor />
          </div>
          <div>
            <TXCTestSuite />
          </div>
        </div>
      </div>
    </div>
  );
};