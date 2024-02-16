import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Modal from 'react-modal';

Modal.setAppElement('#root');



const ProgramLucru = ({ programLucruInitial, zileLibereInitial }) => {
  const [lunaCurenta, setLunaCurenta] = useState(new Date());
  const [programLucru, setProgramLucru] = useState(programLucruInitial || []);
  const [zileLibere, setZileLibere] = useState(zileLibereInitial || []);
  const [istoricProgram, setIstoricProgram] = useState([]);
  const [esteDeschisModalModificare, setEsteDeschisModalModificare] = useState(false);
  const [zi, setZi] = useState('');
  const [oraInceput, setOraInceput] = useState('');
  const [oraSfarsit, setOraSfarsit] = useState('');

  useEffect(() => {
    // Aici poți face o cerere la server pentru a încărca programul de lucru și zilele libere

    async function incarcaDate() {
      try {
        const programLucruDeLaServer = await fetchProgramLucru(lunaCurenta);
        const zileLibereDeLaServer = await fetchZileLibere(lunaCurenta);
        const istoricDeLaServer = await fetchIstoricProgram(lunaCurenta);

        setProgramLucru(programLucruDeLaServer);
        setZileLibere(zileLibereDeLaServer);
        setIstoricProgram(istoricDeLaServer);
      } catch (error) {
        console.error('Eroare la încărcarea datelor', error);
        // Aici poți de asemenea actualiza starea aplicației pentru a indica o eroare la încărcare
      }
    }

    incarcaDate();
  }, [lunaCurenta]);

  // Funcția pentru a merge la luna precedentă
  const handleLunaPrecedenta = () => {
    setLunaCurenta(new Date(lunaCurenta.getFullYear(), lunaCurenta.getMonth() - 1));
  };

  // Funcția pentru a merge la luna următoare
  const handleLunaUrmatoare = () => {
    setLunaCurenta(new Date(lunaCurenta.getFullYear(), lunaCurenta.getMonth() + 1));
  };

  // Simularea unei cereri asincrone către un server pentru a obține programul de lucru
  const fetchProgramLucru = async (lunaCurenta) => {
    // Aici ar fi codul pentru a face un apel HTTP către server
    // În loc, vom returna un răspuns mock (simulat)
    return Promise.resolve([
      { zi: '01/01/2024', oraInceput: '09:00', oraSfarsit: '17:00' },
      // ... alte zile
    ]);
  };

  // Simularea unei cereri asincrone către un server pentru a obține zilele libere
  const fetchZileLibere = async (lunaCurenta) => {
    // Aici ar fi codul pentru a face un apel HTTP către server
    // În loc, vom returna un răspuns mock (simulat)
    return Promise.resolve([
      { data: '06/01/2024', motiv: 'Sărbătoare legală' },
      // ... alte zile libere
    ]);
  };

  // Simularea unei cereri asincrone către un server pentru a obține istoricul programului de lucru
  const fetchIstoricProgram = async (lunaCurenta) => {
    // Aici ar fi codul pentru a face un apel HTTP către server
    // În loc, vom returna un răspuns mock (simulat)
    return Promise.resolve([
      { data: '01/12/2023', oraInceput: '09:00', oraSfarsit: '17:00' },
      // ... istoricul programului de lucru
    ]);
  };

  const handleSubmitModificare = (e) => {
    e.preventDefault();
    // Logica de trimitere a cererii de modificare
    console.log('Cerere de modificare trimisă:', { zi, oraInceput, oraSfarsit });
    setEsteDeschisModalModificare(false); // Închide modalul după trimitere
  };

  return (
    <div>
      <div className='container-dashboard'>
        <h1>Programul meu de lucru</h1>
        <div class="button-container">
          <button className="buton" onClick={() => setLunaCurenta(new Date(lunaCurenta.getFullYear(), lunaCurenta.getMonth() - 1))}>
            Luna Precedentă
          </button>
          <button className="buton" onClick={() => setLunaCurenta(new Date(lunaCurenta.getFullYear(), lunaCurenta.getMonth() + 1))}>
            Luna Următoare
          </button>
        </div>

        <section>
          <div className="container-program-lucru">
            <h2>Istoric program de lucru</h2>
            {istoricProgram.length > 0 ? (
              istoricProgram.map((istoric, index) => (
                <div key={index}>
                  <p>{istoric.data}: {istoric.oraInceput} - {istoric.oraSfarsit}</p>
                </div>
              ))
            ) : (
              <p>Nu există un istoric disponibil pentru această lună.</p>
            )}
          </div>
        </section>

        <section>
          <div className="container-program-lucru">
            <h2>Programul curent</h2>
            {programLucru.length > 0 ? (
              <ul>
                {programLucru.map((zi, index) => (
                  <li key={index}>{zi.data}: {zi.oraInceput} - {zi.oraSfarsit}</li>
                ))}
              </ul>
            ) : (
              <p>Nu există un program de lucru definit pentru această lună.</p>
            )}
          </div>
        </section>

        <section>
          <div className="container-program-lucru">
            <h2>Zile libere curente</h2>
            {zileLibere.length > 0 ? (
              <ul>
                {zileLibere.map((zi, index) => (
                  <li key={index}>{zi.data} - Motiv: {zi.motiv}</li>
                ))}
              </ul>
            ) : (
              <p>Nu există zile libere în această lună.</p>
            )}
          </div>
        </section>
        <div class="button-container">
          <button
            className="buton"
            onClick={() => setEsteDeschisModalModificare(true)}
          >
            Cere modificare program
          </button>
        </div>

      </div>
      <Modal
        isOpen={esteDeschisModalModificare}
        onRequestClose={() => setEsteDeschisModalModificare(false)}
        contentLabel="Modificare Program de Lucru"
        className="modal-content"
      >
        <h2>Modificare program de lucru</h2>
        <form onSubmit={handleSubmitModificare}>
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
          <div className="button-container">
            <button className='buton' type="submit">Trimite cererea</button>
            <button className='buton' type="button" onClick={() => setEsteDeschisModalModificare(false)}>Închide</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


export default ProgramLucru;
