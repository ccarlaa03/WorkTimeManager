// RedirectBasedOnRole.js
import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const RedirectBasedOnRole = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const history = useHistory();

  useEffect(() => {
    const redirectUser = () => {
      if (isAuthenticated) {
        if (user.role === 'hr') {
          history.push('/hr-dashboard');
        } else if (user.role === 'angajat') {
          history.push('/user-dashboard');
        } else {
          history.push('/');
        }
      } else {
        history.push('/login');
      }
    };

    redirectUser();
  }, [isAuthenticated, user, history]);

  return <div>Redirecting...</div>;
};

export default RedirectBasedOnRole;
