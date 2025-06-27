
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Network = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to posts page since we don't want a separate network dashboard
    navigate('/network/posts', { replace: true });
  }, [navigate]);

  return null;
};

export default Network;
