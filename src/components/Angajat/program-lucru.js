import React, { useState, useEffect } from 'react';
import FormularModificare from './Formular-mod';

const ProgramLucru = ({ programLucruInitial, zileLibereInitial }) => {
  const [lunaCurenta, setLunaCurenta] = useState(new Date());
  const [programLucru, setProgramLucru] = useState(programLucruInitial || []);
  const [zileLibere, setZileLibere] = useState(zileLibereInitial || []);
  const [istoricProgram, setIstoricProgram] = useState([]);
  const [esteDeschisModalModificare, setEsteDeschisModalModificare] = useState(false);

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

  // Presupunem că funcțiile fetchProgramLucru, fetchZileLibere, fetchIstoricProgram sunt definite și returnează datele necesare
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

  // Apoi, asigură-te că aceste funcții sunt accesibile în componenta ta prin import sau prin a fi definite în același fișier


  return (
    <div>
      <div className='container-dashboard'>
        <h1>Programul meu de lucru</h1>
        <button className="buton" onClick={() => setLunaCurenta(new Date(lunaCurenta.getFullYear(), lunaCurenta.getMonth() - 1))}>
          Luna Precedentă
        </button>
        <button  className="buton"  onClick={() => setLunaCurenta(new Date(lunaCurenta.getFullYear(), lunaCurenta.getMonth() + 1))}>
          Luna Următoare
        </button>

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

        <button
          className="buton"
          onClick={() => setEsteDeschisModalModificare(true)}
        >
          Cere modificare program
        </button>
        {esteDeschisModalModificare && (
          <FormularModificare
            onClose={() => setEsteDeschisModalModificare(false)}
          />
        )}
      </div>
    </div>
  );
};


export default ProgramLucru;
