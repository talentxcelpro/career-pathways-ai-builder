
import { useAuth } from '@/contexts/AuthContext';

export const useAdminAccess = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.email === 'talentxcelpro@gmail.com';
  
  return {
    isAdmin,
    user
  };
};
