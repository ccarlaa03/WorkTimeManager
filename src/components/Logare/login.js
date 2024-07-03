import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { useAuth } from '../../AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(!localStorage.getItem('token'));
  const navigate = useNavigate();
  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/login/', { email, password });
      if (response.data.access) {
        login({
          user: response.data.email,
          token: response.data.access,
        });

        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('role', response.data.role);
        console.log('Access Token:', localStorage.getItem('access_token'));
        console.log('Refresh Token:', localStorage.getItem('refresh_token'));
        console.log('Role:', localStorage.getItem('role'));
        setIsAuthenticated(true);

        navigate(`/${response.data.role}-dashboard`);
      } else {
        setLoginError('Invalid credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="form-stack">
          <div className="form-element">
            <label htmlFor="email" className="form-label">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-element">
            <label htmlFor="password" className="form-label">Parolă:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="buton" disabled={isLoading}>
            {isLoading ? 'Se încarcă...' : 'Login'}
          </button>
        </form>
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        <p>Nu ai un cont? <Link to="/signup">Creează unul aici</Link>.</p>
      </div>
    </div>
  );
};

export default Login;
