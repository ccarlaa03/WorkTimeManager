import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/App.css'; 

const localizer = momentLocalizer(moment);

const OwnerDashboard = () => {
  const [company, setCompany] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyRes = await axios.get('http://localhost:8000/owner-dashboard/', { withCredentials: true });
        setCompany(companyRes.data);

        const eventsRes = await axios.get('http://localhost:8000/events/', { withCredentials: true }); // Asumând că ai un endpoint pentru evenimente
        setEvents(eventsRes.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        })));
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container-dashboard">
      <h1>Owner Dashboard</h1>
      {company && (
        <div className="company-info">
          <h2>{company.name}</h2>
          <p>Adresa: {company.address}</p>
          <p>Număr de telefon: {company.phone_number}</p>
          <p>Email: {company.email}</p>
          <p>Industrie: {company.industry}</p>
          <p>Număr de angajați: {company.number_of_employees}</p>
          <p>Data înființării: {new Date(company.founded_date).toLocaleDateString()}</p>
        </div>
      )}
      <div className="calendar-section">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />
      </div>
    </div>
  );
};

export default OwnerDashboard;
