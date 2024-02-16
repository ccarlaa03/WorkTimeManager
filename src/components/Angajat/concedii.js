import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Concedii = () => {
  const [esteDeschisFormularCerere, setEsteDeschisFormularCerere] = useState(false);
  const [dataInceput, setDataInceput] = useState('');
  const [dataSfarsit, setDataSfarsit] = useState('');
  const [zileLibere, setZileLibere] = useState('');
  const [motiv, setMotiv] = useState('');
  // Logică pentru încărcarea stocului și vizualizarea concediilor...

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Cererea de concediu:', { dataInceput, dataSfarsit, zileLibere, motiv });
    // Logică pentru trimiterea datelor
    setEsteDeschisFormularCerere(false); // Închide formularul după trimitere
  };

  return (
    <div className='container-dashboard'>
      <h1>Concedii</h1>

      <div className="button-container">
        <button className="buton" onClick={() => setEsteDeschisFormularCerere(true)}>
          Cerere Concediu
        </button>
      </div>

      <div className="container-program-lucru">
        <h2>Stoc concedii</h2>
        {/* Componenta sau detaliile dvs. pentru stocul de concedii */}
        <ul>
          <li>Concediu de odihnă: 20 zile</li>
          <li>Concediu medical: conform certificatelor medicale</li>
          {/* Alte tipuri de concedii, dacă există */}
        </ul>
      </div>

      <div className="container-program-lucru">
        <h2>Vizualizare concedii</h2>
        {/* Componenta sau lista dvs. pentru vizualizarea concediilor */}
        <table className="tabel column">
          <thead>
            <tr>
              <th>Tip concediu</th>
              <th>Data început</th>
              <th>Data sfârșit</th>
              <th>Stare</th>
            </tr>
          </thead>
          <tbody>
            {/* Iterați prin lista de concedii și afișați detaliile */}
            <tr>
              <td>Concediu de odihnă</td>
              <td>15.07.2024</td>
              <td>29.07.2024</td>
              <td>Aprobat</td>
            </tr>
            {/* Alte concedii */}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={esteDeschisFormularCerere}
        onRequestClose={() => setEsteDeschisFormularCerere(false)}
        contentLabel="Cerere de concediu"
        className="modal-content"
      >
        <h2>Cerere de concediu</h2>
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
            <button type="button" onClick={() => setEsteDeschisFormularCerere(false)}>Închide</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Concedii;
