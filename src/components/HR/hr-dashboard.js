import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/App.css';
import { Bar } from 'react-chartjs-2';
import imagine from '../../photos/imagine-profil.jpg';
import EditareProfil from '../Angajat/editare-profil';
import Modal from 'react-modal';
import axios from 'axios';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const localizer = momentLocalizer(moment);

const HrDashboard = () => {
  const [hrInfo, setHrInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/hr-dashboard/', { withCredentials: true });
        setHrInfo(res.data.hr_info);
      } catch (error) {
        console.error("Error fetching HR dashboard data: ", error);
      }
    };

    fetchData();
  }, []);


  const [profil, setProfil] = useState({
    nume: 'Carla Chereji',
    titlu: 'Manager HR',
    departament: 'Resurse Umane',
    imagine: imagine,
  });
  const [editareProfil, setEditareProfil] = useState(false);
  const [events, setEvents] = useState([
    {
      start: moment().toDate(),
      end: moment().add(1, 'days').toDate(),
    },
  ]);


  const handleSave = (dateActualizate) => {
    setProfil(dateActualizate);
    setEditareProfil(false);
    localStorage.setItem('profil', JSON.stringify(dateActualizate));
  };


  const [angajati, setAngajati] = useState([
    { nume: 'Angajat 1', departament: 'Resurse Umane' },
    { nume: 'Angajat 2', departament: 'Resurse Umane' },
    { nume: 'Angajat 3', departament: 'Finanțe' },
    { nume: 'Angajat 4', departament: 'Resurse Umane' },
    { nume: 'Angajat 5', departament: 'IT' },
  ]);


  const [esteDeschisModalAdaugareEveniment, setEsteDeschisModalAdaugareEveniment] = useState(false);
  const [evenimentNou, setEvenimentNou] = useState({
    titlu: '',
    start: new Date(),
    end: new Date(),
  });

  const deschideModalAdaugareEveniment = () => {
    setEvenimentNou({
      ...evenimentNou,
      start: new Date(),
      end: new Date(),
    });
    setEsteDeschisModalAdaugareEveniment(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvenimentNou(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAdaugaEveniment = (e) => {
    e.preventDefault();
    const evenimentAdaugat = {
      title: evenimentNou.title,
      start: new Date(`${evenimentNou.startDate}T${evenimentNou.startTime}`),
      end: new Date(`${evenimentNou.endDate}T${evenimentNou.endTime}`),
    };


    setEvents(prevEvents => [...prevEvents, evenimentAdaugat]);


    setEsteDeschisModalAdaugareEveniment(false);
    setEvenimentNou({
      title: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    });
  };

  const handleInchideModalAdauga = () => {
    setEsteDeschisModalAdaugareEveniment(false);
  };

  // Datele pentru graficul cu numărul de angajați pe departamente
  const departamente = [...new Set(angajati.map(angajat => angajat.departament))];
  const numarAngajatiPeDepartamente = departamente.map(departament =>
    angajati.filter(angajat => angajat.departament === departament).length
  );



  const graficDepartamente = {
    labels: departamente,
    datasets: [
      {
        label: 'Număr de angajați',
        data: numarAngajatiPeDepartamente,
        borderWidth: 1,
      },
    ],
  };


  const [esteDeschisModalEditareProfil, setEsteDeschisModalEditareProfil] = useState(false);
  return (
    <div className="container-dashboard">
      <h1>Dashboard HR</h1>
      <div className="container-profil">
        <img src={profil.imagine} alt="Profil" />
        <h3>{profil.nume}</h3>
        <p>{profil.titlu}</p>
        <p>{profil.departament}</p>
        <button className="buton" onClick={() => setEsteDeschisModalEditareProfil(true)}>Editează Profilul</button>

      </div>

      <Modal
        isOpen={esteDeschisModalEditareProfil}
        onRequestClose={() => setEsteDeschisModalEditareProfil(false)}
        contentLabel="Editează Profil"
        className="modal-content"
      >
        <EditareProfil
          profil={profil}
          isOpen={esteDeschisModalEditareProfil}
          onClose={() => setEsteDeschisModalEditareProfil(false)}
          onSave={handleSave}
        />
      </Modal>


      <Modal
        isOpen={esteDeschisModalAdaugareEveniment}
        onRequestClose={() => setEsteDeschisModalAdaugareEveniment(false)}
        className="modal-content"
      >
        <form onSubmit={handleAdaugaEveniment}>
          <div className="form-group">
            <label>Eveniment:</label>
            <input
              type="text"
              name="title"
              value={evenimentNou.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-row" style={{ display: 'flex' }}>
            <div className="form-group">
              <label>Data de început:</label>
              <input
                type="date"
                name="startDate"
                value={evenimentNou.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ora de început:</label>
              <input
                type="time"
                name="startTime"
                value={evenimentNou.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-row" style={{ display: 'flex' }}>
            <div className="form-group">
              <label>Data de sfârșit:</label>
              <input
                type="date"
                name="endDate"
                value={evenimentNou.endDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ora de sfârșit:</label>
              <input
                type="time"
                name="endTime"
                value={evenimentNou.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="button-container">
            <button className='buton' type="submit">Adaugă</button>
            <button className='buton' type="button" onClick={handleInchideModalAdauga}>Închide</button>
          </div>
        </form>
      </Modal>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 400 }}
      />
      
      <div class="button-container">
        <button onClick={deschideModalAdaugareEveniment} className="buton">
          Adaugă eveniment nou
        </button>
      </div>
      <br></br>
      <div className="container-statistici">
        <h2>Statisticile departamentelor</h2>
        <Bar data={graficDepartamente} options={{ scales: { y: { beginAtZero: true } } }} />
      </div>
    </div>

  );
};
export default HrDashboard;

