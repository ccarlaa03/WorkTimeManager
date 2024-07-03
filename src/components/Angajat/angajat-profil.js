import React, { useState, useEffect } from 'react';
import instance from '../../axiosConfig';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';

const ProfilAngajat = () => {
  const { user_id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [filter, setFilter] = useState('month');
  const [leaves, setLeaves] = useState({ data: [], pageCount: 0 });
  const [workschedule, setWorkSchedule] = useState({ data: [], pageCount: 0 });
  const [feedbackForms, setFeedbackForms] = useState({ data: [], pageCount: 0 });
  const [trainingSessions, setTrainingSessions] = useState({ data: [], pageCount: 0 });
  const itemsPerPage = 5;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(1);
  const initialEmployeeState = {
    user_id: '',
    name: '',
    position: '',
    department: '',
    hire_date: '',
    email: '',
    address: '',
    telephone_number: '',
  };

  const [employee, setEmployee] = useState(initialEmployeeState);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const LEAVE_TYPES = [
    { value: 'AN', label: 'Concediu Anual' },
    { value: 'SI', label: 'Concediu Medical' },
    { value: 'UP', label: 'Concediu Fără Plată' },
    { value: 'MA', label: 'Concediu de Maternitate' },
    { value: 'PA', label: 'Concediu de Paternitate' },
    { value: 'ST', label: 'Concediu de Studii' },
  ];

  const statusMap = {
    'AC': 'Acceptat',
    'RE': 'Refuzat',
    'PE': 'În așteptare'
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleWeekChange = (e) => {
    setSelectedWeek(e.target.value);
  };

// Componenta pentru selectarea opțiunilor de filtrare
const FilterOptions = ({ onFilterChange }) => (
  <select onChange={onFilterChange} value={filter}>
    <option value="week">Săptămână</option>
    <option value="month">Lună</option>
    <option value="year">An</option>
  </select>
);

// Functia pentru a gestiona schimbarea filtrului
const handleFilterChange = (e) => {
  console.log("Valoarea selectată înainte de setare:", e.target.value);
  setFilter(e.target.value);
  console.log("Valoarea selectată după setare:", filter);
};

// Functia pentru a deschide modalul de editare
const handleEdit = () => {
  setIsModalOpen(true);
};

// Functia pentru a închide modalul
const handleCloseModal = () => {
  setIsModalOpen(false);
  setConfirmationMessage("");
};

useEffect(() => {
  const getAccessToken = () => localStorage.getItem('access_token');
  console.log("Filtrul sau user_id s-au schimbat:", filter, user_id);

  // Functia pentru a prelua datele companiei HR
  const fetchHrCompany = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
      return null;
    }
    try {
      const hrResponse = await axios.get('/hr-dashboard/', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (hrResponse.data && hrResponse.data.company_id) {
        console.log('ID Companie HR:', hrResponse.data.company_id);
        return hrResponse.data.company_id;
      } else {
        console.log('Date Companie HR:', hrResponse.data);
        return null;
      }
    } catch (error) {
      console.error('Eroare la preluarea datelor companiei HR:', error);
      return null;
    }
  };

  // Functia pentru a prelua detaliile angajatului
  const fetchEmployeeDetails = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
      return;
    }

    const url = `/angajat-profil/${user_id}/`;
    try {
      console.log(`Se preiau detalii despre angajat de la ${url}`);
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      setEmployee(response.data);
    } catch (error) {
      console.error('Eroare la preluarea detaliilor angajatului:', error);
    }
  };

  // Functia pentru a construi URL-ul
  const buildUrl = (base, userId) => {
    let url = `${base}${userId}/`;
    console.log("URL construit:", url);
    return url;
  };

  // Functia pentru a prelua concediile angajatului
  const fetchLeaves = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
      return;
    }
    const url = buildUrl('http://localhost:8000/angajat-concedii/', user_id);

    try {
      const leaveResponse = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      setLeaves({ data: leaveResponse.data || [], pageCount: Math.ceil(leaveResponse.data.length / itemsPerPage) });
    } catch (error) {
      console.error('Eroare la preluarea concediilor:', error);
    }
  };

  // Functia pentru a prelua programul de lucru al angajatului
  const fetchWorkSchedule = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
      return;
    }
    const url = buildUrl('http://localhost:8000/angajat-prog/', user_id);

    try {
      const scheduleResponse = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      setWorkSchedule({ data: scheduleResponse.data || [], pageCount: Math.ceil(scheduleResponse.data.length / itemsPerPage) });
    } catch (error) {
      console.error('Eroare la preluarea programului de lucru:', error);
    }
  };

  // Functia pentru a prelua datele de feedback
  const fetchFeedbackData = async () => {
    setIsLoading(true);
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
      setIsLoading(false);
      return;
    }
    const url = buildUrl('http://localhost:8000/employee/', `${user_id}/feedback`);

    try {
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      setFeedbackForms({ data: response.data || [], pageCount: Math.ceil(response.data.length / itemsPerPage) });
    } catch (error) {
      console.error('Eroare la preluarea datelor de feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Functia pentru a prelua datele despre training
  const fetchTrainingData = async () => {
    setIsLoading(true);
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
      setIsLoading(false);
      return;
    }
    const url = buildUrl('http://localhost:8000/employee/', `${user_id}/trainings`);

    try {
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      setTrainingSessions({ data: response.data || [], pageCount: Math.ceil(response.data.length / itemsPerPage) });
    } catch (error) {
      console.error('Eroare la preluarea datelor despre training:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Inițializarea tuturor operațiunilor de preluare a datelor
  const initializeData = async () => {
    await fetchEmployeeDetails();
    await fetchLeaves();
    await fetchWorkSchedule();
    await fetchFeedbackData();
    await fetchTrainingData();
  };
  initializeData();
}, [user_id, filter]);

// Functia pentru a salva detaliile angajatului
const saveEmployeeDetails = async () => {
  const getAccessToken = () => localStorage.getItem('access_token');
  const accessToken = getAccessToken();
  if (!accessToken) {
    console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
    return;
  }

  const url = `/employee-edit/${user_id}/`;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.put(url, employee, { headers });
    setEmployeeDetails(response.data);
    setConfirmationMessage('Modificările au fost salvate cu succes!');
    setTimeout(() => {
      setConfirmationMessage('');
      setIsModalOpen(false);
    }, 3000);
  } catch (error) {
    console.error('Eroare la actualizarea detaliilor angajatului:', error);
  }
};

// Functia pentru a gestiona schimbarea valorilor din input
const handleChange = (e) => {
  const { name, value } = e.target;
  setEmployee((prevState) => ({
    ...prevState,
    [name]: value,
  }));
};

  if (!user_id) {
    return <div>Încărcarea detaliilor angajatului...</div>;
  }

  const EmployeeDetailsEdit = ({ employee, onSave, onChange, confirmationMessage }) => {
    return (
      <div className="personal-info">
        <div className="detail">
          <label>Nume:</label>
          <input
            type="text"
            name="name"
            value={employee.name}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={employee.email}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Departament:</label>
          <input
            type="text"
            name="department"
            value={employee.department}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Post:</label>
          <input
            type="text"
            name="position"
            value={employee.position}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Data angajării:</label>
          <input
            type="text"
            name="hire_date"
            value={employee.hire_date}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Ore lucrate:</label>
          <input
            type="text"
            name="working_hours"
            value={employee.working_hours}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Zile libere:</label>
          <input
            type="text"
            name="free_days"
            value={employee.free_days}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Adresa:</label>
          <input
            type="text"
            name="address"
            value={employee.address}
            onChange={onChange}
            className="input-field"
          />
        </div>

        <div className="detail">
          <label>Număr de telefon:</label>
          <input
            type="text"
            name="telephone"
            value={employee.telephone_number}
            onChange={onChange}
            className="input-field"
          />
        </div>
        {confirmationMessage && <div className="save-confirmation">{confirmationMessage}</div>}
        <button className='buton' onClick={onSave}>Salvează modificările</button>
      </div>
    );
  };

  const EmployeeDetailsView = ({ employee, onEditClick }) => {
    return (
      <div className="personal-info">
        <table className="info-table">
          <tbody>
            <tr>
              <th>Nume:</th>
              <td><b>{employee.name}</b></td>
            </tr>
            <tr>
              <th>Email:</th>
              <td>{employee.email}</td>
            </tr>
            <tr>
              <th>Departament:</th>
              <td>{employee.department}</td>
            </tr>
            <tr>
              <th>Post:</th>
              <td><b>{employee.position}</b></td>
            </tr>
            <tr>
              <th>Adresă:</th>
              <td>{employee.address}</td>
            </tr>
            <tr>
              <th>Număr de telefon:</th>
              <td>{employee.telephone_number}</td>
            </tr>
            <tr>
              <th>Data angajării:</th>
              <td><b>{employee.hire_date}</b></td>
            </tr>
            <tr>
              <th>Ore lucrate:</th>
              <td>{employee.working_hours}</td>
            </tr>
            <tr>
              <th>Zile libere:</th>
              <td>{employee.free_days}</td>
            </tr>
          </tbody>
        </table>
        <button className='buton' onClick={onEditClick}>Editează profilul</button>
      </div>
    );
  };

  return (
    <div className="container-dashboard">
      <div className="profile-content">
        <Modal className="modal-content" isOpen={isModalOpen} onRequestClose={handleCloseModal}>
          <EmployeeDetailsEdit employee={employee} onSave={saveEmployeeDetails} onChange={handleChange} confirmationMessage={confirmationMessage} />
          <button className='buton' onClick={handleCloseModal}>Închide</button>
        </Modal>

        <div className="card-curs">
          <EmployeeDetailsView employee={employee} onEditClick={handleEdit} />
        </div>

        <div className="lista-cursuri">
          <div className="card-curs">
            <h2>Concedii</h2>
            <FilterOptions onFilterChange={handleFilterChange} />

            {leaves.data.length > 0 ? (
              <table className="tabel column">
                <tbody>
                  {leaves.data.map((leave) => (
                    <tr key={leave.id} className="leave-item">
                      <th>Id:</th>
                      <td>{leave.id}</td>
                      <th>Status:</th>
                      <td>{statusMap[leave.status]}</td>
                      <th>Tipul de concediu:</th>
                      <td>{LEAVE_TYPES.find(type => type.value === leave.leave_type)?.label}</td>
                      <th>Perioada:</th>
                      <td>{`${leave.start_date} - ${leave.end_date}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Încărcarea datelor despre concedii...</p>
            )}
          </div>

          <div className="card-curs">
            <h2>Program de lucru</h2>
            <FilterOptions onFilterChange={handleFilterChange} />

            {workschedule.data.length > 0 ? (
              <table className="tabel column">
                <tbody>
                  {workschedule.data.map((schedule) => (
                    <tr key={schedule.id} className="schedule-item">
                      <th>Id:</th>
                      <td>{schedule.id}</td>
                      <th>Data:</th>
                      <td>{schedule.date}</td>
                      <th>Program:</th>
                      <td>{`${schedule.start_time} - ${schedule.end_time}`}</td>
                      <th>Ore suplimentare:</th>
                      <td>{schedule.overtime_hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Încărcarea programului de lucru...</p>
            )}
          </div>

          <div className="card-curs">
            <h2>Feedback</h2>
            <FilterOptions onFilterChange={handleFilterChange} />

            {isLoading ? (
              <p>Încărcarea feedback-ului...</p>
            ) : feedbackForms.data.length > 0 ? (
              <table className="tabel column">
                <thead>
                  <tr>
                    <th>Titlu</th>
                    <th>Creat de</th>
                    <th>Creat la ora</th>
                    <th>Angajat</th>
                    <th>Data completată</th>
                    <th>Scorul</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackForms.data.map((feedback) => (
                    <tr key={feedback.id}>
                      <td>{feedback.form.title}</td>
                      <td>{feedback.form.created_by}</td>
                      <td>{new Date(feedback.form.created_at).toLocaleDateString()}</td>
                      <td>{feedback.employee_name}</td>
                      <td>{new Date(feedback.date_completed).toLocaleDateString()}</td>
                      <td>{feedback.total_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nu există feedback-uri disponibile.</p>
            )}
          </div>

          <div className="card-curs">
            <h2>Particicpări la cursuri</h2>
            <FilterOptions onFilterChange={handleFilterChange} />

            {isLoading ? (
              <p>Încărcarea sesiunilor de training...</p>
            ) : trainingSessions.data.length > 0 ? (
              <table className="tabel column">
                <thead>
                  <tr>
                    <th>Titlu</th>
                    <th>Data începerii</th>
                    <th>Data terminării</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingSessions.data.map((session) => (
                    <tr key={session.id}>
                      <td>{session.title}</td>
                      <td>{new Date(session.start_date).toLocaleDateString()}</td>
                      <td>{new Date(session.end_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nu există sesiuni de training disponibile.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilAngajat;