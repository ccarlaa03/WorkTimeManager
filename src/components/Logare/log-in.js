import '../../styles/App.css';
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import auth from '../../database/firebase-init';

const Login = () => {
  const navigate = useNavigate();
  const [showSignUp, setShowSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const authInstance = getAuth(auth);
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      console.log('Login successful', userCredential);

      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error.message);
    }
  };

  const handleToggleForm = () => {
    if (!showSignUp) {
      navigate('/sign-up');
    } else {
      setShowSignUp((prevShowSignUp) => !prevShowSignUp);
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h2>Login</h2>
        <form id="form-login" method="post" onSubmit={handleLogin}>
          <div className="form-element form-stack">
            <label htmlFor="email-login" className="form-label">
              Email
            </label>
            <input
              id="email-login"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-element form-stack">
            <label htmlFor="password-login" className="form-label">
              Parolă
            </label>
            <input
              id="password-login"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-element form-submit">
            <button className="login" type="submit" name="login">
              Log In
            </button>
            <button className="login off" onClick={handleToggleForm}>
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
