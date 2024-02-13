import React, { useState } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { isValid, addDays, getWeek } from 'date-fns';
import isSameWeek from 'date-fns/isSameWeek';
import { Link } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);


const zileLibere = [
  '2024-01-01', // Anul Nou
  '2024-04-01', // Paște
  // Adaugă alte zile libere aici
];
const initialProgramLucru = [
  { id: 1, angajatId: 1, ziuaSaptamanii: 'Luni', oreLucrate: 8 },
  { id: 2, angajatId: 1, ziuaSaptamanii: 'Marti', oreLucrate: 7 },
  // ... alte înregistrări pentru programul de lucru
];

const GestionareProgramLucru = () => {
  const [angajati, setAngajati] = useState([
    { id: 1, nume: 'Ion Popescu' },
    { id: 2, nume: 'Maria Ionescu' },
    // alți angajați
  ]);


  const onChange = (dates) => {
    if (Array.isArray(dates) && dates.length === 2) {
      const [start, end] = dates;
      if (start && end && isValid(start) && isValid(end) && isSameWeek(start, end)) {
        setData([start, end]);
      } else {
        console.error('Datele selectate nu sunt valide sau nu sunt în aceeași săptămână.');
      }
    }
  };



  const [programLucru, setProgramLucru] = useState(initialProgramLucru);
  const [ziuaSaptamanii, setZiuaSaptamanii] = useState('');
  const [angajatId, setAngajatId] = useState('');
  const [oreLucrate, setOreLucrate] = useState('');
  const [modalEditeazaDeschis, setModalEditeazaDeschis] = useState(false);
  const [program, setProgram] = useState({ luni: '', marti: '', miercuri: '', joi: '', vineri: '' });
  const [programId, setProgramId] = useState(null);
  const esteZiLibera = (data) => zileLibere.includes(data);
  const [oreLucru, setOreLucru] = useState({ start: '', end: '' });
  const [inceputSaptamana, setInceputSaptamana] = useState(null);
  const [data, setData] = useState([new Date(), addDays(new Date(), 7)]);
  const [value, setValue] = useState(new Date());
  const [departament, setDepartament] = useState('');
  const [perioada, setPerioada] = useState('zi');
  const [oraInceput, setOraInceput] = useState('');
  const [oraSfarsit, setOraSfarsit] = useState('');
  const [modalAdaugaDeschis, setModalAdaugaDeschis] = useState(false);

  const [events, setEvents] = useState([
    {
      start: moment().toDate(),
      end: moment().add(3, 'days').toDate(),
    },
  ]);

  const [filter, setFilter] = useState({
    departament: '',
    tipConcediu: '',
    nume: '',
    status: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const esteSaptamanaDeLucru = (date) => {
    // Your logic to determine if it's a work week
    // For example, return true if it's not a weekend or holiday
  };

  const handleSchimbareSaptamana = (data) => {
    // Aici presupunem că 'data' este prima zi a săptămânii (ex: luni)
    setInceputSaptamana(data);
    // Calculează și setează sfârșitul săptămânii, dacă este necesar
  };

  const handleSelectieDepartament = (event) => {
    setDepartament(event.target.value);
  };


  const handleSelectieAngajat = (e) => {
    const valoare = e.target.value;
    setAngajati(
      e.target.checked
        ? [...angajati, valoare]
        : angajati.filter((id) => id !== valoare)
    );
  };
  if (data[0] && data[1]) {
    // Atunci când ambele date sunt valide, procedați cu operațiunile necesare
  }


  const handleInchideModalAdauga = () => {
    setModalAdaugaDeschis(false);
    // Resetare orice alte state necesare
  };

  <DatePicker
    selected={data[0] || new Date()}
    onChange={onChange}
    startDate={data[0]}
    endDate={data[1]}
    selectsRange
    inline
  />

  const departamente = ['IT', 'HR', 'Finante', 'Vanzari'];


  // Variabile pentru angajații filtrați după departament
  const angajatiFiltrati = angajati.filter((angajat) => angajat.departament === departament);

  const resetForm = () => {
    setZiuaSaptamanii('');
    setAngajatId('');
    setOreLucrate('');
  };


  const handleDeschideModalAdauga = () => {
    setModalAdaugaDeschis(true);
  };

  const handleDeschideModalEditeaza = () => {
    setModalEditeazaDeschis(true);
  };

  const handleSchimbareProgram = (zi, ore) => {
    setProgram({ ...program, [zi]: ore });
  };

  const handleSalveazaProgramLucru = () => {
    if (modalAdaugaDeschis) {
      console.log('Program salvat pentru angajații:', angajati);
      console.log('Program:', program);
      // Resetare formular după salvare
      setAngajati([]);
      setProgram({ luni: '', marti: '', miercuri: '', joi: '', vineri: '' });
      if (esteZiLibera(ziuaSaptamanii)) {
        alert('Ziua selectată este o zi liberă. Alege o altă dată.');
        return; // Opriți executarea funcției
      }
      if (ziuaSaptamanii && angajatId && oraInceput && oraSfarsit) {
        const newProgram = {
          id: programLucru.length + 1,
          angajatId: parseInt(angajatId),
          ziuaSaptamanii: ziuaSaptamanii,
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
      if (ziuaSaptamanii && angajatId && oraInceput && oraSfarsit) {
        const updatedProgramLucru = [...programLucru];

        const index = updatedProgramLucru.findIndex((program) => program.id === programId);

        updatedProgramLucru[index] = {
          ...updatedProgramLucru[index],
          angajatId: parseInt(angajatId),
          ziuaSaptamanii: ziuaSaptamanii,
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
              <th>Nume angajat</th>
              <th>Departament</th>
              <th>Săptămâna de lucru</th>
              <th>Ore lucrate</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {programLucru.map((program) => {
              const angajat = angajati.find((a) => a.id === program.angajatId);

              const saptamanaLucru = getWeek(new Date(program.dataInceput));

              return (
                <tr key={program.id}>
                  <td>{angajat.id}</td>
                  <td>
                    <Link to={`/profil-angajat/${angajat.id}`}>
                      {angajat.nume}
                    </Link>
                  </td>
                  <td>{angajat.departament}</td>
                  <td>{saptamanaLucru}</td>
                  <td>{program.oreLucrate}</td>
                  <td>
                    <button className="buton" onClick={() => handleDeschideModalEditeaza()}>Editează</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>


        <div class="button-container">
          <button className="buton" onClick={() => handleDeschideModalAdauga()}>Adaugă program de lucru</button>
        </div>
        <br></br>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />

        <Modal
          isOpen={modalAdaugaDeschis}
          onRequestClose={handleInchideModalAdauga}
          className="modal-content"
        >
          <h2>Adaugă program de lucru</h2>
          <form onSubmit={handleSalveazaProgramLucru}>
          <div className="form-row" style={{ display: 'flex', marginBottom: '0' }}>
              <div className="form-group-container"> 
                <div className="form-group">
                  <label htmlFor="departament">Departament:</label>
                  <select
                    className="select-style"
                    id="departament"
                    value={departament}
                    onChange={(e) => {
                      setDepartament(e.target.value);
                      setAngajatId('');
                    }}
                  >
                    <option value="">Selectează un departament</option>
                    {departamente.map((dep) => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="angajat">Angajat:</label>
                  <select
                    name="angajatId"
                    className="select-style"
                    id="angajat"
                    value={angajatId}
                    onChange={handleFilterChange}
                    disabled={!departament}
                  >
                    <option value="">Selectează un angajat</option>
                    {angajati
                      .filter(angajat => angajat.departament === departament)
                      .map((angajat) => (
                        <option key={angajat.id} value={angajat.id}>
                          {angajat.nume}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="form-row" style={{ display: 'flex', marginBottom: '0' }}>
              <div className="form-group">
                <label htmlFor="zi">Zi specifică</label>
                <input
                  type="radio"
                  id="zi"
                  name="perioada"
                  value="zi"
                  checked={perioada === 'zi'}
                  onChange={() => setPerioada('zi')}
                  className="select-style"
                />
              </div>

              <div className="form-group">
                <label htmlFor="saptamana">Săptămână întreagă</label>
                <input
                  type="radio"
                  id="saptamana"
                  name="perioada"
                  value="saptamana"
                  checked={perioada === 'saptamana'}
                  onChange={() => setPerioada('saptamana')}
                  className="select-style"
                />
              </div>
            </div>

            {perioada === 'saptamana' && (
              <div>
                <label htmlFor="inceputSaptamana">Alege săptămâna:</label>
                <DatePicker
                  selected={data[0] || new Date()}
                  onChange={onChange}
                  startDate={data[0]}
                  endDate={data[1]}
                  selectsRange
                  inline
                />
              </div>
            )}

<div className="form-row" style={{ display: 'flex', marginBottom: '0' }}>
              <div className="form-group">
                <label>Ora de început:</label>
                <input
                  type="time"
                  value={oreLucru.start}
                  onChange={(e) => setOreLucru({ ...oreLucru, start: e.target.value })}
                  className="select-style"
                />
              </div>

              <div className="form-group">
                <label>Ora de sfârșit:</label>
                <input
                  type="time"
                  value={oreLucru.end}
                  onChange={(e) => setOreLucru({ ...oreLucru, end: e.target.value })}
                  className="select-style"
                />
              </div>
            </div>
            <div className="button-container">
              <button type="submit">Salvează</button>
              <button type="button" onClick={handleInchideModalAdauga}>Închide</button>

            </div>

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
            <label htmlFor="ziuaSaptamanii">Ziua săptămânii:</label>
            <select
              id="ziuaSaptamanii"
              value={ziuaSaptamanii}
              onChange={(e) => setZiuaSaptamanii(e.target.value)}
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
              disabled={!ziuaSaptamanii}
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
            <button type="submit" onClick={() => handleSalveazaProgramLucru()}>Salvează</button>
            <button type="button" onClick={() => setModalEditeazaDeschis(false)}>Închide</button>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default GestionareProgramLucru;
