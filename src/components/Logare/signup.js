import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();

  // State-uri pentru datele utilizatorului
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerName, setOwnerName] = useState('')
  const [signUpError, setSignUpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State-uri pentru datele companiei
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhoneNumber, setCompanyPhoneNumber] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyNumberOfEmployees, setCompanyNumberOfEmployees] = useState('');
  const [companyFoundedDate, setCompanyFoundedDate] = useState('');



  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setSignUpError('Parolele nu coincid.');
      return;
    }

    setIsLoading(true);
    const companyData = {
      name: companyName,
      address: companyAddress,
      phone_number: companyPhoneNumber,
      industry: companyIndustry, 
      number_of_employees: companyNumberOfEmployees, 
      founded_date: companyFoundedDate, 
    };
    const userData = {
      owner_name: ownerName,
      email,
      password,
    };

    try {
      const response = await axios.post('http://localhost:8000/signup/', {
        email, password, company: companyData
      });
      setIsLoading(false);
      navigate('/login');
    } catch (error) {
      console.error('Eroare la înregistrare', error);
      setSignUpError('Eroare la înregistrare. Verifică adresa de email, parola și detaliile companiei.');
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h2>Înregistrare</h2>
        <form onSubmit={handleSignUp} className="form-stack">
          <div className="form-element">
            <label className="form-label">Nume:</label>
            <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
          </div>

          <div className="form-element">
            <label className="form-label">Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form-label">Parolă:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form-label">Confirmă parola:</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form-label">Numele companiei:</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form-label">Adresa:</label>
            <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form-label">Numărul de telefon:</label>
            <input type="text" value={companyPhoneNumber} onChange={(e) => setCompanyPhoneNumber(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form-label">Industria:</label>
            <input type="text" value={companyIndustry} onChange={(e) => setCompanyIndustry(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form-label">Numărul de Angajați:</label>
            <input type="number" value={companyNumberOfEmployees} onChange={(e) => setCompanyNumberOfEmployees(e.target.value)} required />
          </div>
          <div className="form-element">
            <label className="form-label">Data Înființării:</label>
            <input type="date" value={companyFoundedDate} onChange={(e) => setCompanyFoundedDate(e.target.value)} required />
          </div>

          <button type="submit" className="signup" disabled={isLoading}>
            {isLoading ? 'Se încarcă...' : 'Înregistrare'}
          </button>
        </form>
        {signUpError && <p style={{ color: 'red' }}>{signUpError}</p>}
        <p>Ai deja un cont? <Link to="/login">Conectează-te aici</Link>.</p>
      </div>
    </div>
  );
};

export default SignUp;
