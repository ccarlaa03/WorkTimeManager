import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import moment from 'moment';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

Modal.setAppElement('#root');
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Concedii = () => {
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState({ name: '', user: '' });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [freeDays, setFreeDays] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [statistics, setStatistics] = useState({
    total_allowed: 0,
    taken: 0,
    remaining: 0,
    taken_by_type: {}
  });
  const options = {
    plugins: {
      legend: {
        display: true,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        }
      }
    }
  }
  const accessToken = localStorage.getItem('access_token');
  const leaveTypeMapping = {
    AN: 'Concediu anual',
    SI: 'Concediu medical',
    UP: 'Concediu fără plată',
    MA: 'Concediu maternitate',
    PA: 'Concediu paternitate',
    ST: 'Concediu de studii'
  };

  const leaveStatusMapping = {
    AC: 'Acceptat',
    RE: 'Refuzat',
    PE: 'În așteptare'
  };

  const data = {
    labels: ['Statistici Concedii'],
    datasets: [
      {
        label: 'Zile totale permise',
        data: [statistics.total_allowed],
        backgroundColor: 'rgba(161, 135, 198, 0.7)',
      },
      {
        label: 'Zile luate',
        data: [statistics.taken],
        backgroundColor: 'rgba(211, 211, 211, 1)',
      },
      {
        label: 'Zile rămase',
        data: [statistics.remaining],
        backgroundColor: 'rgba(160, 135, 188, 0.5)',
      }
    ]
  };

  useEffect(() => {
    // Functia pentru a prelua datele profilului angajatului
    const fetchData = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("Acces refuzat. Token inexistent. Utilizatorul trebuie să fie autentificat pentru a accesa această pagină.");
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/employee-dashboard/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log(response.data);
        setEmployeeInfo(response.data.employee_info);
      } catch (error) {
        console.error("Eroare la preluarea datelor profilului:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Functia pentru a prelua concediile angajatului
    const fetchLeaves = async () => {
      if (!accessToken) {
        setError("Acces refuzat. Token inexistent.");
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/employee/${employeeInfo.user}/leaves/year/${year}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Se face cerere pentru ID-ul utilizatorului:', employeeInfo.user);

        if (response.status === 200) {
          console.log('Datele despre concedii primite:', response.data);
          setLeaves(response.data);
        } else {
          setError('Eroare la încărcarea concediilor');
        }
      } catch (error) {
        console.error('Eroare la preluarea concediilor:', error);
      } finally {
        setLoading(false);
      }
    };

    // Functia pentru a prelua istoricul concediilor
    const fetchLeaveHistory = async () => {
      const currentYear = new Date().getFullYear();
      if (!accessToken || !employeeInfo.user) {
        console.error("Acces refuzat sau ID-ul utilizatorului lipsește.");
        return;
      }
      try {
        const url = `http://localhost:8000/employee/${employeeInfo.user}/leave-history/${currentYear}/`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (response.status === 200) {
          setLeaveHistory(response.data);
        } else {
          console.error('Eroare la preluarea istoricului concediilor');
        }
      } catch (error) {
        console.error('Eroare la preluarea istoricului concediilor:', error);
      }
    };

    // Functia pentru a prelua statistici despre concedii
    const fetchStatistics = async () => {
      if (!accessToken || !employeeInfo.user) {
        console.error("Acces refuzat sau ID-ul utilizatorului lipsește.");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8000/employee/${employeeInfo.user}/leave-statistics/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.status === 200) {
          setStatistics(response.data);
        } else {
          setError('Eroare la preluarea statisticilor concediilor');
        }
      } catch (error) {
        console.error('Eroare la preluarea statisticilor concediilor:', error);
        setError('Eroare la preluarea statisticilor concediilor');
      }
    };

    fetchStatistics();
    fetchLeaveHistory();
    fetchLeaves();
  }, [employeeInfo.user, year, accessToken]);

  // Functia pentru a gestiona trimiterea formularului de modificare
  const handleSubmitModificare = (e) => {
    e.preventDefault();
    console.log('Cerere de modificare trimisă:', { startDate, endDate, freeDays, reason, leaveType });
    setIsModalOpen(false);
    setShowSuccessMessage(true);
  };

  return (
    <div className='container-dashboard'>
      <div className="content-container">
        <div className="card-curs">
          <h1 style={{ textAlign: 'center' }}>Concedii luate pe anul {year}</h1>
          <div className="button-container">
            <button onClick={() => setYear(year - 1)}>Anul Precedent</button>
            <button onClick={() => setYear(year + 1)}>Anul Următor</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Data de început</th>
                <th>Data de sfârșit</th>
                <th>Tipul concediului</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave.id}>
                  <td>{moment(leave.start_date).format('DD-MM-YYYY')}</td>
                  <td>{moment(leave.end_date).format('DD-MM-YYYY')}</td>
                  <td>{leaveTypeMapping[leave.leave_type] || leave.leave_type}</td>
                  <td>{leaveStatusMapping[leave.status] || leave.status}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
        <div className="card-curs" style={{ alignItems: 'center' }}>
          <h2>Detalii zile de concediu</h2>
          {error && <p>{error}</p>}
          <div className="navigation-container">
            <p>Totalul zilelor permise: {statistics.total_allowed}</p>
            <p>Zile libere: {statistics.taken}</p>
            <p>Zile libere rămase: {statistics.remaining}</p>
          </div>

          <Bar data={data} options={options} />

          <h2>Tipurile de concediu luate:</h2>
          {Object.entries(statistics.taken_by_type).map(([type, days], index) => (
            <div key={index}><p>{leaveTypeMapping[type] || type}: {days} zile</p></div>
          ))}
        </div>

        <div className="button-container">
          <button
            className="buton"
            onClick={() => setIsModalOpen(true)}
          >
            Trimite cerere concediu
          </button>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Editare Cerere Concediu"
        className="modal-content"
      >
        <h2 style={{ textAlign: 'center' }}>Cerere de concediu</h2>
        <form onSubmit={handleSubmitModificare}>
          <label>Data început:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label>Data sfârșit:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <label>Zile libere:</label>
          <input
            type="number"
            value={freeDays}
            onChange={(e) => setFreeDays(e.target.value)}
          />
          <label>Motivul concediului:</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <label>Tipul concediului:</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <option value="">Selectează tipul</option>
            <option value="AN">Concediu Anual</option>
            <option value="SI">Concediu Medical</option>
            <option value="UP">Concediu Fără Plată</option>
            <option value="MA">Concediu Maternitate</option>
            <option value="PA">Concediu Paternitate</option>
            <option value="ST">Concediu de Studii</option>
          </select>
          <button className='buton' type="submit">Trimite cererea</button>
          <button className='buton' type="button" onClick={() => setIsModalOpen(false)}>Închide</button>
        </form>
      </Modal>

      {showSuccessMessage && (
        <div className="modal">
          <div className="modal-content">
            <h2>Cererea de concediu a fost trimisă cu succes!</h2>
            <button onClick={() => setShowSuccessMessage(false)}>Închide</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Concedii;
