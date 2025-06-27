
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/utils/roleRouting';
import { 
  Briefcase, 
  Users, 
  GraduationCap, 
  MessageCircle, 
  Shield 
} from 'lucide-react';

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
  selectedRole?: UserRole;
}

const roleOptions = [
  {
    value: 'candidate' as UserRole,
    title: 'Job Seeker',
    description: 'Looking for career opportunities and professional growth',
    icon: Briefcase,
    color: 'from-blue-500 to-blue-600'
  },
  {
    value: 'employer' as UserRole,
    title: 'Employer',
    description: 'Hiring talent and building teams',
    icon: Users,
    color: 'from-green-500 to-green-600'
  },
  {
    value: 'institute' as UserRole,
    title: 'Educational Institute',
    description: 'Academic institution providing courses and programs',
    icon: GraduationCap,
    color: 'from-purple-500 to-purple-600'
  },
  {
    value: 'mentor' as UserRole,
    title: 'Mentor',
    description: 'Guiding and supporting career development',
    icon: MessageCircle,
    color: 'from-orange-500 to-orange-600'
  },
  {
    value: 'admin' as UserRole,
    title: 'Administrator',
    description: 'Platform management and oversight',
    icon: Shield,
    color: 'from-red-500 to-red-600'
  }
];

export const RoleSelection: React.FC<RoleSelectionProps> = ({ 
  onRoleSelect, 
  selectedRole 
}) => {
  const [selected, setSelected] = useState<UserRole | null>(selectedRole || null);

  const handleSelect = (role: UserRole) => {
    setSelected(role);
  };

  const handleContinue = () => {
    if (selected) {
      onRoleSelect(selected);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to TalentXcel
        </h1>
        <p className="text-lg text-gray-600">
          Let's get started by selecting your role
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {roleOptions.map((role) => {
          const Icon = role.icon;
          const isSelected = selected === role.value;
          
          return (
            <Card
              key={role.value}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg transform scale-105' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSelect(role.value)}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {role.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!selected}
          size="lg"
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
