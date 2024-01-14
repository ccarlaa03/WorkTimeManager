import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const getUserRole = (user) => {
  return user.role;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/login', {
        email: email,
        password: password
      });
    
      if (response && response.data) {
        const { access_token, role } = response.data;
        const userRole = getUserRole({ role });
    
        // Redirecționare în funcție de rol
        if (userRole === 'hr') {
          navigate('/hr-dashboard');
        } else if (userRole === 'angajat') {
          navigate('/user-dashboard');
        } else {
       
          navigate('/');
        }
      } else {
        setLoginError('Răspunsul serverului este invalid.');
      }
    } catch (error) {
      console.error('Eroare la logare', error.response ? error.response.data.message : error.message);
      setLoginError(error.response ? error.response.data.message : error.message);
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
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        <p>Nu ai un cont? <Link to="/signup">Creează unul aici</Link>.</p>
      </div>
    </div>
  );
};

export default Login;