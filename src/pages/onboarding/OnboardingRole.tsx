
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleSelection } from '@/components/onboarding/RoleSelection';
import { UserRole } from '@/utils/roleRouting';

const OnboardingRole = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    // Store selected role in session storage for next step
    sessionStorage.setItem('selectedRole', role);
    navigate('/onboarding/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <RoleSelection onRoleSelect={handleRoleSelect} />
    </div>
  );
};

export default OnboardingRole;
