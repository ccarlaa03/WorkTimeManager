import React, { useState, useEffect } from 'react';

const UrmărireProgresHR = () => {
  const [progresAngajati, setProgresAngajati] = useState([]);

  useEffect(() => {
    // Logica pentru preluarea progresului angajaților
    // setProgresAngajati(dataProgres);
  }, []);

  return (
    <div className="container-dashboard">
      <h1>Urmărire Progres Training</h1>

      <div className="rapoarte-progres">
        {progresAngajati.map(angajat => (
          <div key={angajat.id} className="card-progres">
            <h3>{angajat.nume}</h3>
            <p>Progres cursuri: {angajat.progres}%</p>
            {/* Alte detalii relevante, cum ar fi cursurile în curs și finalizate */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrmărireProgresHR;
