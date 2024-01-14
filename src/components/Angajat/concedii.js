import React, { useState } from 'react';
import FormularCerereConcediu from './formular-con';

const Concedii = () => {
  const [esteDeschisFormularCerere, setEsteDeschisFormularCerere] = useState(false);

  // Logică pentru încărcarea stocului și vizualizarea concediilor...

  return (
    <div className='container-dashboard'>
      <h1>Concedii</h1>

      <div className="container-program-lucru">
        <h2>Stoc Concedii</h2>
        {/* Componenta sau detaliile dvs. pentru stocul de concedii */}
      </div>

      <div className="container-program-lucru">
        <h2>Vizualizare Concedii</h2>
        {/* Componenta sau lista dvs. pentru vizualizarea concediilor */}
      </div>

      <button className="buton" onClick={() => setEsteDeschisFormularCerere(true)}>
        Cerere Concediu
      </button>

      {esteDeschisFormularCerere && (
        <FormularCerereConcediu onClose={() => setEsteDeschisFormularCerere(false)} />
      )}
    </div>
  );
};

export default Concedii;
