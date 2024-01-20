import React, { useState } from 'react';
import Modal from 'react-modal';

const initialAngajati = [
  { id: 1, nume: 'Ion Popescu', departament: 'IT' },
  { id: 2, nume: 'Maria Ionescu', departament: 'HR' },
  // ... alte obiecte pentru angajați
];

const initialProgramLucru = [
  { id: 1, angajatId: 1, ziuaSaptamanii: 'Luni', oreLucrate: 8 },
  { id: 2, angajatId: 1, ziuaSaptamanii: 'Marti', oreLucrate: 7 },
  // ... alte înregistrări pentru programul de lucru
];

const GestionareProgramLucru = () => {
  const [angajati, setAngajati] = useState(initialAngajati);
  const [programLucru, setProgramLucru] = useState(initialProgramLucru);
  const [ziuaSaptamaniiSelectata, setZiuaSaptamaniiSelectata] = useState('');
  const [angajatId, setAngajatId] = useState('');
  const [oreLucrate, setOreLucrate] = useState('');
  const [modalDetaliiDeschis, setModalDetaliiDeschis] = useState(false);
  const [modalAdaugaDeschis, setModalAdaugaDeschis] = useState(false);
  const [modalEditeazaDeschis, setModalEditeazaDeschis] = useState(false);
  const [oraInceput, setOraInceput] = useState('');
  const [oraSfarsit, setOraSfarsit] = useState('');

  const [programLucruSelectat, setProgramLucruSelectat] = useState(null);
  const [programIdSelectat, setProgramIdSelectat] = useState(null);

  // Variabile pentru departament
  const [departamentSelectat, setDepartamentSelectat] = useState(''); // Adaugăm aici
  const departamente = ['IT', 'HR', 'Finante', 'Vanzari']; // Adăugați aici departamentele disponibile

  // Variabile pentru angajații filtrați după departament
  const angajatiFiltrati = angajati.filter((angajat) => angajat.departament === departamentSelectat);

  const resetForm = () => {
    setZiuaSaptamaniiSelectata('');
    setAngajatId('');
    setOreLucrate('');
  };

  const handleDeschideModalDetalii = () => {
    setModalDetaliiDeschis(true);
  };

  const handleDeschideModalAdauga = () => {
    setModalAdaugaDeschis(true);
  };

  const handleDeschideModalEditeaza = () => {
    setModalEditeazaDeschis(true);
  };

  const angajatDetalii = angajati.find((angajat) => angajat.id === programLucruSelectat?.angajatId);

  const handleSalveazaProgramLucru = () => {
    if (modalAdaugaDeschis) {
      // Validate data and add a new work schedule
      if (ziuaSaptamaniiSelectata && angajatId && oraInceput && oraSfarsit) {
        const newProgram = {
          id: programLucru.length + 1,
          angajatId: parseInt(angajatId),
          ziuaSaptamanii: ziuaSaptamaniiSelectata,
          oraInceput,
          oraSfarsit,
        };

        setProgramLucru([...programLucru, newProgram]);
        resetForm();
        setModalAdaugaDeschis(false);
      } else {
        alert('Completează toate câmpurile pentru a adăuga programul de lucru.');
      }
    } else if (modalEditeazaDeschis) {
      if (ziuaSaptamaniiSelectata && angajatId && oraInceput && oraSfarsit) {
        const updatedProgramLucru = [...programLucru];

        const index = updatedProgramLucru.findIndex((program) => program.id === programIdSelectat);

        updatedProgramLucru[index] = {
          ...updatedProgramLucru[index],
          angajatId: parseInt(angajatId),
          ziuaSaptamanii: ziuaSaptamaniiSelectata,
          oraInceput,
          oraSfarsit,
        };

        setProgramLucru(updatedProgramLucru);
        resetForm();
        setModalEditeazaDeschis(false);
      } else {
        alert('Completează toate câmpurile pentru a actualiza programul de lucru.');
      }
    }
  };


  return (
    <div>
      <div className="container-dashboard">
        <h1>Gestionare program lucru</h1>

        <table className="tabel column">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume Angajat</th>
              <th>Departament</th>
              <th>Ziua Săptămânii</th>
              <th>Ore Lucrate</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {programLucru.map((program) => {
              const angajat = angajati.find((a) => a.id === program.angajatId);

              return (
                <tr key={program.id}>
                  <td>{angajat.id}</td>
                  <td>{angajat.nume}</td>
                  <td>{angajat.departament}</td>
                  <td>{program.ziuaSaptamanii}</td>
                  <td>{program.oreLucrate}</td>
                  <td>
                    <button className="buton" onClick={() => handleDeschideModalDetalii()}>Detalii</button>
                    <button className="buton" onClick={() => handleDeschideModalEditeaza()}>Editează</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="form-group" style={{ textAlign: "center" }}>
          <button className="buton" onClick={() => handleDeschideModalAdauga()}>Adaugă program de lucru</button>
        </div>

        <Modal
          isOpen={modalDetaliiDeschis}
          onRequestClose={() => {
            setModalDetaliiDeschis(false);
          }}
          contentLabel="Detalii program lucru"
          className="modal-content"
        >
          <h2>Detalii Program Lucru</h2>
          <p>Aici puteți vedea informații detaliate despre programul de lucru selectat.</p>
          {programLucruSelectat && (
            <>
              <p><strong>Angajat:</strong> {angajatDetalii ? angajatDetalii.nume : ''}</p>
              <p><strong>Ziua Săptămânii:</strong> {programLucruSelectat.ziuaSaptamanii}</p>
              <p><strong>Ore Lucrate:</strong> {programLucruSelectat.oreLucrate}</p>
            </>
          )}
          <button onClick={() => setModalDetaliiDeschis(false)}>Închide</button>
        </Modal>

        <Modal
          isOpen={modalAdaugaDeschis}
          onRequestClose={() => {
            setModalAdaugaDeschis(false);
            resetForm();
          }}
          contentLabel="Adaugă program lucru"
          className="modal-content"
        >
          <h2>Adaugă Program Lucru</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="departament">Departament:</label>
            <select
              id="departament"
              value={departamentSelectat}
              onChange={(e) => setDepartamentSelectat(e.target.value)}
            >
              <option value="">Selectează un departament</option>
              {departamente.map((departament) => (
                <option key={departament} value={departament}>
                  {departament}
                </option>
              ))}
            </select>

            {departamentSelectat && (
              <>
                <label htmlFor="ziuaSaptamanii">Ziua Săptămânii:</label>
                <select
                  id="ziuaSaptamanii"
                  value={ziuaSaptamaniiSelectata}
                  onChange={(e) => setZiuaSaptamaniiSelectata(e.target.value)}
                >
                  <option value="">Selectează o zi</option>
                  <option value="Luni">Luni</option>
                  <option value="Marti">Marti</option>
                  <option value="Miercuri">Miercuri</option>
                  <option value="Joi">Joi</option>
                  <option value="Vineri">Vineri</option>
                  <option value="Sâmbătă">Sâmbătă</option>
                  <option value="Duminică">Duminică</option>
                </select>
                <label htmlFor="angajatId">Angajat:</label>
                <select
                  id="angajatId"
                  value={angajatId}
                  onChange={(e) => setAngajatId(e.target.value)}
                  disabled={!ziuaSaptamaniiSelectata}
                >
                  <option value="">Selectează un angajat</option>
                  {angajatiFiltrati.map((angajat) => (
                    <option key={angajat.id} value={angajat.id}>
                      {angajat.nume}
                    </option>
                  ))}
                </select>
                <label htmlFor="oraInceput">Ora de început:</label>
                <input
                  id="oraInceput"
                  type="time"
                  value={oraInceput}
                  onChange={(e) => setOraInceput(e.target.value)}
                />

                <label htmlFor="oraSfarsit">Ora de sfârșit:</label>
                <input
                  id="oraSfarsit"
                  type="time"
                  value={oraSfarsit}
                  onChange={(e) => setOraSfarsit(e.target.value)}
                />

              </>
            )}

            <button type="submit" onClick={() => handleSalveazaProgramLucru()}>Salvează program de lucru</button>
            <button type="button" onClick={() => setModalAdaugaDeschis(false)}>Închide</button>
          </form>
        </Modal>


        <Modal
          isOpen={modalEditeazaDeschis}
          onRequestClose={() => {
            setModalEditeazaDeschis(false);
            resetForm();
          }}
          contentLabel="Editează Program Lucru"
          className="modal-content"
        >
          <h2>Editează Program Lucru</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="ziuaSaptamanii">Ziua Săptămânii:</label>
            <select
              id="ziuaSaptamanii"
              value={ziuaSaptamaniiSelectata}
              onChange={(e) => setZiuaSaptamaniiSelectata(e.target.value)}
            >
              <option value="">Selectează o zi</option>
              <option value="Luni">Luni</option>
              <option value="Marti">Marti</option>
              <option value="Miercuri">Miercuri</option>
              <option value="Joi">Joi</option>
              <option value="Vineri">Vineri</option>
              <option value="Sâmbătă">Sâmbătă</option>
              <option value="Duminică">Duminică</option>
            </select>
            <label htmlFor="angajatId">Angajat:</label>
            <select
              id="angajatId"
              value={angajatId}
              onChange={(e) => setAngajatId(e.target.value)}
              disabled={!ziuaSaptamaniiSelectata}
            >
              <option value="">Selectează un angajat</option>
              {angajati.map((angajat) => (
                <option key={angajat.id} value={angajat.id}>
                  {angajat.nume}
                </option>
              ))}
            </select>
            <label htmlFor="oreLucrate">Ore Lucrate:</label>
            <input
              id="oreLucrate"
              type="number"
              value={oreLucrate}
              onChange={(e) => setOreLucrate(e.target.value)}
            />
            <button type="submit" onClick={() => handleSalveazaProgramLucru()}>Salvează modificările</button>
            <button type="button" onClick={() => setModalEditeazaDeschis(false)}>Închide</button>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default GestionareProgramLucru;
