import React from 'react';

const Training= ({ cursuriAngajat }) => {
  const [cautare, setCautare] = useState('');
  const [filtru, setFiltru] = useState('toate');
  // Adăugați logica de componentă aici

   // Filtrarea cursurilor pe baza textului de căutare și a filtrului selectat
   const filtreazaCursuri = () => {
    return cursuriAngajat.filter(curs => {
      const criteriuCautare = curs.titlu.toLowerCase().includes(cautare.toLowerCase());
      const criteriuFiltru = filtru === 'toate' || curs.status === filtru;
      return criteriuCautare && criteriuFiltru;
    });
  };

  return (
    <div className="container-dashboard">
      <h1>Training și Dezvoltare</h1>
      

      <div>
      <input 
        type="text" 
        placeholder="Caută în cursuri..." 
        onChange={(e) => setCautare(e.target.value)}
      />
      <select onChange={(e) => setFiltru(e.target.value)}>
        <option value="toate">Toate Categoriile</option>
        <option value="completat">Cursuri Completate</option>
        <option value="inCurs">Cursuri în Curs</option>
      </select>

      {/* Afișarea cursurilor filtrate */}
      <ul>
        {cursuriFiltrate.map((curs, index) => (
          <li key={index}>
            {curs.titlu} - {curs.status} - {curs.dataFinalizare || 'N/A'}
          </li>
        ))}
      </ul>
    </div>
    
      <div className="form-group">
        {/* Implementați funcționalitatea de căutare aici */}
      </div>

      <div className="section">
        <h2>Cursuri Recomandate</h2>
        {/* Lista cursurilor recomandate */}
      </div>

      <div className="banner">
        {/* Bannere informative */}
      </div>

      <div className="feedback">
        {/* Feedback de la angajați */}
      </div>
    </div>
  );
};

export default Training;
