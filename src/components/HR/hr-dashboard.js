import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Bar } from 'react-chartjs-2';
import Modal from 'react-modal';
import instance from '../../axiosConfig';
import 'chart.js/auto';
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
  const [HR, setHR] = useState({ id: '', name: '', position: '', department: '', company: '', company_id: '' });
  const [events, setEvents] = useState([]);
  const [profileEdit, setEditProfile] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: moment().toDate(), end: moment().toDate() });
  const getAccessToken = () => localStorage.getItem('access_token');
  const [updateSuccess, setUpdateSuccess] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.log("No access token found. User is not logged in.");
        return;
      }

      try {
        const hrResponse = await instance.get('/hr-dashboard/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (hrResponse.data) {
          setHR({
            id: hrResponse.data.id || '',
            name: hrResponse.data.name || '',
            position: hrResponse.data.position || '',
            department: hrResponse.data.department || '',
            company: hrResponse.data.company || '',
            company_id: hrResponse.data.company_id || '',
            user_id: hrResponse.data.user_id || '',
          });
        }
        console.log('Company data:', hrResponse.data.company_id);

        const eventsResponse = await axios.get('/events/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setEvents(eventsResponse.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        })));
      } catch (error) {
        console.error("Error fetching data:", error.response ? error.response.data : error.message);
      }
    };
    fetchData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setHR((prevHR) => ({ ...prevHR, [name]: value }));
  };
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("No access token provided.");
      return;
    }

    const userId = HR.id;
    const company_id = HR.company_id;

    if (!userId) {
      console.error("User ID is undefined.");
      return;
    }

    const profileData = {
      name: HR.name,
      position: HR.position,
      department: HR.department,
      company: HR.company.id,
      id: HR.id,
      company_id: HR.company_id,
    };

    console.log('Submitting profile update:', profileData);

    try {
      const response = await axios.put(`http://localhost:8000/update-profile/${userId}/`, profileData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile updated successfully', response.data);
      setUpdateSuccess(true);
      closeEditProfileModal();
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error during profile update:', error);
      if (error.response) {
        console.error('Error data:', error.response.data);
      }
    }
  };


  const handleEventInputChange = (e) => {
    const { name, value } = e.target;

    const newValue = (name === 'start' || name === 'end') ? new Date(value) : value;

    setNewEvent({ ...newEvent, [name]: newValue });
  };


  const handleAddEvent = async (e) => {
    e.preventDefault();
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("No access token provided.");
      return;
    }

    if (!HR.company) {
      console.error("No company ID associated with this HR user.");
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

      console.log('Event added successfully', response.data);
      setIsAddEventModalOpen(false);
      setEvents([...events, { ...response.data, start: new Date(response.data.start), end: new Date(response.data.end) }]);
    } catch (error) {
      console.error('Error during event addition:', error.response ? error.response.data : error.message);
      if (error.response) {
        console.error('Full error response:', error.response);
      }
    }
  };


  const openEditProfileModal = () => setEditProfile(true);
  const closeEditProfileModal = () => setEditProfile(false);
  const closeAddEventModal = () => setIsAddEventModalOpen(false);

  const openAddEventModal = () => {
    setNewEvent({
      ...newEvent,
      start: new Date(),
      end: new Date(),
    });
    setIsAddEventModalOpen(true);
  };

  const chartData = {
    labels: ['Department 1', 'Department 2', 'Department 3'],
    datasets: [{
      label: 'Numărul de angajați pe departament',
      data: [10, 20, 30],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };

  return (
    <div className="container-dashboard">
      <h1>Dashboard HR</h1>
      <h2>Bine ai venit, {HR.name}</h2>

      <div className="container-profil">
        <h2>{HR.name || 'Nume Implicit'}</h2>
        <p>Post: {HR.position || 'Poziție Implicită'}</p>
        <p>Departament: {HR.department || 'Departament Implicit'}</p>
        <p>Companie: {HR.company || 'Companie Implicită'}</p>

      </div>
      {updateSuccess && <div className="update-success-message">Datele au fost actualizate cu succes!</div>}
      <Modal isOpen={profileEdit} onRequestClose={closeEditProfileModal} contentLabel="Editare Profil" className="modal-content">
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
          <label>Descrie:</label>
          <input
            type="text"
            name="description"
            placeholder="Descrie"
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

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />

      <div className="button-container">
        <button onClick={openAddEventModal} className="button">
          Adaugă eveniment nou
        </button>
      </div>

      <br />
      <div className="container-statistici">
        <h2>Statisticile departamentelor</h2>
        <Bar data={chartData} options={{ scales: { y: { beginAtZero: true } } }} />
      </div>
    </div>
  );
};

export default HrDashboard;
