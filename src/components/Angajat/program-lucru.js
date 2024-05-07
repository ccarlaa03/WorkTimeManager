import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Modal from 'react-modal';
import axios from 'axios';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';


Modal.setAppElement('#root');

const ProgramLucru = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lunaCurenta, setLunaCurenta] = useState(new Date());
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [workHistoryDetails, setWorkHistoryDetails] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState({
    name: '',
    user: '',
  });
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date('1970-01-01T' + timeString + 'Z');
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
            <h2>Istoric program de lucru</h2>
            {workHistoryDetails.length > 0 ? (
              workHistoryDetails.map((schedule, index) => (
                <div key={index}>
                  <p>{schedule.date}: {schedule.startTime} - {schedule.endTime}</p>
                </div>
              ))
            ) : (
              <p>Nu există un istoric disponibil pentru această lună.</p>
            )}
          </div>
        </div>
      </div>


      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => isModalOpen(false)}
        contentLabel="Modificare Program de Lucru"
        className="modal-content"
      >
        <h2>Modificare program de lucru</h2>
        <form onSubmit={handleSubmitModificare}>
          <div>
            <label>Ziua:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label>Ora de început:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label>Ora de sfârșit:</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="button-container">
            <button className='buton' type="submit">Trimite cererea</button>
            <button className='buton' type="button" onClick={() => setIsModalOpen(false)}>Închide</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


export default ProgramLucru;
