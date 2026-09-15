import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, Plus, Trophy, Clock } from 'lucide-react';

export const AssessmentsManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Assessments & Certifications</h2>
          <p className="text-muted-foreground">Create quizzes, tests, and manage certificates</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <FileCheck className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Quizzes</CardTitle>
            <CardDescription>Multiple choice and interactive quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">0</div>
            <p className="text-sm text-muted-foreground mb-4">Total quizzes</p>
            <Button variant="outline" className="w-full">
              Create Quiz
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Clock className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle>Timed Tests</CardTitle>
            <CardDescription>Formal assessments with time limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">0</div>
            <p className="text-sm text-muted-foreground mb-4">Total tests</p>
            <Button variant="outline" className="w-full">
              Create Test
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Trophy className="h-8 w-8 text-yellow-600 mb-2" />
            <CardTitle>Certificates</CardTitle>
            <CardDescription>Course completion certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">0</div>
            <p className="text-sm text-muted-foreground mb-4">Issued certificates</p>
            <Button variant="outline" className="w-full">
              Manage Templates
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Analytics</CardTitle>
          <CardDescription>Performance metrics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">0%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Attempts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0%</div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};