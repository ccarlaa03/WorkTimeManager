import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../../styles/App.css';

const Login = () => {
  const [showSignUp, setShowSignUp] = useState(true);

  const handleToggleForm = () => {
    setShowSignUp(!showSignUp);
  };

  return (
    <div id="slideBox">
      <div className="topLayer">
        <div className={`left ${showSignUp ? 'active' : ''}`}>
          <div className="content">
            <h2>{showSignUp ? 'Sign Up' : 'Login'}</h2>
            {showSignUp ? (
              <form id="form-signup" method="post" onSubmit={(e) => e.preventDefault()}>
                <div className="form-element form-stack">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input id="email" type="email" name="email" />
                </div>
                <div className="form-element form-stack">
                  <label htmlFor="company-name-signup" className="form-label">Numele companiei</label>
                  <input id="company-name-signup" type="text" name="company-name" />
                </div>
                <div className="form-element form-stack">
                  <label htmlFor="password-signup" className="form-label">Parolă</label>
                  <input id="password-signup" type="password" name="password" />
                </div>
                <div className="form-element form-submit">
                  <button className="signup" type="submit" name="signup">Sign up</button>
                  <button className="signup off" onClick={handleToggleForm}>Log In</button>
                </div>
              </form>
            ) : (
              <form id="form-login" method="post" onSubmit={(e) => e.preventDefault()}>
                <div className="form-element form-stack">
                  <label htmlFor="email-login" className="form-label">Email</label>
                  <input id="email-login" type="email" name="email" />
                </div>
                <div className="form-element form-stack">
                  <label htmlFor="password-login" className="form-label">Parolă</label>
                  <input id="password-login" type="password" name="password" />
                </div>
                <div className="form-element form-submit">
                  <button className="login" type="submit" name="login">Log In</button>
                  <button className="login off" onClick={handleToggleForm}>Sign Up</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Login />
  </React.StrictMode>,
  document.getElementById('root')
);
 export default Login;