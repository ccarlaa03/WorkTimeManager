import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';


const GestionareFeedback = () => {
  const [cautare, setCautare] = useState("");
  const [filtrareDepartament, setFiltrareDepartament] = useState("");
  const [paginaCurenta, setPaginaCurenta] = useState(1);
  const [filtrareLuna, setFiltrareLuna] = useState('');
  const navigate = useNavigate();
  const NUMAR_ANGAJATI_PER_PAGINA = 5;


  // Inițializează lista angajaților aici
  const angajati = [
    { id: 1, nume: 'Angajat 1', departament: 'HR', data: '2024-01-01', puncte: 85 },
    { id: 2, nume: 'Angajat 2', departament: 'Marketing', data: '2024-01-02', puncte: 92 },

  ];

  // Calculul mediei punctajelor pentru fiecare departament
  const mediiPunctajeDepartamente = useMemo(() => {
    const sume = {};
    const counts = {};

    angajati.forEach(angajat => {
      if (!sume[angajat.departament]) {
        sume[angajat.departament] = 0;
        counts[angajat.departament] = 0;
      }
      sume[angajat.departament] += angajat.puncte;
      counts[angajat.departament] += 1;
    });

    return Object.keys(sume).map(departament => ({
      departament,
      punctajMediu: sume[departament] / counts[departament],
    }));
  }, [angajati]);

  const dataForChart = {
    labels: mediiPunctajeDepartamente.map(item => item.departament),
    datasets: [{
      label: 'Punctaj mediu per departament',
      data: mediiPunctajeDepartamente.map(item => item.punctajMediu),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }]
  };

  const options = {
    // opțiunile tale pentru grafic, dacă este cazul
  };

  // Apoi folosește logica de filtrare și paginație
  const angajatiFiltrati = angajati
    .filter(angajat => angajat.nume.toLowerCase().includes(cautare.toLowerCase()))
    .filter(angajat => filtrareDepartament ? angajat.departament === filtrareDepartament : true);

  const numarTotalAngajati = angajatiFiltrati.length;
  const indexUltimAngajat = paginaCurenta * NUMAR_ANGAJATI_PER_PAGINA;
  const indexPrimAngajat = indexUltimAngajat - NUMAR_ANGAJATI_PER_PAGINA;
  const angajatiCurenti = angajatiFiltrati.slice(indexPrimAngajat, indexUltimAngajat);

  // Definirea funcției paginate
  const paginate = (numarPagina) => setPaginaCurenta(numarPagina);


  // Afișează butoanele de paginație
  const butoanePaginatie = (
    <div className='pagination'>
      {Array.from(Array(Math.ceil(numarTotalAngajati / NUMAR_ANGAJATI_PER_PAGINA)).keys()).map(num => (
        <button key={num} onClick={() => paginate(num + 1)}>
          {num + 1}
        </button>
      ))}
    </div>
  );
  const handleSearch = () => {

  };
  const componentaCautare = (
    <div>
      <input
        type="text"
        placeholder="Caută după nume..."
        value={cautare}
        onChange={(e) => setCautare(e.target.value)}
      />
        <button onClick={handleSearch} className="buton">
        Caută
      </button>

      <select
        value={filtrareDepartament}
        onChange={(e) => setFiltrareDepartament(e.target.value)}
      >
        <option value="">Toate departamentele</option>
        {/* Aici ar trebui să listezi toate departamentele unice din datele tale */}
      </select>
      <select
        value={filtrareLuna}
        onChange={(e) => setFiltrareLuna(e.target.value)}
      >
        <option value="">Toate lunile</option>
        {/* Opțiuni pentru luni */}
      </select>
  
    </div>
  );

  const handleNavigateToProfile = (angajatId) => {
    navigate(`/user-profil/${angajatId}`);
  };


  return (
    <div>
      <div className="container-dashboard">
        <h1>Gestionare feedback angajați</h1>
        {componentaCautare}
        <table className="tabel column">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume angajat</th>
              <th>Departament</th>
              <th>Data</th>
              <th>Punctaj</th>
            </tr>
          </thead>
          <tbody>
            {angajatiCurenti.map(angajat => (
              <tr key={angajat.id}>
                <td>{angajat.id}</td>
                <td onClick={() => handleNavigateToProfile(angajat.id)} style={{ cursor: 'pointer' }}>
                  {angajat.nume}
                </td>

                <td>{angajat.departament}</td>
                <td>{angajat.data}</td>
                <td>{angajat.puncte}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div class="button-container">
          <Link to="/gestionare-formular">
            <button className="buton">Modifică formular Feedback</button>
          </Link>
        </div>

        <Bar data={dataForChart} options={options} />

        {butoanePaginatie}


      </div>
    </div>
  );
};

export default GestionareFeedback;
