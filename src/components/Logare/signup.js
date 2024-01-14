import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Axios from 'axios';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signUpError, setSignUpError] = useState(null);
  const [signUpSuccess, setSignUpSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('hr');
  const navigate = useNavigate();

  const submitSignUp = () => {
    setIsLoading(true);
    Axios.post('http://localhost:3000/signup', {
      email: email,
      password: password,
      role: role
    })
    .then((response) => {
      console.log(response);
      setSignUpSuccess('Mulțumim pentru crearea contului. Un angajat vă va contacta în curând.');
      setTimeout(() => navigate('/login'), 3000);
    })
    .catch((error) => {
      console.error('Eroare la înregistrare', error.message);
      setSignUpError('Eroare la înregistrare. Verifică adresa de email și parola.');
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setSignUpError('Parolele nu coincid.');
      return;
    }
    submitSignUp();
  };

  return (
    <div className="container">
      <div className="content">
        <h2>Înregistrare</h2>
        <form onSubmit={handleSignUp} className="form-stack">
          <div className="form-element">
            <label className="form-label">Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form-label">Parolă:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form-label">Confirmă Parola:</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form">Rol:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="angajat">Angajat</option>
              <option value="hr">HR</option>
            </select>
          </div>
          <button type="submit" className="signup" disabled={isLoading}>
            {isLoading ? 'Se încarcă...' : 'Înregistrare'}
          </button>
        </form>
        {signUpSuccess && <p style={{ color: 'green' }}>{signUpSuccess}</p>}
        {signUpError && <p style={{ color: 'red' }}>{signUpError}</p>}
        <p>Ai deja un cont? <Link to="/login">Conectează-te aici</Link>.</p>
      </div>
    </div>
  );
};

export default SignUp;