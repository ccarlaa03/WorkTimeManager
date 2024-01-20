import React, { useState } from 'react';

const AdaugaProgram = ({ onSubmit }) => {
  const [ziSelectata, setZiSelectata] = useState('');
  const [oraInceput, setOraInceput] = useState('');
  const [oraSfarsit, setOraSfarsit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validează datele sau efectuează orice alte acțiuni necesare
    if (ziSelectata && oraInceput && oraSfarsit) {
      // Creează un obiect cu datele introduse
      const programNou = {
        zi: ziSelectata,
        oraInceput,
        oraSfarsit,
      };
      // Trimite obiectul către componenta părinte
      onSubmit(programNou);
    }
  };

  return (
    <div>
      <h2>Adaugă Program de Lucru</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="ziSelectata">Ziua:</label>
          <select
            id="ziSelectata"
            name="ziSelectata"
            value={ziSelectata}
            onChange={(e) => setZiSelectata(e.target.value)}
            required
          >
            <option value="">Selectează o zi</option>
            <option value="Luni">Luni</option>
            <option value="Marti">Marti</option>
            <option value="Miercuri">Miercuri</option>
            <option value="Joi">Joi</option>
            <option value="Vineri">Vineri</option>
            <option value="Sambata">Sambata</option>
            <option value="Duminica">Duminica</option>
          </select>
        </div>
        <div>
          <label htmlFor="oraInceput">Ora de început:</label>
          <input
            type="time"
            id="oraInceput"
            name="oraInceput"
            value={oraInceput}
            onChange={(e) => setOraInceput(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="oraSfarsit">Ora de sfârșit:</label>
          <input
            type="time"
            id="oraSfarsit"
            name="oraSfarsit"
            value={oraSfarsit}
            onChange={(e) => setOraSfarsit(e.target.value)}
            required
          />
        </div>
        <button type="submit">Adaugă Program</button>
      </form>
    </div>
  );
};

export default AdaugaProgram;
