import React, { useState, useEffect, useContext } from 'react';
import instance from '../../axiosConfig';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';

const TrainingEmployee = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [trainings, setTrainings] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState({
    name: '',
    user: '',
  });
  const { user } = useContext(AuthContext);

  // Functia pentru a obține eticheta de status a cursului
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
        if (response.data.employee_info && response.data.employee_info.user) {
          console.log("Datele angajatului preluate:", response.data.employee_info);
          setEmployeeInfo(response.data.employee_info);
        } else {
          console.error("Datele utilizatorului sunt incomplete:", response.data);
        }
      } catch (error) {
        console.error("Eroare la preluarea datelor profilului:", error);
      }
    };

    fetchData();
  }, []);

  // Functia pentru a prelua cursurile disponibile
  useEffect(() => {
    const fetchTrainings = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken || !employeeInfo.user) {
        console.error("Acces refuzat sau ID-ul utilizatorului lipsește.");
        return;
      }
      try {
        const response = await instance.get(`/training/${employeeInfo.user}/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        console.log("Răspuns cursuri:", response.data);
        const today = new Date();
        const updatedTrainings = response.data.map(training => ({
          ...training,
          isRegistered: training.participants.map(p => p.employee_id).includes(user),
          registrationClosed: new Date(training.enrollment_deadline) < today,
          noSeatsLeft: training.available_seats <= 0
        }));
        if (response.data) {
          console.log("Datele cursurilor preluate:", response.data);
          setTrainings(response.data);
        }

        console.log("Cursuri actualizate:", updatedTrainings);
        setTrainings(updatedTrainings);
      } catch (error) {
        console.error('Eroare la preluarea cursurilor:', error);
      }
      setIsLoading(false);
    };
    
    fetchTrainings();
  }, [employeeInfo.user]);

  // Functia pentru a înregistra un angajat la un curs
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
  } else if (trainings.length === 0) {
    return <div>Nu există sesiuni de training disponibile.</div>;
  }

  return (
    <div className="container-dashboard">
        <h1 style={{ textAlign: 'center' }}>Cursuri disponibile</h1>
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
                    {training.isRegistered ? (
                        <div className="registration-confirmation">Te-ai înscris la acest curs. Ne vedem când începe!</div>
                    ) : (
                        <button onClick={() => registerForTraining(training.id)}>Înscrie-te</button>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};

export default TrainingEmployee;

