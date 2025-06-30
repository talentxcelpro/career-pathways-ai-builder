
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase } from "lucide-react";
import { JobInfo } from './types';

interface JobRoleStepProps {
  job: JobInfo;
}

export default function JobRoleStep({ job }: JobRoleStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Step 2: Job Role
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Applying For:</Label>
            <Input value={job.title} disabled className="mt-2 bg-gray-50" />
          </div>
          {job.companies && (
            <div>
              <Label>Company:</Label>
              <Input value={job.companies.name} disabled className="mt-2 bg-gray-50" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
