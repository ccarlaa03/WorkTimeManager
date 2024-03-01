import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Aici ai declarat hook-ul

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let response;
  
    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        email: email,
        password: password
      });
    
      if (response.data && response.data.token && response.data.role) {
        localStorage.setItem('access', response.data.token);
        navigate(`/${response.data.role}-dashboard`);
        
      } else {
        setLoginError('Autentificare eșuată.');
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {

        if (error.response.status === 401) { 
          setLoginError('Email sau parola incorectă.');
        } else {
          setLoginError('Autentificare eșuată. Eroare de server.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setLoginError('Autentificare eșuată. Serverul nu răspunde.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setLoginError('Eroare necunoscută la autentificare.');
      }
      console.error('Eroare la autentificare:', error);
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
