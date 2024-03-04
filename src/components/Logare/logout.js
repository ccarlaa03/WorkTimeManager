import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // La montarea componentului, efectuează logout
    localStorage.removeItem('access');
    navigate('/login');
  }, [navigate]);

  return null; // sau un spinner în timp ce se efectuează logout
};

export default LogoutComponent;
