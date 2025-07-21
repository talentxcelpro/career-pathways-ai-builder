import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, User, Briefcase, Target, Rocket } from 'lucide-react';

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const steps = [
    { number: 1, title: 'Profile Setup', icon: <User className="h-5 w-5" />, completed: currentStep > 1 },
    { number: 2, title: 'Experience', icon: <Briefcase className="h-5 w-5" />, completed: currentStep > 2 },
    { number: 3, title: 'Goals', icon: <Target className="h-5 w-5" />, completed: currentStep > 3 },
    { number: 4, title: 'Complete', icon: <Rocket className="h-5 w-5" />, completed: currentStep > 4 }
  ];

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to TalentXcel! 🎉
          </h1>
          <p className="text-muted-foreground">
            Let's set up your profile to get the best experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={(currentStep / totalSteps) * 100} className="h-2 mb-4" />
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors
                  ${step.completed ? 'bg-green-500 text-white' : 
                    currentStep === step.number ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground'}
                `}>
                  {step.completed ? <CheckCircle className="h-5 w-5" /> : step.icon}
                </div>
                <span className="text-xs text-center font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Tell us about yourself'}
              {currentStep === 2 && 'Your experience'}
              {currentStep === 3 && 'Your career goals'}
              {currentStep === 4 && 'You\'re all set!'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Basic information to personalize your experience'}
              {currentStep === 2 && 'Help us understand your professional background'}
              {currentStep === 3 && 'What are you looking to achieve?'}
              {currentStep === 4 && 'Your profile is ready to go!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Profile Setup */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="jobTitle">Current Job Title</Label>
                  <Input id="jobTitle" placeholder="Software Engineer" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="San Francisco, CA" />
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Years of Experience</Label>
                  <div className="flex gap-2 mt-2">
                    {['0-2', '3-5', '6-10', '10+'].map((range) => (
                      <Button key={range} variant="outline" size="sm">
                        {range} years
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Skills (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['JavaScript', 'React', 'Python', 'Node.js', 'AWS', 'Docker'].map((skill) => (
                      <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-muted">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" placeholder="Technology" />
                </div>
              </div>
            )}

            {/* Step 3: Goals */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>What are you looking for? (select all that apply)</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      'New job opportunities',
                      'Career advancement',
                      'Skill development',
                      'Networking',
                      'Freelance projects'
                    ].map((goal) => (
                      <Button key={goal} variant="outline" className="w-full justify-start">
                        {goal}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Profile Complete!</h3>
                  <p className="text-muted-foreground">
                    Your TalentXcel profile is now ready. Start exploring opportunities and connecting with professionals.
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button asChild>
                    <a href="/dashboard">Go to Dashboard</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/profile">View Profile</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button onClick={nextStep}>
              Next Step
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;