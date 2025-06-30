
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
        <div>
          <Label className="text-sm">Applying For:</Label>
          <Input value={job.title} disabled className="bg-gray-50 h-9 mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}
