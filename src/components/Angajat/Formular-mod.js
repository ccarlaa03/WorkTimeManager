import React, { useState } from 'react';

const FormularModificare= ({ onClose }) => {
  const [zi, setZi] = useState('');
  const [oraInceput, setOraInceput] = useState('');
  const [oraSfarsit, setOraSfarsit] = useState('');

  const handleSubmit = (e) => {
    console.log('handleSubmit called');
    e.preventDefault();
    fetch('/api/cerere-modificare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ zi, oraInceput, oraSfarsit }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Cererea a fost trimisă:', data);
      alert('Cererea a fost trimisă. Te vom anunța noi în legătură cu decizia.');
      onClose(); 
    })
    .catch((error) => {
      console.error('Eroare la trimiterea cererii:', error);
    });
  };
  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Ziua:</label>
          <input
            type="date"
            value={zi}
            onChange={(e) => setZi(e.target.value)}
          />
        </div>
        <div>
          <label>Ora de început:</label>
          <input
            type="time"
            value={oraInceput}
            onChange={(e) => setOraInceput(e.target.value)}
          />
        </div>
        <div>
          <label>Ora de sfârșit:</label>
          <input
            type="time"
            value={oraSfarsit}
            onChange={(e) => setOraSfarsit(e.target.value)}
          />
        </div>
        <button type="submit">Trimite cererea</button>
        <button type="button" onClick={onClose}>Închide</button>
      </form>
    </div>
  );
};

export default FormularModificare;
