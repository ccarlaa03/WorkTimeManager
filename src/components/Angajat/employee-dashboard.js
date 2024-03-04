import React, { useState, useEffect } from 'react';
import imagine from '../../photos/imagine-profil.jpg';
import Statistici from './statistici';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import Modal from 'react-modal';
import Pontator from './pontator';
import axios from 'axios';

Modal.setAppElement('#root');

const localizer = momentLocalizer(moment);

const Dashboard = () => {

  const [employeeInfo, setEmployeeInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/employee-dashboard/', { withCredentials: true });
        setEmployeeInfo(res.data.employee_info);
      } catch (error) {
        console.error("Error fetching Employee dashboard data: ", error);
      }
    };

    fetchData();
  }, []);

  const [profil, setProfil] = useState(null);
  const [oreLucrate, setOreLucrate] = useState(40);
  const [zileLibere, setZileLibere] = useState(2);
  const [nume, setNume] = useState('');
  const [post, setPost] = useState('');
  const [departament, setDepartament] = useState('');
  
  const [modalEditareProfilIsOpen, setModalEditareProfilIsOpen] = useState(false);
  const [modalModificareProgramIsOpen, setModalModificareProgramIsOpen] = useState(false);
  const [editareProfil, setEditareProfil] = useState(false);

  const angajatId = 'id-angajat';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const openModificareProgramModal = () => {
    setModalModificareProgramIsOpen(true);
  };

  const closeModificareProgramModal = () => {
    setModalModificareProgramIsOpen(false);
  };

  const handleSaveModificareProgram = (e) => {
    e.preventDefault();
    // Logica de salvare a cererii de modificare a programului de lucru
    console.log("Cerere de modificare a programului de lucru trimisă.");
    closeModificareProgramModal();
  };
  const openEditareProfilModal = () => {
    setModalEditareProfilIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Profil actualizat:", profil);
    setEditareProfil(false);

  };

  const handleSave = (dateActualizate) => {
    setProfil(dateActualizate);
    setEditareProfil(false);
    localStorage.setItem('profil', JSON.stringify(dateActualizate));
  };

  const programLucru = [
    { zi: 'Luni', oraInceput: '09:00', oraSfarsit: '17:00' },
  ];

  const notificari = [
    { text: 'Orar actualizat pentru săptămâna viitoare.' },
  ];
  const [esteDeschisModalModificare, setEsteDeschisModalModificare] = useState(false);


  const [events, setEvents] = useState([
    {
      start: moment().toDate(),
      end: moment().add(3, 'days').toDate(),
    },
  ]);


  const handleSaveEditareProfil = (e) => {
    e.preventDefault();
    // Puteți adăuga logica de salvare a profilului aici
    console.log("Salvează profilul cu noile date", { nume, post, departament });
    closeEditareProfilModal();
  };


  const closeEditareProfilModal = () => {
    setModalEditareProfilIsOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/angajat-profil');
            setProfil(response.data);
        } catch (error) {
            console.error("Eroare la preluarea datelor profilului", error);
        }
    };
    fetchData();
}, []);


  if (isLoading) {
    return <div>Se încarcă...</div>;
  }

  if (error) {
    return <div>A apărut o eroare: {error.message}</div>;
  }


  return (
    <div className="container-dashboard">
      <h1>Dashboard</h1>

      <div className="container-profil">
      <img src={profil.imagine || imagine} alt="Profil" className="imagine-profil" />
      <h3>{profil.nume}</h3>
      <p>{profil.post}</p>
      <p>{profil.departament}</p>
        <button className="buton" onClick={openEditareProfilModal}>Editează profilul</button>
      </div>
      <div class="button-container">
        <Pontator angajatId={angajatId} />
      </div>
      <div className="container-program-lucru">
        <h2>Program de lucru</h2>
        <ul>
          {programLucru.map((zi, index) => (
            <li key={index}>{zi.zi}: {zi.oraInceput} - {zi.oraSfarsit}</li>
          ))}
        </ul>
        <button
          className="buton"
          onClick={openModificareProgramModal}>
          Cere modificare program
        </button>

        
      </div>

      <div className="container-flex">
        <Statistici oreLucrate={oreLucrate} zileLibere={zileLibere} />

        <div className="container-item container-notificari">
          <h2>Notificări</h2>
          <ul>
            {notificari.map((notificare, index) => (
              <li key={index}>{notificare.text}</li>
            ))}
          </ul>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />

      <Modal
        isOpen={modalEditareProfilIsOpen}
        onRequestClose={closeEditareProfilModal}
        contentLabel="Editare Profil"
        className="modal-content"
      >
        <h2>Editare profil</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nume:</label>
            <input
              type="text"
              value={nume}
              onChange={(e) => setNume(e.target.value)}
            />
          </div>
          <div>
            <label>Post:</label>
            <input
              type="text"
              value={post}
              onChange={(e) => setPost(e.target.value)}
            />
          </div>
          <div>
            <label>Departament:</label>
            <input
              type="text"
              value={departament}
              onChange={(e) => setDepartament(e.target.value)}
            />
          </div>
          {/* ...alte câmpuri */}
          <div class="button-container">
            <button className='buton' type="submit">Salvează</button>
            <button className='buton' type="button" onClick={closeEditareProfilModal}>Închide</button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={modalModificareProgramIsOpen}
        onRequestClose={closeModificareProgramModal}
        contentLabel="Modificare Program de Lucru"
        className="modal-content"
      >
        <h2>Modificare Program de Lucru</h2>
        <form onSubmit={handleSaveModificareProgram}>

          <div>
            <label>Ziua:</label>
            <select>

              <option value="Luni">Luni</option>
              <option value="Marți">Marți</option>
              <option value="Miercuri">Miercuri</option>
              <option value="Joi">Joi</option>
              <option value="Vineri">Vineri</option>
            </select>
          </div>
          <div>
            <label>Ora de început:</label>
            <input type="time" />
          </div>
          <div>
            <label>Ora de sfârșit:</label>
            <input type="time" />
          </div>
          <div class="button-container">
            <button className='buton' type="submit">Trimite cererea</button>
            <button className='buton' type="button" onClick={closeModificareProgramModal}>Închide</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
