import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LogoutComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!accessToken || !refreshToken) {
        console.error("No access token or refresh token found. User is not logged in.");

        navigate('/login');
        return;
      }

      try {
        await axios.post('http://localhost:8000/logout/', {
          refresh_token: refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          withCredentials: true
        });

        console.log('Logout successful');
      } catch (e) {
        console.error('Logout failed:', e);
      }
      localStorage.clear();
      delete axios.defaults.headers.common['Authorization'];

      navigate('/login');
    })();
  }, [navigate]);

  return null;
};

export default LogoutComponent;
