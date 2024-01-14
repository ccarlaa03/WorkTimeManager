import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import auth from '../../database/firebase-init';
import '../../styles/App.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Sign-up successful');
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Sign-up failed', error.message);
    }
  };
  

  const handleToggleForm = (redirectToLogin = false) => {
    if (redirectToLogin) {
      navigate('/login');
    } else {
      setShowLogin(!showLogin);
    }
  };

  return (
    <div>
      <div className="container">
        <div className="content">
          <h2>Sign Up</h2>
          <form id="form-signup" method="post" onSubmit={handleSignUp}>
            <div className="form-element form-stack">
              <label htmlFor="email" className="form-label">Email</label>
              <input id="email" type="email" name="email" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-element form-stack">
              <label htmlFor="company-name-signup" className="form-label">Numele companiei</label>
              <input id="company-name-signup" type="text" name="company-name" />
            </div>
            <div className="form-element form-stack">
              <label htmlFor="telefon-number" className="form-label">Numărul de telefon</label>
              <input id="telefon-number" type="text" name="telefon-number" />
            </div>
            <input
              id="password-signup"
              type="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div className="form-element form-submit">
              <button type="submit" className="signup" name="signup">Sign up</button>
              <button type="button" className="signup off" onClick={() => handleToggleForm(true)}>Log In</button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
