import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/App.css';
import instance from '../../axiosConfig';
import Modal from 'react-modal';

const localizer = momentLocalizer(moment);


const OwnerDashboard = () => {
  const [company, setCompany] = useState({
    id: '',
    name: '',
    address: '',
    phone_number: '',
    email: '',
    industry: '',
    number_of_employees: 0,
    founded_date: ''
  });
  
  
  const [events, setEvents] = useState([]);
  const [owner, setOwner] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: moment().toDate(),
    end: moment().toDate()
  });

  const getAccessToken = () => localStorage.getItem('access_token');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [profileEdit, setEditProfile] = useState(false);
  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] = useState(false);
  const closeEditModal = () => setEditProfile(false);
  const openEditModal = () => setEditProfile(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const closeAddEventModal = () => setIsAddEventModalOpen(false);
  const openEditCompanyModal = () => {
    if (company) {
      setEditedCompany({
        id: company.id || '',
        name: company.name || '',
        address: company.address || '',
        phone_number: company.phone_number || '',
        email: company.email || '',
        industry: company.industry || '',
        number_of_employees: company.number_of_employees || 0,
        founded_date: company.founded_date ? moment(company.founded_date).format('YYYY-MM-DD') : ''
      });
    }
    setIsEditCompanyModalOpen(true);
  };
  


  const closeEditCompanyModal = () => {
    setIsEditCompanyModalOpen(false);
  };
  const [editedCompany, setEditedCompany] = useState({
    name: '',
    address: '',
    phone_number: '',
    email: '',
    industry: '',
    number_of_employees: '',
    founded_date: ''

  });

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = (name === 'start' || name === 'end') ? new Date(value) : value;
    setNewEvent({ ...newEvent, [name]: newValue });
  };

  const openAddEventModal = () => {
    setNewEvent({
      ...newEvent,
      start: new Date(),
      end: new Date(),
    });
    setIsAddEventModalOpen(true);
  };


  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("No access token found. User must be logged in to access this page.");
        return;
      }
  
      const config = {
        headers: { Authorization: `Bearer ${accessToken}` }
      };
  
      try {
        const response = await axios.get('http://localhost:8000/owner-dashboard/', config);
        if (response.data.owner) {
          setOwner(response.data.owner);
          console.log('Owner data:', response.data.owner); 
          if (response.data.company) {
            setCompany(response.data.company);
            console.log('Company data:', response.data.company); 
          }
        } else {
          console.error("Owner data is not available or company ID is undefined.");
        }
      } catch (error) {
        console.error("Error fetching data:", error.response || error);
      }
  
      try {
        const eventsResponse = await instance.get('/events/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setEvents(eventsResponse.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        })));
      } catch (error) {
        console.error("Error fetching events:", error.response ? error.response.data : error.message);
      }
    };
    fetchData();
  }, []);
  
  
  

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("No access token provided.");
      return;
    }

    if (!company) {
      console.error("No company ID associated with this user.");
      return;
    }
    const eventData = {
      title: newEvent.title,
      description: newEvent.description,
      start: newEvent.start instanceof Date ? newEvent.start.toISOString() : newEvent.start,
      end: newEvent.end instanceof Date ? newEvent.end.toISOString() : newEvent.end,
      company: company
    };

    try {
      const response = await axios.post(`http://localhost:8000/add-event-owner/`, eventData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Event added successfully', response.data);
      setIsAddEventModalOpen(false);
      setEvents([...events, { ...response.data, start: new Date(response.data.start), end: new Date(response.data.end) }]);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error during event addition:', error.response ? error.response.data : error.message);
      if (error.response) {
        console.error('Full error response:', error.response);
      }
    }
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setEditedCompany((prevCompany) => ({ ...prevCompany, [name]: value }));
  };

  const handleCompanyUpdate = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error("No access token provided.");
      return;
    }
  
    if (!owner || !owner.company_id) {
      console.error("Company ID is undefined.");
      return;
    }
  
    const companyId = owner.company_id;
    const companyData = { ...editedCompany };
  
    console.log('Submitting company update with companyId:', companyId);
    console.log('Company data:', companyData);
  
    try {
      const response = await axios.put(`http://localhost:8000/update-company/${companyId}/`, companyData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Company updated successfully', response.data);
      setCompany(response.data);
      setUpdateSuccess(true);
      closeEditCompanyModal();
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error during company update:', error);
      if (error.response) {
        console.error('Error data:', error.response.data);
      }
    }
  };
  
  

  return (
    <div className="container-dashboard">
      <h1>Bine ai venit, {owner ? owner.name : "Loading..."}</h1>
      {company ? (
        <div className="container-profil">
          <p><b>Adresa:</b> {company.address}</p>
          <p><b>Număr de telefon:</b> {company.phone_number}</p>
          <p><b>Email: </b>{company.email}</p>
          <p><b>Industrie: </b>{company.industry}</p>
          <p><b>Număr de angajați:</b> {company.number_of_employees}</p>
          <p><b>Data înființării: </b>{new Date(company.founded_date).toLocaleDateString()}</p>
          <div className="button-container">
            <button onClick={openEditCompanyModal} className="buton">Editează detaliile companiei</button>
          </div>
        </div>
      ) : (
        <p>Încărcare detalii companie...</p>
      )}
      {updateSuccess && <div className="update-success-message">Detaliile companiei au fost actualizate cu succes!</div>}
      <div className="card-curs">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />
       
        <button onClick={openAddEventModal} className="buton">
          Adaugă eveniment nou
        </button>
    
      </div>
      <Modal isOpen={isAddEventModalOpen} onRequestClose={closeAddEventModal} contentLabel="Adaugă Eveniment" className="modal-content">
        <form onSubmit={handleAddEvent}>
          <label>Eveniment:</label>
          <input
            type="text"
            name="title"
            placeholder="Titlu Eveniment"
            value={newEvent.title}
            onChange={handleEventInputChange}
            required
          />
          <label>Descrie:</label>
          <input
            type="text"
            name="description"
            placeholder="Descrie"
            value={newEvent.description}
            onChange={handleEventInputChange}
            required
          />
          <label>Data de început:</label>
          <input
            type="datetime-local"
            name="start"
            value={moment(newEvent.start).format("YYYY-MM-DDTHH:mm")}
            onChange={handleEventInputChange}
            required
          />
          <label>Data de sfârșit:</label>
          <input
            type="datetime-local"
            name="end"
            value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")}
            onChange={handleEventInputChange}
            required
          />
          <button className="button" type="submit">Adaugă eveniment</button>
        </form>
      </Modal>
    
      <Modal
        isOpen={isEditCompanyModalOpen}
        onRequestClose={closeEditCompanyModal}
        contentLabel="Editează detaliile companiei"
        className="modal-content"
      >
        <h2>Editează detaliile companiei</h2>
        <form onSubmit={handleCompanyUpdate}>
          <label>Nume companie:</label>
          <input
            type="text"
            name="name"
            value={editedCompany.name}
            onChange={handleCompanyChange}
            required
          />
          <label>Adresa:</label>
          <input
            type="text"
            name="address"
            value={editedCompany.address}
            onChange={handleCompanyChange}
            required
          />
          <label>Număr de telefon:</label>
          <input
            type="text"
            name="phone_number"
            value={editedCompany.phone_number}
            onChange={handleCompanyChange}
            required
          />
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={editedCompany.email}
            onChange={handleCompanyChange}
            required
          />
          <label>Industrie:</label>
          <input
            type="text"
            name="industry"
            value={editedCompany.industry}
            onChange={handleCompanyChange}
            required
          />
          <label>Număr de angajați:</label>
          <input
            type="number"
            name="number_of_employees"
            value={editedCompany.number_of_employees}
            onChange={handleCompanyChange}
            required
          />
          <label>Data înființării:</label>
          <input
            type="date"
            name="founded_date"
            value={editedCompany.founded_date}
            onChange={handleCompanyChange}
            required
          />
          <button type="submit">Salvează modificările</button>
        </form>
      </Modal>



    </div>
  );
};

export default OwnerDashboard;
