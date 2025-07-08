
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Network = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to posts page since we don't want a separate network dashboard
    const timer = setTimeout(() => {
      navigate('/network/posts', { replace: true });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default Network;
