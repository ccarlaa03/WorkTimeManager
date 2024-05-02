import React, { useState, useEffect, useContext } from 'react';
import defaultImage from '../../photos/imagine-profil.jpg';
import Statistici from './statistici';
import Notifications from './notificari';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import Modal from 'react-modal';
import Pontator from './pontator';
import axios from 'axios';
import instance from '../../axiosConfig';
import { AuthContext } from '../../AuthContext';

Modal.setAppElement('#root');

const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
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
    user: '',
  });

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
  const [workSchedule, setWorkSchedule] = useState([]);


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

  const formatTime = (timeString) => {
    const time = new Date('1970-01-01T' + timeString + 'Z');
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
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

    const fetchWorkSchedule = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("No access token found. User must be logged in.");
        return;
      }
      const user = employeeInfo.user;
      if (!employeeInfo.user) {
        console.error("User ID is undefined or not provided.");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8000/angajat-prog/${user}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log("Work Schedule fetched:", response.data);
        console.log('Rendering workSchedule:', workSchedule);

        if (response.status === 200) {
          setWorkSchedule(response.data);
        } else {
          throw new Error('Failed to fetch work schedule');
        }
      } catch (error) {
        console.error('Error fetching work schedule:', error);
      }
    };

    fetchWorkSchedule();
  }, [employeeInfo.user]);

  //UPDATE
  const updateEmployeeProfile = async (event) => {
    event.preventDefault();
    console.log("Submitted Data:", profileToEdit);

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error("No access token found. User must be logged in.");
      return;
    }


    try {
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
            <div className="card-curs" style={{ textAlign: 'center' }}>

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
        <Pontator user_id={employeeInfo.user} />
      </div>

      <div className="content-container">
        <div className="card-curs">
          <h2 style={{ textAlign: 'center' }}>Program de lucru</h2>
          {workSchedule && workSchedule.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th >Data</th>
                  <th>Ora de început</th>
                  <th>Ora de sfârșit</th>
                  <th >Ore suplimentare</th>
                </tr>
              </thead>
              <tbody >
                {workSchedule.map((schedule, index) => (
                  <tr key={index}>
                    <td>{schedule.date}</td>
                    <td>{formatTime(schedule.start_time)}</td>
                    <td>{schedule.end_time ? formatTime(schedule.end_time) : ''}</td>
                    <td>{schedule.overtime_hours ? parseFloat(schedule.overtime_hours).toFixed(2) : '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Încărcarea programului de lucru...</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button
              className="buton"
              onClick={openEditScheduleModal}>
              Cere modificare program de lucru
            </button>
          </div>
        </div>
      </div>


      <div className="flex-container">
        <Notifications user_id={employeeInfo.user} />
        <Statistici user_id={employeeInfo.user} />

        <div className="content-container">
          <div className="card-curs">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
            />
          </div></div>
      </div>
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
