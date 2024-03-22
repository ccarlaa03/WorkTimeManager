import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { Link } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import instance from '../../axiosConfig';

const GestionareProgramLucru = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [workHours, setWorkHours] = useState({ start: '', end: '' });
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const localizer = momentLocalizer(moment);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [hrCompanyId, setHrCompany] = useState(null);
  const events = [];
  const getAccessToken = () => localStorage.getItem('access_token');

  useEffect(() => {
    const fetchHrCompany = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.log("No access token found. User is not logged in.");
        return null;
      }
      try {
        const hrResponse = await instance.get('/hr-dashboard/', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (hrResponse.data && hrResponse.data.company_id) {
          console.log('HR Company ID:', hrResponse.data.company_id);
          return hrResponse.data.company_id;
        } else {
          console.log('HR Company data:', hrResponse.data);
          return null;
        }
      } catch (error) {
        console.error('Error fetching HR company data:', error.response ? error.response.data : error);
        return null;
      }
    };

    const fetchWorkSchedules = async (hrCompanyId) => {
      const accessToken = getAccessToken();
      try {
        const workSchedulesResponse = await instance.get(`/workschedules/?company_id=${hrCompanyId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        console.log('Work Schedules data:', workSchedulesResponse.data);
        setWorkSchedules(workSchedulesResponse.data);
      } catch (error) {
        console.error('Error fetching work schedules:', error.response ? error.response.data : error);
      }
    };

    const initializeData = async () => {
      const hrCompanyId = await fetchHrCompany();
      if (hrCompanyId) {
        fetchWorkSchedules(hrCompanyId);
      }
    };

    initializeData();
  }, []);


  const setSelectedEmployee = (value) => {
    // Define your setSelectedEmployee function here
  };

  const setSchedules = (value) => {
    // Define your setSchedules function here
  };

  const getWeek = (date) => {
    // Define your getWeek function here
  };

  const handleUpdateSchedule = (schedule) => {
    // Define your handleUpdateSchedule function here
  };

  const handleDeleteSchedule = (id) => {
    // Define your handleDeleteSchedule function here
  };

  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setWorkHours({ ...workHours, start, end });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!employeeId) {
      alert('Please select an employee.');
      return;
    }

    try {
      await axios.post('/workschedules/', {
        user_id: employeeId,
        name: '',
        department: department,
        date: workHours.date,
        start_time: workHours.start,
        end_time: workHours.end,
        overtime_hours: '',
        shift_type: '',
      });
      alert('Work schedule added successfully!');
    } catch (error) {
      console.error('Error adding work schedule', error);
      alert('Failed to add work schedule.');
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/workschedules/');
      setWorkSchedules(response.data);
    } catch (error) {
      console.error('Error fetching work schedules', error);
    }
  };

  const handleAddWorkSchedule = async (newScheduleData) => {
    const accessToken = getAccessToken();
    try {
      await instance.post('/workschedules/', newScheduleData, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      setWorkSchedules([...workSchedules, newScheduleData]); // Adaugă noul program în state
    } catch (error) {
      console.error('Error adding new work schedule:', error);
    }
  };

  const handleUpdateWorkSchedule = async (id, updatedScheduleData) => {
    const accessToken = getAccessToken();
    try {
      await instance.put(`/workschedules/${id}/`, updatedScheduleData, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      // Actualizează state-ul cu datele programului de lucru actualizat
    } catch (error) {
      console.error('Error updating work schedule:', error);
    }
  };

  const handleDeleteWorkSchedule = async (id) => {
    const accessToken = getAccessToken();
    try {
      await instance.delete(`/workschedules/${id}/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      setWorkSchedules(workSchedules.filter(schedule => schedule.id !== id)); // Șterge programul din state
    } catch (error) {
      console.error('Error deleting work schedule:', error);
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedSchedule(null); // Reset selected schedule for editing
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsAddModalOpen(true);
  };

  const handleSaveWorkSchedule = async (e) => {
    const scheduleData = {
      user: employeeId,
      name: '',
      department: department,
      date: workHours.date,
      start_time: workHours.start,
      end_time: workHours.end,
      overtime_hours: '',
      shift_type: '',
    };
    try {
      let response;
      if (selectedSchedule) {
        response = await axios.put(`/workschedules/${selectedSchedule.id}/`, scheduleData);
      } else {
        response = await axios.post('/workschedules/', scheduleData);
      }
      console.log('Work schedule saved successfully:', response.data);
      handleCloseAddModal();
      fetchSchedules();
    } catch (error) {
      console.error('Error saving work schedule:', error.response ? error.response.data : error);
    }
  };

  return (
    <div className="container-dashboard">
      <h1>Gestionare program lucru</h1>
      <table className="tabel">
        <thead>
          <tr>
            <th>User</th>
            <th>Nume angajat</th>
            <th>Departament</th>
            <th>Data</th>
            <th>Oră de start</th>
            <th>Oră de sfârșit</th>
            <th>Tip schimb</th>
            <th>Ore suplimentare</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {workSchedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.employee_user}</td>
              <td>
                <Link
                  to={`/profil-employee/${schedule.employee_user}`}
                  style={{ color: 'black', textDecoration: 'none', opacity: 0.7 }}
                >
                  {schedule.employee_name}
                </Link>
              </td>
              <td>{schedule.employee_department}</td>
              <td>{moment(schedule.date).format('YYYY-MM-DD')}</td>
              <td>{schedule.start_time}</td>
              <td>{schedule.end_time}</td>
              <td>{schedule.shift_type}</td>
              <td>{schedule.overtime_hours}</td>
              <td>
                <button className='buton' onClick={() => handleEditSchedule(schedule)}>Editează</button>
                <button className='buton' onClick={() => handleDeleteWorkSchedule(schedule.id)}>Șterge</button>
              </td>
            </tr>
          ))}
        </tbody>


      </table>


      <div className="button-container">
        <button className="buton" onClick={handleOpenAddModal}>Adaugă program de lucru</button>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />

      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={handleCloseAddModal}
        className="modal-content"
      >
        <h2>Add Work Schedule</h2>
        <form onSubmit={handleSaveWorkSchedule}>
          <div className="form-row" style={{ display: 'flex', marginBottom: '0' }}>
            <div className="form-group-container">
              <div className="form-group">
                <label htmlFor="department">Department:</label>
                <select
                  className="select-style"
                  id="department"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setEmployeeId('');
                  }}
                >
                  <option value="">Select a department</option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.name}>{dep.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="employee">Employee:</label>
                <select
                  name="employeeId"
                  className="select-style"
                  id="employee"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  disabled={!department}
                >
                  <option value="">Select an employee</option>
                  {filteredEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="form-row" style={{ display: 'flex', marginBottom: '0' }}>
            <div className="form-group">
              <label>Start Time:</label>
              <input
                type="time"
                value={workHours.start}
                onChange={(e) => setWorkHours({ ...workHours, start: e.target.value })}
                className="select-style"
              />
            </div>

            <div className="form-group">
              <label>End Time:</label>
              <input
                type="time"
                value={workHours.end}
                onChange={(e) => setWorkHours({ ...workHours, end: e.target.value })}
                className="select-style"
              />
            </div>
          </div>
          <div className="button-container">
            <button type="submit">Save</button>
            <button type="button" onClick={handleCloseAddModal}>Close</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GestionareProgramLucru;

