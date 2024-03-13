import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Bar } from 'react-chartjs-2';
import EditareProfil from '../Angajat/editare-profil';
import Modal from 'react-modal';
import instance from '../../axiosConfig';
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
  const [HR, setHR] = useState({});
  const [accessToken, setAccessToken] = useState('');
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editareProfil, setEditareProfil] = useState(false);
  const [esteDeschisModalAdaugareEveniment, setEsteDeschisModalAdaugareEveniment] = useState(false);
  const [evenimentNou, setEvenimentNou] = useState({
    title: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('access_token'); // Use 'access_token', not 'token'
      if (!accessToken) {
        console.log("No access token found. User is not logged in.");
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/hr-dashboard/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log(response.data);
        setHR(response.data);
      } catch (error) {
        console.error("Error fetching data:", error.response ? error.response.data : error.message);
        // If the token is invalid or expired, you can handle it here
      }
    };

    fetchData();
  }, []);;

  

  /*try {
    const eventsResponse = await axios.get('http://localhost:8000/events/');
    setEvents(eventsResponse.data.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    })));
 
    const employeesResponse = await axios.get('http://localhost:8000/employees/');
    setEmployees(employeesResponse.data);
  } 
  
catch (error) {
    console.error("Error fetching data:", error.response ? error.response.data : error.message);
  }*/


  const handleSave = (dateActualizate) => {
    console.log('Salvarea datelor profilului', dateActualizate);
    setEditareProfil(false);
  };

  const handleOpenEditareProfil = () => setEditareProfil(true);
  const handleCloseEditareProfil = () => setEditareProfil(false);
  const handleInchideModalAdauga = () => setEsteDeschisModalAdaugareEveniment(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvenimentNou(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const deschideModalAdaugareEveniment = () => {
    setEvenimentNou({
      ...evenimentNou,
      start: new Date(),
      end: new Date(),
    });
    setEsteDeschisModalAdaugareEveniment(true);
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
    setEvenimentNou({ title: '', startDate: '', startTime: '', endDate: '', endTime: '' });
  };

  const departments = [...new Set(employees.map(emp => emp.department))];
  const departmentData = departments.map(dept => employees.filter(emp => emp.department === dept).length);

  const chartData = {
    labels: departments,
    datasets: [{
      label: 'Numărul de angajați pe departament',
      data: departmentData,
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
        <button onClick={handleOpenEditareProfil}>Editează Profilul</button>
      </div>

      <Modal
        isOpen={editareProfil}
        onRequestClose={handleCloseEditareProfil}
        contentLabel="Editează Profil"
        className="modal-content"
      >
        <EditareProfil onSave={handleSave} onCancel={handleCloseEditareProfil} />
      </Modal>

      <Modal
        isOpen={esteDeschisModalAdaugareEveniment}
        onRequestClose={handleInchideModalAdauga}
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
        style={{ height: 500 }}
      />


      <div className="button-container">
        <button onClick={deschideModalAdaugareEveniment} className="buton">
          Adaugă eveniment nou
        </button>
      </div>

      <br></br>
      <div className="container-statistici">
        <h2>Statisticile departamentelor</h2>
        <Bar data={chartData} options={{ scales: { y: { beginAtZero: true } } }} />
      </div>
    </div>
  );
};
export default HrDashboard;

