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
import Cookies from 'js-cookie';

const GestionareProgramLucru = () => {

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [workHours, setWorkHours] = useState({ start: '', end: '' });
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [hrCompanyId, setHrCompany] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeeDepartment, setEmployeeDepartment] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [selectedWeekDays, setSelectedWeekDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  });
  const csrfToken = Cookies.get('csrftoken');
  const [selectedDateRange, setSelectedDateRange] = useState([new Date(), new Date()]);
  const localizer = momentLocalizer(moment);
  const events = [];
  const getAccessToken = () => localStorage.getItem('access_token');
  axios.defaults.xsrfCookieName = 'csrftoken';
  axios.defaults.xsrfHeaderName = 'X-CSRFToken';

  useEffect(() => {
    const initializeData = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.log("No access token found. User is not logged in.");
        return;
      }

      try {
        const hrCompanyId = await fetchHrCompany();
        if (hrCompanyId) {
          fetchWorkSchedules(hrCompanyId);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

  axios.interceptors.request.use(function (config) {
    const csrftoken = Cookies.get('csrftoken');
    config.headers['X-CSRFToken'] = csrftoken;
    return config;
  });

  const fetchHrCompany = async () => {
    try {
      const accessToken = getAccessToken();
      const hrResponse = await instance.get('/hr-dashboard/', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (hrResponse.data && hrResponse.data.company_id) {
        console.log('HR Company ID:', hrResponse.data.company_id);
        setHrCompany(hrResponse.data.company_id);
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
      const workSchedulesResponse = await instance.get(`/gestionare-prog/?company_id=${hrCompanyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      console.log('Work Schedules data:', workSchedulesResponse.data);
      setWorkSchedules(workSchedulesResponse.data);
    } catch (error) {
      console.error('Error fetching work schedules:', error.response ? error.response.data : error);
    }
  };

  const handleCreateWorkSchedule = async (e) => {
    e.preventDefault();
    const accessToken = getAccessToken();
    const daysToAdd = Object.entries(selectedWeekDays)
      .filter(([_, isSelected]) => isSelected)
      .map(([day]) => day);
    const datesToAdd = getDatesInRange(selectedDateRange[0], selectedDateRange[1], daysToAdd);

    for (const employeeId of selectedEmployeeIds) {
      for (const date of datesToAdd) {
        const scheduleData = {
          department: department,
          employee: employeeId,
          date: moment(selectedDateRange[0]).format('YYYY-MM-DD'),
          start_time: workHours.start,
          end_time: workHours.end,
          overtime_hours: workHours.overtime_hours
        };
        
        try {
          const response = await axios.post('http://localhost:8000/workschedule-create/', scheduleData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken  
            }
        })
          console.log('Work schedule saved successfully:', response.data);
        } catch (error) {
          console.error('Error saving work schedule:', error.response ? error.response.data : error);
        }
      }
    }

    handleCloseAddModal();
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.error("No access token found. User is not logged in.");
        return;
      }

      try {
        const response = await axios.get('/gestionare-ang/', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        console.log('All Employees:', response.data);

        const filtered = response.data.filter(employee => {
          console.log(`Checking employee with company_id: ${employee.company}`);
          return employee.company === hrCompanyId;
        });

        console.log(`Filtered Employees for company_id ${hrCompanyId}:`, filtered);

        if (filtered.length === 0) {
          console.log('No matching employees found for company ID:', hrCompanyId);
        }

        setFilteredEmployees(filtered);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    if (hrCompanyId) {
      fetchEmployees();
    }
  }, [hrCompanyId]);


  const getDatesInRange = (startDate, endDate, daysToAdd) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];

    while (start <= end) {
      if (daysToAdd.includes(start.toLocaleString('en-US', { weekday: 'long' }).toLowerCase())) {
        dates.push(new Date(start));
      }
      start.setDate(start.getDate() + 1);
    }

    return dates;
  };


  useEffect(() => {

    const filtered = allEmployees.filter(employee =>
      employee.company_id === hrCompanyId
    );
    setFilteredEmployees(filtered);
  }, [allEmployees, hrCompanyId]);



  const handleEmployeeSelectionChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
    setSelectedEmployeeIds(selectedOptions);
    if (selectedOptions.length > 0) {
      setEmployeeId(selectedOptions[0]);
    }
  };
  


  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setSelectedDateRange([start, end]);
  };

  const handleDeleteWorkSchedule = async (id) => {
    const accessToken = getAccessToken();
    try {
      await instance.delete(`/workschedules/${id}/delete/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      setWorkSchedules(workSchedules.filter(schedule => schedule.id !== id));
      alert('Work schedule deleted successfully!');
    } catch (error) {
      console.error('Error deleting work schedule:', error);
    }
  };

  const handleEditWorkSchedule = async (event) => {
    event.preventDefault();
    if (!selectedSchedule) {
      console.error('No schedule selected for editing.');
      return;
    }
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error("No access token found. User is not logged in.");
      return;
    }

    const updatedScheduleData = {
      department: department,
      employee: selectedSchedule.employee_user,
      date: moment(selectedDateRange[0]).format('YYYY-MM-DD'),
      start_time: workHours.start,
      end_time: workHours.end,
      overtime_hours: workHours.overtime_hours,
      id: selectedSchedule.id
    };

    try {
      const response = await axios.put(`http://localhost:8000/workschedule_update/${selectedSchedule.id}/`, updatedScheduleData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        }
      });


      // The rest of your code can use `response` because it is in the same scope
      console.log("Response status:", response.status);
      console.log("Data received from the server:", response.data);

      if (response.status === 200) {
        console.log('Update successful', response.data);
        setWorkSchedules(previousSchedules =>
          previousSchedules.map(schedule =>
            schedule.id === selectedSchedule.id ? { ...schedule, ...response.data } : schedule
          )
        );

        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating work schedule:', error.response ? error.response.data : error);
    }
  };


  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedSchedule(null);
  };

  const OpenEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    if (schedule) {
      setSelectedSchedule(schedule);
      setEmployeeDepartment(schedule.employee_department);
      setEmployeeId(schedule.employee_user);
      setWorkHours({ start: schedule.start_time, end: schedule.end_time });
      setEmployeeName(schedule.employee_name);
      setIsEditModalOpen(true);
    }
  };


  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSchedule(null);
  };


  return (
    <div className="container-dashboard">
      <h1>Gestionare program lucru</h1>
      <table className="tabel">
        <thead>
          <tr>
            <th>User</th>
            <th>Nume</th>
            <th>Departament</th>
            <th>Data</th>
            <th>Oră de start</th>
            <th>Oră de sfârșit</th>
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
              <td>{schedule.overtime_hours}</td>
              <td>
                <button className='buton' onClick={() => OpenEditModal(schedule)}>Editează</button>

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
        title="Adaugă program de lucru"
        buttonText="Adaugă"
        handleSubmit={handleCreateWorkSchedule}
        className="modal-content"
      >
        <h2>Adaugă program de lucru</h2>
        <form onSubmit={handleCreateWorkSchedule}>
          <div className="form-group">
            <label htmlFor="employee">Angajat:</label>
            <select multiple value={selectedEmployeeIds} onChange={handleEmployeeSelectionChange}>
              {filteredEmployees.map((employee) => (
                <option key={employee.user} value={employee.user}>
                  {`${employee.name} - ${employee.department}`}
                </option>
              ))}
            </select>

          </div>

          <div className="form-group">
            <label>Intervalul de timp:</label>
            <DatePicker
              selectsRange
              startDate={selectedDateRange[0]}
              endDate={selectedDateRange[1]}
              onChange={handleDateRangeChange}
              className="select-style"
            />
          </div>

          <div className="form-row" style={{ display: 'flex' }}>
            <div className="form-group">
              <label htmlFor="start_time">Oră de start:</label>
              <input
                type="time"
                id="start_time"
                value={workHours.start}
                onChange={(e) => setWorkHours({ ...workHours, start: e.target.value })}
                className="select-style"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">Oră de sfârșit:</label>
              <input
                type="time"
                id="end_time"
                value={workHours.end}
                onChange={(e) => setWorkHours({ ...workHours, end: e.target.value })}
                className="select-style"
                required
              />
            </div>
          </div>

          <div className="button-container">
            <button type="submit" className="buton">
              Adaugă
            </button>
            <button type="button" className="buton" onClick={handleCloseAddModal}>
              Închide
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={handleCloseEditModal}
        title="Editare program de lucru"
        buttonText="Salvează"
        handleSubmit={handleEditWorkSchedule}
        className="modal-content"
      >
        <h2>Editare program de lucru</h2>
        <form onSubmit={handleEditWorkSchedule}>
          <div className="form-group">
            <label htmlFor="employeeName">Nume angajat:</label>
            <input
              type="text"
              id="employeeName"
              className="select-style"
              value={employeeName}
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">Departament:</label>
            <input
              type="text"
              id="department"
              className="select-style"
              value={employeeDepartment}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Intervalul de timp:</label>
            <DatePicker
              selectsRange
              startDate={selectedDateRange[0]}
              endDate={selectedDateRange[1]}
              onChange={handleDateRangeChange}
              className="select-style"
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_time">Oră de start:</label>
            <input
              type="time"
              id="start_time"
              value={workHours.start}
              onChange={(e) => setWorkHours({ ...workHours, start: e.target.value })}
              className="select-style"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_time">Oră de sfârșit:</label>
            <input
              type="time"
              id="end_time"
              value={workHours.end}
              onChange={(e) => setWorkHours({ ...workHours, end: e.target.value })}
              className="select-style"
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="overtime_hours">Ore suplimentare:</label>
            <input
              type="number"
              id="overtime_hours"
              min="0"
              step="0.1"
              value={workHours.overtime_hours}
              onChange={(e) => setWorkHours({ ...workHours, overtime_hours: e.target.value })}
              className="select-style"
              required
            />
          </div>


          <div className="button-container">
            <button type="submit" className="buton">Salvează</button>

            <button type="button" className="buton" onClick={handleCloseEditModal}>Închide</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default GestionareProgramLucru;
