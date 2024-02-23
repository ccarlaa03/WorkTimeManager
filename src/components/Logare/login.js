import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 

    setIsLoading(true); 

    try {
      const response = await axios.post('http://localhost:8000/login/', {
        email: email,
        password: password
      });
      
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('role', response.data.role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      if (response.data.role === 'HR') {
        navigate('/HR-dashboard');
      } else if (response.data.role === 'Angajat') {
        navigate('/Angajat-dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      if (error.response) {
        setLoginError(error.response.data.error || 'Autentificare eșuată. Verificați emailul și parola.');
      } else {
        setLoginError('Eroare necunoscută.');
      }
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="form-stack">
          <div className="form-element">
            <label className="form-label">Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form-label">Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login" disabled={isLoading}>
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
