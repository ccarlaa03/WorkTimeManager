import React, { useState, useEffect } from 'react';
import defaultImage from '../../photos/imagine-profil.jpg';
import Statistici from './statistici';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import Modal from 'react-modal';
import Pontator from './pontator';
import axios from 'axios';
import instance from '../../axiosConfig';

Modal.setAppElement('#root');

const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState({
    name: '',
    position: '',
    department: '',
    hire_date: '',
    working_hours: 0,
    free_days: 0,
    email: '',
    address: '',
    telephone_number: '',
  });

  const [workedHours, setWorkedHours] = useState(40);
  const [freeDays, setFreeDays] = useState(2);
  const [modalEditScheduleIsOpen, setModalEditScheduleIsOpen] = useState(false);
  const [modalEditProfileIsOpen, setModalEditProfileIsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [profileToEdit, setProfileToEdit] = useState({
    name: '',
    telephone_number: '',
    email: '',
    department: '',
    position: '',
    hire_date: '',
    address: '',
  });
  const employeeId = 'employee-id';
  const [isLoading, setIsLoading] = useState(true);


  const openEditScheduleModal = () => {
    setModalEditScheduleIsOpen(true);
  };

  const closeEditScheduleModal = () => {
    setModalEditScheduleIsOpen(false);
  };

  const handleSaveEditSchedule = (e) => {
    e.preventDefault();
    console.log("Request for schedule modification sent.");
    closeEditScheduleModal();
  };

  const openEditModal = () => {
    setProfileToEdit({ ...employeeInfo });
    setModalEditProfileIsOpen(true);
  };

  const closeEditModal = () => {
    setModalEditProfileIsOpen(false);
  };

  const workSchedule = [

  ];

  const notifications = [
    {},
  ];


  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("Access denied. No token available. User must be logged in to access this.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/employee-dashboard/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log(response.data);
        setProfile(response.data);
        setEmployeeInfo(response.data.employee_info)
        setIsLoading(false);
      } catch (error) {
        if (error.response) {
          console.error("Error retrieving profile data:", error.response.data);
        } else {
          console.error("Error retrieving profile data:", error.message);
        }
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  //UPDATE
  const updateEmployeeProfile = async (event) => {
    event.preventDefault();
    console.log("Submitted Data:", profileToEdit);

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error("No access token found. User must be logged in.");
      return;
    }

    // Check if employeeInfo.user_id is available
    if (!employeeInfo.user) {
      console.error("User ID is undefined. Cannot update profile.");
      return;
    }

    try {
      // Using user_id in the URL
      const response = await axios.put(`http://localhost:8000/update-employee-profile/${employeeInfo.user}/`, profileToEdit, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        console.log('Profile update successful', response.data);
        setEmployeeInfo({ ...employeeInfo, ...response.data });
        closeEditModal();
      } else {
        console.error('Failed to update profile', response.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error.response ? error.response.data : error.message);
    }
  };


  if (isLoading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="content-container">
        {isLoading ? (
          <div>Se încarcă...</div>
        ) : employeeInfo ? (
          <>
            <h2 style={{ textAlign: 'center' }}><strong>Bine ai venit, {employeeInfo.name}!</strong></h2>
            <div className="card-curs">

              <p><strong>Post:</strong> {employeeInfo.position}</p>
              <p><strong>Departament:</strong> {employeeInfo.department}</p>
              <p><strong>Data angajării:</strong> {employeeInfo.hire_date}</p>
              <p><strong>Ore lucrate pe lună:</strong> {employeeInfo.working_hours}</p>
              <p><strong>Zile libere:</strong> {employeeInfo.free_days}</p>
              <p><strong>Email:</strong> {employeeInfo.email}</p>
              <p><strong>Adresa:</strong> {employeeInfo.address}</p>
              <p><strong>Numărul de telefon:</strong> {employeeInfo.telephone_number}</p>

              <div className="button-container">
                <button className="buton" onClick={openEditModal} aria-label="Edit profile">
                  Editează
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>Se încarcă datele angajatului...</p>
        )}

      </div>
      <div className="button-container">
        <Pontator employeeId={employeeId} />
      </div>

      <div className="work-schedule-container">
        <h2>Program de lucru</h2>
        <ul>
          {workSchedule.map((day, index) => (
            <li key={index}>{day.day}: {day.startTime} - {day.endTime}</li>
          ))}
        </ul>
        <button
          className="buton"
          onClick={openEditScheduleModal}>
          Cere modificare program de lucru
        </button>
      </div>

      <div className="flex-container">
        <Statistici workedHours={workedHours} freeDays={freeDays} />

        <div className="notifications-container">
          <h2>Notifications</h2>
          <ul>
            {notifications.map((notification, index) => (
              <li key={index}>{notification.text}</li>
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
        isOpen={modalEditProfileIsOpen}
        onRequestClose={closeEditModal}
        contentLabel="Editează Profil"
        className="modal-content"
      >
        <h2>Editează Profil</h2>
        <form onSubmit={updateEmployeeProfile}>
          <label>
            Nume:
            <input
              type="text"
              name="name"
              value={profileToEdit.name || ''}
              onChange={e => setProfileToEdit(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              required
            />
          </label>
          <label>
            Funcție:
            <input
              type="text"
              name="position"
              value={profileToEdit.position || ''}
              onChange={e => setProfileToEdit(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              required
            />
          </label>
          <label>
            Departament:
            <input
              type="text"
              name="department"
              value={profileToEdit.department || ''}
              onChange={e => setProfileToEdit(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              required
            />
          </label>
          <label>
            Data angajării:
            <input
              type="text"
              name="hire_date"
              value={employeeInfo.hire_date}
              readOnly
            />
          </label>
          <label>
            Adresa de email:
            <input
              type="email"
              name="email"
              value={profileToEdit.email || ''}
              onChange={e => setProfileToEdit(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              required
            />
          </label>
          <label>
            Adresă:
            <input
              type="text"
              name="address"
              value={profileToEdit.address || ''}
              onChange={e => setProfileToEdit(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              required
            />
          </label>
          <label>
            Număr de telefon:
            <input
              type="text"
              name="telephone_number"
              value={profileToEdit.telephone_number || ''}
              onChange={e => setProfileToEdit(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              required
            />
          </label>

          <button type="submit">Salvează modificările</button>
          <button type="button" onClick={closeEditModal}>Închide</button>
        </form>

      </Modal>

      <Modal
        isOpen={modalEditScheduleIsOpen}
        onRequestClose={closeEditScheduleModal}
        contentLabel="Edit Work Schedule"
        className="modal-content"
      >
        <h2>Cere modificări programului de lucru</h2>
        <form onSubmit={handleSaveEditSchedule}>
          <div>
            <label>Ziua:</label>
            <select>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>
          <div>
            <label>Ora de început:</label>
            <input type="time" />
          </div>
          <div>
            <label>Ora de sfărșit:</label>
            <input type="time" />
          </div>
          <div className="button-container">
            <button className='buton' type="submit">Trimite</button>
            <button className='buton' type="button" onClick={closeEditScheduleModal}>Închide</button>
          </div>
        </form>
      </Modal>
    </div >
  );
};
export default Dashboard;
