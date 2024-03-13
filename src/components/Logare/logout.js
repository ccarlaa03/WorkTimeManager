import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LogoutComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        await axios.post('http://localhost:8000/logout/', {
          refresh_token: localStorage.getItem('refresh_token')
        }, {
          headers: {'Content-Type': 'application/json'},
          withCredentials: true
        });
      } catch (e) {
        console.log('Logout failed', e);
      }


      localStorage.clear();
      delete axios.defaults.headers.common['Authorization'];

  
      navigate('/login');
    })();
  }, [navigate]); 


  return null;
};

export default LogoutComponent;
