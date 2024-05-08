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
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date('1970-01-01T' + timeString + 'Z');
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const accessToken = localStorage.getItem('access_token');

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("Access denied. No token available. User must be logged in to access this.");
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/employee-dashboard/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log(response.data);
        setEmployeeInfo(response.data.employee_info);
      } catch (error) {
        console.error("Error retrieving profile data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!employeeInfo.user) {
        console.error("User ID is undefined or not provided.");
        return;
      }
      setLoading(true);
      setError('');

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError("Access denied. No token available.");
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
          setError('Failed to fetch schedules');
        }
      } catch (error) {
        setError(`Error fetching schedules: ${error.response?.data?.error || error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchWorkHistory = async () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      if (!accessToken || !employeeInfo.user) {
        console.error("Access denied or missing user ID.");
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
          console.error('Failed to fetch work history');
        }
      } catch (error) {
        console.error('Error fetching work history:', error);
      }
    };


    fetchWorkHistory();
    fetchSchedules();
  }, [employeeInfo.user, currentDate, viewMode]);


  // Simularea unei cereri asincrone către un server pentru a obține zilele libere
  const fetchZileLibere = async (lunaCurenta) => {
    // Aici ar fi codul pentru a face un apel HTTP către server
    // În loc, vom returna un răspuns mock (simulat)
    return Promise.resolve([
      { data: '06/01/2024', motiv: 'Sărbătoare legală' },
      // ... alte zile libere
    ]);
  };



  const handleSubmitModificare = (e) => {
    e.preventDefault();
    console.log('Cerere de modificare trimisă:', { date, startTime, endTime });
    setIsModalOpen(false);
    setShowSuccessMessage(true); // Setează showSuccessMessage pe true
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
                <button className="filter-button" onClick={() => setViewMode('month')}>Lunar</button>
              </div>
            )}
            {viewMode === 'month' && (
              <div className="button-container">
                <button className="filter-button" onClick={() => setViewMode('week')}>Săptămânal</button>
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
