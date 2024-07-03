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
import ReactPaginate from 'react-paginate';

const GestionareProgramLucru = () => {

  const [currentPage, setCurrentPage] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [workHours, setWorkHours] = useState({ start: '', end: '' });
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [hrCompanyId, setHrCompany] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeeDepartment, setEmployeeDepartment] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const csrfToken = Cookies.get('csrftoken');
  const [selectedDateRange, setSelectedDateRange] = useState([new Date(), new Date()]);
  const localizer = momentLocalizer(moment);
  const employeesPerPage = 6;
  const [totalPages, setTotalPages] = useState(0);
  const events = [];
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const getAccessToken = () => localStorage.getItem('access_token');
  axios.defaults.xsrfCookieName = 'csrftoken';
  axios.defaults.xsrfHeaderName = 'X-CSRFToken';

  const schedulesPerPage = 10;

  const showModal = (message) => {
    setModalMessage(message);
    setModalOpen(true);
  };
  // Folosește un interceptor pentru a adăuga token-ul CSRF la toate cererile
  axios.interceptors.request.use(function (config) {
    const csrftoken = Cookies.get('csrftoken');
    config.headers['X-CSRFToken'] = csrftoken;
    return config;
  });

  // Folosește efectul pentru a inițializa datele
  useEffect(() => {
    const initializeData = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.error("Nu a fost găsit niciun token de acces. Utilizatorul nu este autentificat.");
        return;
      }

      try {
        const hrCompanyId = await fetchHrCompany();
        if (hrCompanyId) {
          fetchWorkSchedules(hrCompanyId);
        }
      } catch (error) {
        console.error('Eroare la inițializarea datelor:', error);
      }
    };

    initializeData();
  }, []);

  // Folosește efectul pentru a obține departamentele
  useEffect(() => {
    const fetchDepartments = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.error("Nu a fost găsit niciun token de acces. Utilizatorul nu este autentificat.");
        return;
      }
      const response = await axios.get('http://localhost:8000/departments/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      console.log('Departamente:', response.data);
      if (response.data && response.data.departments) {
        setDepartments(response.data.departments);
      } else {
        console.error('Datele departamentelor nu au fost primite sau sunt în format incorect:', response.data);
      }
    };

    fetchDepartments();
  }, []);

  // Folosește efectul pentru a obține programele de lucru
  useEffect(() => {
    if (hrCompanyId) {
      fetchWorkSchedules();
    }
  }, [currentPage, hrCompanyId]);

  // Schimbă pagina curentă
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Funcția pentru obținerea angajaților dintr-un departament
  const fetchEmployees = async () => {
    if (!selectedDepartment) {
      console.error("Nu a fost selectat niciun departament.");
      return;
    }

    const params = new URLSearchParams({
      department: selectedDepartment,
      page: currentPage + 1,
      per_page: employeesPerPage,
    }).toString();

    const url = `http://localhost:8000/hr/${hrCompanyId}/employees/?page_size=100`;
    console.log(`Obținerea angajaților din URL-ul: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.results) {
        setFilteredEmployees(response.data.results);
      } else {
        setFilteredEmployees([]);
      }
    } catch (error) {
      console.error('Eroare la obținerea angajaților:', error);
    }
  };

  useEffect(() => {
    if (hrCompanyId && selectedDepartment) {
      fetchEmployees();
    }
  }, [selectedDepartment]);

  // Funcția pentru obținerea programelor de lucru
  const fetchWorkSchedules = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("Nu a fost găsit niciun token de acces.");
      return;
    }

    if (!hrCompanyId) {
      console.error("Nu a fost găsit niciun ID al companiei HR.");
      return;
    }

    const params = new URLSearchParams({
      page: currentPage + 1,
      per_page: schedulesPerPage,
    }).toString();

    const url = `http://localhost:8000/gestionare-prog/${hrCompanyId}/schedules/?${params}`;
    console.log(`Obținerea programelor de lucru din URL-ul: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.results) {
        setWorkSchedules(response.data.results);
        setTotalPages(Math.ceil(response.data.count / employeesPerPage));
      } else {
        setWorkSchedules([]);
        console.error('Datele programelor de lucru nu au fost primite sau sunt în format incorect:', response.data);
      }
    } catch (error) {
      console.error('Eroare la obținerea programelor de lucru:', error.response ? error.response.data : error);
    }
  };

  // Funcția pentru obținerea companiei HR
  const fetchHrCompany = async () => {
    try {
      const accessToken = getAccessToken();
      const hrResponse = await instance.get('/hr-dashboard/', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (hrResponse.data && hrResponse.data.company_id) {
        console.log('ID-ul Companiei HR:', hrResponse.data.company_id);
        setHrCompany(hrResponse.data.company_id);
        return hrResponse.data.company_id;
      } else {
        console.log('Datele Companiei HR:', hrResponse.data);
        return null;
      }
    } catch (error) {
      console.error('Eroare la obținerea datelor companiei HR:', error.response ? error.response.data : error);
      return null;
    }
  };

  // Funcția pentru crearea unui program de lucru
  const handleCreateWorkSchedule = async (e) => {
    e.preventDefault();
    console.log("Trimiterea formularului a fost declanșată");
    if (selectedEmployeeIds.length === 0) {
      console.error("Nu a fost selectat niciun angajat.");
      return;
    }
    console.log('ID-ul Angajatului selectat:', selectedEmployeeIds[0]);

    console.log('Angajați filtrați', filteredEmployees);
    const employeeId = parseInt(selectedEmployeeIds[0], 10);

    if (isNaN(employeeId)) {
      console.error("ID-ul Angajatului selectat este nevalid sau nu este un număr.");
      return;
    }

    const employee = filteredEmployees.find(employee => employee.user === employeeId);
    if (!employee) {
      console.error('Angajatul nu a fost găsit pentru ID-ul:', employeeId);
      return;
    }

    const scheduleData = {
      employee_user_id: employeeId,
      employee_department: employee.department,
      employee_name: employee.name,
      start_time: workHours.start,
      end_time: workHours.end,
      date: moment(selectedDateRange[0]).format('YYYY-MM-DD'),
      overtime_hours: workHours.overtime_hours,
    };

    try {
      const accessToken = getAccessToken();
      console.log("Token de acces:", accessToken);
      const response = await axios.post('http://localhost:8000/workschedule-create/', scheduleData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });

      console.log('Programul de lucru a fost creat cu succes:', response.data);
      setWorkSchedules([...workSchedules, response.data]);
      fetchWorkSchedules();
      handleCloseAddModal();
      showModal('Programul de lucru a fost creat cu succes.');
    } catch (error) {
      console.error('Eroare la crearea programului de lucru:', error.response ? error.response.data : error);
      alert('Eroare: ' + (error.response ? error.response.data : error.message));
    }
  };

  // Funcția pentru obținerea datelor dintr-un interval de date
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

  // Folosește efectul pentru a filtra angajații în funcție de compania HR
  useEffect(() => {
    const filtered = allEmployees.filter(employee =>
      employee.company_id === hrCompanyId
    );
    setFilteredEmployees(filtered);
  }, [allEmployees, hrCompanyId]);

  // Funcția pentru gestionarea schimbării selecției angajaților
  const handleEmployeeSelectionChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
    setSelectedEmployeeIds(selectedOptions);
    if (selectedOptions.length > 0) {
      setEmployeeId(selectedOptions[0]);
    }
  };

  // Funcția pentru gestionarea schimbării intervalului de date
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setSelectedDateRange([start, end]);
  };

  // Funcția pentru ștergerea unui program de lucru
  const handleDeleteWorkSchedule = async (id) => {
    const accessToken = getAccessToken();
    try {
      await instance.delete(`/workschedules/${id}/delete/`, {
        headers: {
          'Authorization': `Bearer ${accessToken
            }`
        },
      });
      setWorkSchedules(workSchedules.filter(schedule => schedule.id !== id));
      alert('Programul de lucru a fost șters cu succes!');
    } catch (error) {
      console.error('Eroare la ștergerea programului de lucru:', error);
    }
  };

  // Funcția pentru actualizarea unui program de lucru
  const handleEditWorkSchedule = async (event) => {
    event.preventDefault();

    if (!selectedSchedule) {
      console.error('Nu a fost selectat niciun program pentru editare.');
      return;
    }

    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      console.error("Nu a fost găsit niciun token de acces. Utilizatorul nu este autentificat.");
      return;
    }

    const updatedScheduleData = {
      user: selectedSchedule.user,
      start_time: workHours.start,
      end_time: workHours.end,
      date: moment(selectedDateRange[0]).format('YYYY-MM-DD'),
      overtime_hours: workHours.overtime_hours,
      shift_type: 'day',
      id: selectedSchedule.id,
    };

    try {
      const response = await axios.put(`http://localhost:8000/workschedule_update/${selectedSchedule.id}/`, updatedScheduleData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });

      if (response.status === 200) {
        console.log('Actualizarea a fost realizată cu succes', response.data);
        setWorkSchedules(previousSchedules =>
          previousSchedules.map(schedule =>
            schedule.id === selectedSchedule.id ? response.data : schedule
          )
        );

        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Eroare la actualizarea programului de lucru:', error.response ? error.response.data : error);
    }
  };

  // Funcția pentru deschiderea modalului de adăugare
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Funcția pentru închiderea modalului de adăugare
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedSchedule(null);
  };

  // Funcția pentru deschiderea modalului de editare
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

  // Funcția pentru închiderea modalului de editare
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSchedule(null);
  };


  return (
    <div className="container-dashboard">
      <h1>Gestionare program lucru</h1>
      <div className='card-curs'>
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
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
                  <td>
                    <Link
                      to={`/angajat-profil/${schedule.user}`}
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
        </div>


        <ReactPaginate
          previousLabel={'Anterior'}
          nextLabel={'Următorul'}
          breakLabel={'...'}
          pageCount={totalPages}
          onPageChange={handlePageChange}
          containerClassName={'pagination'}
          activeClassName={'active'}
          forcePage={currentPage}
        />
        <div className="button-container">
          <button className="buton" onClick={handleOpenAddModal}>Adaugă program de lucru</button>
        </div>
      </div>


      <div className='card-curs'>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />
      </div>
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="modal-content"
        contentLabel="Notificare"
      >
        <h2>Notificare</h2>
        <p>{modalMessage}</p>
        <button onClick={() => setModalOpen(false)}>Închide</button>
      </Modal>

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
            <label htmlFor="department">Departament:</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
              <option value="">Selectează un departament</option>
              {departments.map((department, index) => (
                <option key={index} value={department}>{department}</option>
              ))}
            </select>

          </div>
          <div className="form-group">
            <label htmlFor="employee">Angajat:</label>
            <select
              multiple
              value={selectedEmployeeIds}
              onChange={handleEmployeeSelectionChange}
              disabled={!selectedDepartment}
            >
              {filteredEmployees.filter(emp => emp.department === selectedDepartment).map((employee) => (
                <option key={employee.user} value={employee.user}>
                  {employee.name} - {employee.department} ({employee.user})
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
            <button type="submit" className="buton">Adaugă</button>
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