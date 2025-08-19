import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Phone, User } from 'lucide-react';

export const StudentInquiries: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student Inquiries</h2>
          <p className="text-muted-foreground">Manage student college inquiries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Total Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Mail className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Pending Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Phone className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-sm text-muted-foreground">Average response rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <User className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">New inquiries</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
          <CardDescription>Latest student inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No student inquiries yet
          </div>
        </CardContent>
      </Card>
    </div>
  );
};