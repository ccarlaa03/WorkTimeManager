import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Modal from 'react-modal';
import axios from 'axios';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import WorkHistory from './raport';

Modal.setAppElement('#root');

const ProgramLucru = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [workHistory, setWorkHistory] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState({
    name: '',
    user: '',
  });
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
    // Functia pentru a formata ora într-un format specific
    const formatTime = (timeString) => {
      if (!timeString) return '';
      const time = new Date('1970-01-01T' + timeString + 'Z');
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
  
    // Functia pentru a merge la luna sau săptămâna precedentă
    const handlePrev = () => {
      if (viewMode === 'month') {
        setCurrentDate(subMonths(currentDate, 1));
      } else {
        setCurrentDate(subWeeks(currentDate, 1));
      }
    };
  
    // Functia pentru a merge la luna sau săptămâna următoare
    const handleNext = () => {
      if (viewMode === 'month') {
        setCurrentDate(addMonths(currentDate, 1));
      } else {
        setCurrentDate(addWeeks(currentDate, 1));
      }
    };
  
    // Functia pentru a prelua datele profilului angajatului
    useEffect(() => {
      const fetchData = async () => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          console.error("Acces refuzat. Nu există token disponibil. Utilizatorul trebuie să fie autentificat pentru a accesa această pagină.");
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
  
    // Functia pentru a prelua programul de lucru și istoricul de lucru
    useEffect(() => {
      const fetchSchedules = async () => {
        if (!employeeInfo.user) {
          console.error("ID-ul utilizatorului este nedefinit sau neprovid.");
          return;
        }
        setLoading(true);
        setError('');
  
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          setError("Acces refuzat. Nu există token disponibil.");
          setLoading(false);
          return;
        }
  
        const dateParams = viewMode === 'month'
          ? {
            start_date: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
            end_date: format(endOfMonth(currentDate), 'yyyy-MM-dd')
          }
          : {
            start_date: format(startOfWeek(currentDate), 'yyyy-MM-dd'),
            end_date: format(endOfWeek(currentDate), 'yyyy-MM-dd')
          };
  
        try {
          const response = await axios.get(`http://localhost:8000/employee/${employeeInfo.user}/work-schedule/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: dateParams
          });
  
          if (response.status === 200) {
            setSchedules(response.data);
          } else {
            setError('Eșec la preluarea programelor');
          }
        } catch (error) {
          setError(`Eroare la preluarea programelor: ${error.response?.data?.error || error.message || 'Eroare necunoscută'}`);
        } finally {
          setLoading(false);
        }
      };
  
      const fetchWorkHistory = async () => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
  
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken || !employeeInfo.user) {
          console.error("Acces refuzat sau ID-ul utilizatorului lipsește.");
          return;
        }
  
        try {
          const url = `http://localhost:8000/employee/${employeeInfo.user}/work-history/${currentYear}/${currentMonth}/`;
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
  
          if (response.status === 200) {
            setWorkHistory(response.data);
          } else {
            console.error('Eșec la preluarea istoricului de lucru');
          }
        } catch (error) {
          console.error('Eroare la preluarea istoricului de lucru:', error);
        }
      };
  
      fetchWorkHistory();
      fetchSchedules();
    }, [employeeInfo.user, currentDate, viewMode]);
  
    // Functia pentru a trimite cererea de modificare
    const handleSubmitModificare = (e) => {
      e.preventDefault();
      console.log('Cerere de modificare trimisă:', { date, startTime, endTime });
      setIsModalOpen(false);
      setShowSuccessMessage(true); 
    };
    
  return (
    <div>
      <div className='container-dashboard'>
        <div className="content-container">
          <div className="card-curs">
            <h1>Programul de lucru pentru luna {month}</h1>
            <div className="navigation-container">
              <button className="buton" onClick={handlePrev} style={{ width: '100px' }}>Înapoi</button>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="month-selector"
              />
              <button className="buton" onClick={handleNext} style={{ width: '100px' }}>Înainte</button>
            </div>

            <div className='button-container'>
              <button className='buton' onClick={() => setViewMode('week')}>Săptămânal</button>
              <button className='buton' onClick={() => setViewMode('month')}>Lunar</button>
            </div>
            {loading ? (
              <p>Se încarcă...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Ora de început</th>
                    <th>Ora de sfârșit</th>
                    <th>Ore suplimentare</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule, index) => (
                    <tr key={index}>
                      <td>{schedule.date}</td>
                      <td>{formatTime(schedule.start_time)}</td>
                      <td>{formatTime(schedule.end_time)}</td>
                      <td>{schedule.overtime_hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>

          <div className="button-container">
            <button
              className="buton"
              onClick={() => setIsModalOpen(true)}
            >
              Cere modificare program
            </button>
          </div>
        </div>
        <div className="content-container">
          <div className="card-curs">
            <h2 style={{ textAlign: 'center' }}> Istoric program de lucru {currentDate.getFullYear()}</h2>
            {viewMode === 'week' && (
              <div className="button-container">
                <button className="buton" onClick={() => setViewMode('month')}>Lunar</button>
              </div>
            )}
            {viewMode === 'month' && (
              <div className="button-container">
                <button className="buton" onClick={() => setViewMode('week')}>Săptămânal</button>
              </div>
            )}
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Ora de început</th>
                  <th>Ora de sfârșit</th>
                  <th>Ore suplimentare</th>
                </tr>
              </thead>
              <tbody>
                {workHistory.map((schedule, index) => (
                  <tr key={index}>
                    <td>{schedule.date}</td>
                    <td>{formatTime(schedule.start_time)}</td>
                    <td>{formatTime(schedule.end_time)}</td>
                    <td>{typeof schedule.overtime_hours === 'number' ? schedule.overtime_hours.toFixed(2) : '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {employeeInfo.user && <WorkHistory user_id={employeeInfo.user} />}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Modificare Program de Lucru"
        className="modal-content"
      >
        <h2 style={{ textAlign: 'center' }}>Modificare program de lucru</h2>
        <form onSubmit={handleSubmitModificare}>
          <label>Ziua:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label>Ora de început:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <label>Ora de sfârșit:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          <button className='buton' type="submit">Trimite cererea</button>
          <button className='buton' type="button" onClick={() => setIsModalOpen(false)}>Închide</button>
        </form>
      </Modal>

      {showSuccessMessage && (
        <div className="modal">
          <div className="modal-content">
            <h2>Cererea de modificare a fost trimisă cu succes!</h2>
            <button onClick={() => setShowSuccessMessage(false)}>Închide</button>
          </div>
        </div>
      )}

    </div>
  );
};


export default ProgramLucru;
