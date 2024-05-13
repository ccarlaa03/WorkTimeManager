import React, { useState, useEffect } from 'react';
import instance from '../../axiosConfig';
import axios from 'axios';

const TrainingEmployee = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [trainings, setTrainings] = useState([]);
  const getStatusLabel = (status) => {
    switch (status) {
      case 'planned':
        return 'Planificat';
      case 'in_progress':
        return 'În progres';
      case 'completed':
        return 'Completat';
      case 'canceled':
        return 'Anulat';
      default:
        return status;
    }
  };

  useEffect(() => {
    const fetchTrainings = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("Nu s-a găsit token de acces. Utilizatorul trebuie să fie autentificat.");
        return;
      }
      try {
        const response = await instance.get(`/trainings/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        setTrainings(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Eroare la preluarea cursurilor:', error);
        setIsLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const registerForTraining = async (trainingId) => {
    try {
      const response = await instance.post(`/trainings/register/${trainingId}/`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (response.status === 200) {
        alert("Te-ai înscris cu succes la curs.");
      }
    } catch (error) {
      console.error('Eroare la înregistrarea pentru curs:', error.response ? error.response.data : error);
    }
  };

  if (isLoading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <div className="container-dashboard">
      <h1 style={{ textAlign: 'center' }} >Cursuri disponibile</h1>
      <div className="lista-cursuri">
        {trainings.map(training => (
          <div key={training.id} className="card">
            <h3>{training.title}</h3>
            <p>{training.description}</p>
            <p>Data: {new Date(training.date).toLocaleDateString('ro-RO')}</p>
            <p>Status: {getStatusLabel(training.status)}</p>
            <p>Durata: {training.duration_days} zile</p>
            <p>Capacitate: {training.capacity} persoane</p>
            <p>Locuri disponibile: {training.available_seats}</p>
            <p>Înregistrare până la: {training.enrollment_deadline && new Date(training.enrollment_deadline).toLocaleDateString()}</p>
            <button disabled={new Date() > new Date(training.enrollment_deadline) || training.available_seats <= 0}>
              Înscrie-te
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingEmployee;
