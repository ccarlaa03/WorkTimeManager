import React, { useState } from 'react';

const FormularAdaugareCurs = ({ onAdaugaCurs, onClose }) => {
  const [titlu, setTitlu] = useState('');
  const [descriere, setDescriere] = useState('');
  const [data, setData] = useState('');
  const [durata, setDurata] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdaugaCurs({ titlu, descriere, data});
  };

  return (
    <div>
      <h2>Adaugă Curs Nou</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Titlu Curs</label>
          <input 
            type="text" 
            value={titlu} 
            onChange={(e) => setTitlu(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Descriere curs</label>
          <textarea 
            value={descriere} 
            onChange={(e) => setDescriere(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Data începerii</label>
          <input
          type='date'
            value={data} 
            onChange={(e) => setData(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Durata</label>
          <input
            type='number'
            value={durata} 
            onChange={(e) => setDurata(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Adaugă</button>
        <button type="button" onClick={onClose}>Închide</button>
      </form>
    </div>
  );
};

export default FormularAdaugareCurs;