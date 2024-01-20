import React, { useState } from 'react';

const FormularAdaugareIntalnire = ({ onAdaugaIntalnire, onClose }) => {
    const [data, setData] = useState('');
    const [ora, setOra] = useState('');
    const [subiect, setSubiect] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      onAdaugaIntalnire({ data, ora, subiect });
      onClose(); // Închiderea formularului după adăugare
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <label>Data:</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
        <div>
          <label>Ora:</label>
          <input
            type="time"
            value={ora}
            onChange={(e) => setOra(e.target.value)}
          />
        </div>
        <div>
          <label>Subiect:</label>
          <input
            type="text"
            value={subiect}
            onChange={(e) => setSubiect(e.target.value)}
          />
        </div>
        <button type="submit">Adaugă</button>
        <button onClick={onClose}>Închide</button>
      </form>
    );
};

export default FormularAdaugareIntalnire;
