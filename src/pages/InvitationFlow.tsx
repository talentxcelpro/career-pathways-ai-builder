import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  User, 
  Building2, 
  CheckCircle, 
  ArrowRight, 
  Clock,
  UserPlus,
  Shield,
  Briefcase
} from 'lucide-react';

const InvitationFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Email Invitation Sent",
      description: "User receives invitation email",
      status: "completed"
    },
    {
      id: 2,
      title: "User Clicks Link",
      description: "Redirected to accept invitation page",
      status: currentStep >= 2 ? "completed" : "pending"
    },
    {
      id: 3,
      title: "Authentication Check",
      description: "Login if not authenticated",
      status: currentStep >= 3 ? "completed" : "pending"
    },
    {
      id: 4,
      title: "Invitation Accepted",
      description: "Team membership activated",
      status: currentStep >= 4 ? "completed" : "pending"
    },
    {
      id: 5,
      title: "Employer Access Granted",
      description: "Automatic redirect to employer dashboard",
      status: currentStep >= 5 ? "completed" : "pending"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Team Invitation Flow
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete user journey for <strong>arsh.wani@gmail.com</strong> accepting a team invitation
          </p>
        </div>

        {/* Flow Steps */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Invitation Process Overview
            </CardTitle>
            <CardDescription>
              Track the complete flow from invitation to employer access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {step.status === 'completed' ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                      {step.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute left-4 mt-8 w-px h-6 bg-gray-200" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Step 1: Email Invitation */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Step 1: Email Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">arsh.wani@gmail.com</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium">Team Invitation - Join TalentXcel</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">You've been invited to join TalentXcel as a Recruiter!</p>
                  <p className="text-xs text-gray-600">
                    Click the link below to accept your invitation and get started.
                  </p>
                  <div className="bg-blue-50 p-3 rounded border">
                    <code className="text-xs text-blue-800">
                      https://app.talentxcel.com/employer/team/accept/[invitation-token]
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2-3: Authentication Flow */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Step 2-3: Authentication & Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">If User Not Logged In:</h4>
                <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">• Redirected to login page</p>
                  <p className="text-sm">• Invitation token preserved in URL</p>
                  <p className="text-sm">• After login, automatically returns to accept page</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">If User Already Logged In:</h4>
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">• Direct access to acceptance page</p>
                  <p className="text-sm">• Instant invitation processing</p>
                  <p className="text-sm">• Immediate team membership activation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4-5: Acceptance & Access */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Step 4-5: Invitation Acceptance & Employer Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-3">What Happens Automatically:</h4>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Team membership record created</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>User profile updated with employer status</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Invitation marked as accepted</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Immediate redirect to /employer dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Full employer access granted without additional approval</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Implementation */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Technical Implementation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Database Changes:</h4>
                <div className="bg-purple-50 p-4 rounded-lg space-y-1 text-sm">
                  <p>• <code>team_invitations.status</code> → 'accepted'</p>
                  <p>• <code>company_team_members</code> → new record</p>
                  <p>• <code>profiles.is_employer</code> → true</p>
                  <p>• <code>profiles.employer_status</code> → 'approved'</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Access Control:</h4>
                <div className="bg-purple-50 p-4 rounded-lg space-y-1 text-sm">
                  <p>• <code>useEmployerAccess</code> hook updated</p>
                  <p>• Checks both profile status AND team membership</p>
                  <p>• Instant access without cache issues</p>
                  <p>• No additional approval needed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Controls */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Simulate User Journey</h3>
              <p className="text-blue-100">
                Click through the steps to see how arsh.wani@gmail.com experiences the invitation flow
              </p>
              <div className="flex justify-center gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous Step
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  disabled={currentStep === 5}
                >
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-blue-600">
                  Step {currentStep} of 5
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Result */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Briefcase className="h-12 w-12 mx-auto text-green-100" />
              <h3 className="text-2xl font-bold">End Result</h3>
              <p className="text-green-100 max-w-2xl mx-auto">
                <strong>arsh.wani@gmail.com</strong> now has full employer access and can immediately:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Post Jobs</h4>
                  <p className="text-sm text-green-100">Create and manage job listings</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Manage Candidates</h4>
                  <p className="text-sm text-green-100">Review applications and shortlist</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Team Collaboration</h4>
                  <p className="text-sm text-green-100">Work with team members</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvitationFlow;