import React, { useState } from 'react';

const FormularCerereConcediu = ({ onClose }) => {
  const [dataInceput, setDataInceput] = useState('');
  const [dataSfarsit, setDataSfarsit] = useState('');
  const [zileLibere, setZileLibere] = useState('');
  const [motiv, setMotiv] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aici ar trebui să adăugați logica de trimitere a cererii de concediu la server
    console.log('Cererea de concediu:', { dataInceput, dataSfarsit, zileLibere, motiv });

    // Aici ar fi codul pentru a face o cerere POST către server
    // Exemplu de trimitere a datelor către server
    fetch('/api/cerere-concediu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dataInceput, dataSfarsit, zileLibere, motiv }),
    })
    .then(response => {
      if(response.ok) {
        return response.json();
      }
      throw new Error('Răspunsul rețelei nu a fost ok.');
    })
    .then(data => {
      alert('Cererea dvs. de concediu a fost trimisă cu succes.');
      onClose(); // Închideți formularul după trimitere
    })
    .catch((error) => {
      console.error('Eroare la trimiterea cererii de concediu:', error);
    });
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Data început:</label>
          <input
            type="date"
            value={dataInceput}
            onChange={(e) => setDataInceput(e.target.value)}
          />
        </div>
        <div>
          <label>Data sfârșit:</label>
          <input
            type="date"
            value={dataSfarsit}
            onChange={(e) => setDataSfarsit(e.target.value)}
          />
        </div>
        <div>
          <label>Zile libere:</label>
          <input
            type="number"
            value={zileLibere}
            onChange={(e) => setZileLibere(e.target.value)}
          />
        </div>
        <div>
          <label>Motivul concediului:</label>
          <textarea
            value={motiv}
            onChange={(e) => setMotiv(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button type="submit">Trimite cererea</button>
          <button type="button" onClick={onClose}>Închide</button>
        </div>
      </form>
    </div>
  );
};

export default FormularCerereConcediu;
