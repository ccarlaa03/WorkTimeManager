import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';
import instance from '../../axiosConfig';
import 'chart.js/auto';
import axios from 'axios';
import DepartmentRaporte from './employee-rapoarte';

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
  const [HR, setHR] = useState({ id: '', name: '', position: '', department: '', company: '', company_id: '' });
  const [events, setEvents] = useState([]);
  const [profileEdit, setEditProfile] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: moment().toDate(), end: moment().toDate() });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Obține token-ul de acces din localStorage
  const getAccessToken = () => localStorage.getItem('access_token');

  // Deschide modalul de profil
  const openModal = () => {
    setModalIsOpen(true);
  };

  // Închide modalul de profil
  const closeModal = () => {
    setModalIsOpen(false);
  }

  // Preia datele inițiale ale profilului HR și evenimentele asociate
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.log("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
        return;
      }

      try {
        const hrResponse = await instance.get('/hr-dashboard/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (hrResponse.data) {
          console.log('Date HR:', hrResponse.data);
          setHR({
            id: hrResponse.data.id || '',
            name: hrResponse.data.name || '',
            position: hrResponse.data.position || '',
            department: hrResponse.data.department || '',
            company: hrResponse.data.company || '',
            company_id: hrResponse.data.company_id || '',
          });
          setEvents(hrResponse.data.events.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          })));
        }
      } catch (error) {
        console.error("Eroare la preluarea datelor:", error.response ? error.response.data : error.message);
      }
    };
    fetchData();
  }, []);

  // Funcția pentru gestionarea modificărilor din formularul de profil HR
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setHR((prevHR) => ({ ...prevHR, [name]: value }));
  };

  // Funcția pentru actualizarea profilului HR
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("Nu s-a furnizat niciun token de acces.");
      return;
    }

    const userId = HR.id;

    if (!userId) {
      console.error("ID-ul utilizatorului nu este definit.");
      return;
    }

    const profileData = {
      name: HR.name,
      position: HR.position,
      department: HR.department,
      company: HR.company,
      company_id: HR.company_id,
    };

    console.log('Trimitere actualizare profil:', profileData);

    try {
      const response = await axios.put(`http://localhost:8000/update-profile/${userId}/`, profileData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profil actualizat cu succes', response.data);
      setUpdateSuccess(true);
      closeEditProfileModal();
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Eroare la actualizarea profilului:', error);
      if (error.response) {
        console.error('Date eroare:', error.response.data);
      }
    }
  };

  // Funcția pentru gestionarea modificărilor din formularul de eveniment
  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = (name === 'start' || name === 'end') ? new Date(value) : value;
    setNewEvent({ ...newEvent, [name]: newValue });
  };

  // Funcția pentru adăugarea unui nou eveniment
  const handleAddEvent = async (e) => {
    e.preventDefault();
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("Nu s-a furnizat niciun token de acces.");
      return;
    }

    if (!HR.company) {
      console.error("Nu există niciun ID de companie asociat cu acest utilizator HR.");
      return;
    }
    const eventData = {
      title: newEvent.title,
      description: newEvent.description,
      start: newEvent.start instanceof Date ? newEvent.start.toISOString() : newEvent.start,
      end: newEvent.end instanceof Date ? newEvent.end.toISOString() : newEvent.end,
      company: HR.company
    };

    try {
      const response = await axios.post(`http://localhost:8000/add-event/`, eventData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Eveniment adăugat cu succes', response.data);
      setIsAddEventModalOpen(false);
      setEvents([...events, { ...response.data, start: new Date(response.data.start), end: new Date(response.data.end) }]);
    } catch (error) {
      console.error('Eroare la adăugarea evenimentului:', error.response ? error.response.data : error.message);
      if (error.response) {
        console.error('Răspuns complet eroare:', error.response);
      }
    }
  };

  const openEditProfileModal = () => setEditProfile(true);
  const closeEditProfileModal = () => setEditProfile(false);
  const closeAddEventModal = () => setIsAddEventModalOpen(false);

  // Funcția pentru deschiderea modalului de adăugare a unui eveniment
  const openAddEventModal = () => {
    setNewEvent({
      ...newEvent,
      start: new Date(),
      end: new Date(),
    });
    setIsAddEventModalOpen(true);
  };

  return (
    <div className="container-dashboard">
      <h1>Bine ai venit, {HR.name}</h1>
      <div className="container-profil">
        <h2>{HR.name || 'Nume Implicit'}</h2>
        <p>Post: {HR.position || 'Poziție Implicită'}</p>
        <p>Departament: {HR.department || 'Departament Implicit'}</p>
        <p>Companie: {HR.company || 'Companie Implicită'}</p>
      </div>
      {updateSuccess && <div className="update-success-message">Datele au fost actualizate cu succes!</div>}
      <Modal isOpen={profileEdit} onRequestClose={closeEditProfileModal} contentLabel="Editare Profil" className="modal-content-hr">
        <form onSubmit={handleProfileUpdate}>
          <label>Nume:</label>
          <input
            type="text"
            name="name"
            value={HR.name}
            onChange={handleProfileChange}
          />
          <label>Post:</label>
          <input
            type="text"
            name="position"
            value={HR.position}
            onChange={(e) => setHR({ ...HR, position: e.target.value })}
          />
          <label>Departament:</label>
          <input
            type="text"
            name="department"
            value={HR.department}
            onChange={(e) => setHR({ ...HR, department: e.target.value })}
          />
          <label>Companie:</label>
          <input
            type="text"
            name="company"
            value={HR.company}
            onChange={(e) => setHR({ ...HR, company: e.target.value })}
          />
          <button type="submit">Salvează modificările</button>
        </form>
      </Modal>

      <Modal isOpen={isAddEventModalOpen} onRequestClose={closeAddEventModal} contentLabel="Adaugă Eveniment" className="modal-content">
        <form onSubmit={handleAddEvent}>
          <label>Eveniment:</label>
          <input
            type="text"
            name="title"
            placeholder="Titlu Eveniment"
            value={newEvent.title}
            onChange={handleEventInputChange}
            required
          />
          <label>Descriere:</label>
          <input
            type="text"
            name="description"
            placeholder="Descriere"
            value={newEvent.description}
            onChange={handleEventInputChange}
            required
          />
          <label>Data de început:</label>
          <input
            type="datetime-local"
            name="start"
            value={moment(newEvent.start).format("YYYY-MM-DDTHH:mm")}
            onChange={handleEventInputChange}
            required
          />
          <label>Data de sfârșit:</label>
          <input
            type="datetime-local"
            name="end"
            value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")}
            onChange={handleEventInputChange}
            required
          />
          <button className="button" type="submit">Adaugă Eveniment</button>
        </form>
      </Modal>
      <div className="card-curs">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />

        <div className="button-container">
          <button onClick={openAddEventModal} className="buton">
            Adaugă eveniment nou
          </button>
        </div>
      </div>
      <div className="card-curs">
        <DepartmentRaporte />
      </div>
    </div>
  );
};

export default HrDashboard;



