import React, { useState } from 'react';
import Calendar from './Calendar';
import '../../styles/App.css';
import { Bar } from 'react-chartjs-2';
import imagine from '../../photos/imagine-profil.jpg';
import EditareProfil from '../Angajat/editare-profil';
import FormularAdaugareIntalnire from './Formular-int';
import Modal from 'react-modal';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HrDashboard = () => {

  const [profil, setProfil] = useState({
    nume: 'Carla Chereji',
    titlu: 'Manager HR',
    departament: 'Resurse Umane',
    imagine: imagine,
  });
  const [editareProfil, setEditareProfil] = useState(false);

  const handleEditClick = () => {
    setEditareProfil(!editareProfil);
  };

  const handleChange = (e) => {
    setProfil({ ...profil, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Profil actualizat:", profil);
    setEditareProfil(false);
  };

  const handleSave = (dateActualizate) => {
    setProfil(dateActualizate);
    setEditareProfil(false);
    localStorage.setItem('profil', JSON.stringify(dateActualizate));
  };


  const [angajati, setAngajati] = useState([
    { nume: 'Angajat 1', departament: 'Resurse Umane' },
    { nume: 'Angajat 2', departament: 'Resurse Umane' },
    { nume: 'Angajat 3', departament: 'Finanțe' },
    { nume: 'Angajat 4', departament: 'Resurse Umane' },
    { nume: 'Angajat 5', departament: 'IT' },
  ]);

  const [dataCalendar, setDataCalendar] = useState(new Date());
  const notificari = [
    { text: 'Orar actualizat pentru săptămâna viitoare.' },
    { text: 'Întâlnire importantă cu noii angajați mâine la 10:30.' },
    { text: 'Instruire obligatorie privind politica de resurse umane pe 15 martie.' },
  ];

  // Datele pentru graficul cu numărul de angajați pe departamente
  const departamente = [...new Set(angajati.map(angajat => angajat.departament))];
  const numarAngajatiPeDepartamente = departamente.map(departament =>
    angajati.filter(angajat => angajat.departament === departament).length
  );

  const [intalniri, setIntalniri] = useState([
    { id: 1, data: '2024-01-10', ora: '10:00', titlu: 'Reuniune de echipă' },
    { id: 2, data: '2024-01-15', ora: '14:30', titlu: 'Prezentare client' },
    // ...alte întâlniri
  ]);
  

  const graficDepartamente = {
    labels: departamente,
    datasets: [
      {
        label: 'Număr de angajați',
        data: numarAngajatiPeDepartamente,
        borderWidth: 1,
      },
    ],
  };


  const adaugaIntalnire = (intalnire) => {
    const nouaIntalnire = { id: intalniri.length + 1, ...intalnire };
    setIntalniri([...intalniri, nouaIntalnire]);
  };

  const [esteDeschisModalIntalniri, setEsteDeschisModalIntalniri] = useState(false);
  const [esteDeschisModalEditareProfil, setEsteDeschisModalEditareProfil] = useState(false);
  return (
    <div className="container-dashboard">
      <h1>Dashboard HR</h1>
      <div className="container-profil">
        <img src={profil.imagine} alt="Profil" />
        <h3>{profil.nume}</h3>
        <p>{profil.titlu}</p>
        <p>{profil.departament}</p>
        <button className="buton" onClick={() => setEsteDeschisModalEditareProfil(true)}>Editează Profilul</button>

        </div>

        <Modal
        isOpen={esteDeschisModalEditareProfil}
        onRequestClose={() => setEsteDeschisModalEditareProfil(false)}
        contentLabel="Editează Profil"
        className="modal-content"
      >
        <EditareProfil
          profil={profil}
          isOpen={esteDeschisModalEditareProfil}
          onClose={() => setEsteDeschisModalEditareProfil(false)}
          onSave={handleSave}
        />
      </Modal>

      <Modal
        isOpen={esteDeschisModalIntalniri}
        onRequestClose={() => setEsteDeschisModalIntalniri(false)}
        contentLabel="Adaugă Întâlnire"
        className="modal-content" 

      >
        <h2>Adaugă întâlnire nouă</h2>
        <FormularAdaugareIntalnire
          onAdaugaIntalnire={adaugaIntalnire}
          onClose={() => setEsteDeschisModalIntalniri(false)}
        />
      </Modal>
      <div className="container-notificari">
        <h2>Notificări</h2>
        <ul>
          {notificari.map((notificare, index) => (
            <li key={index}>{notificare.text}</li>
          ))}
        </ul>
      </div>

      <div className="container-intalniri">
        <h2>Întâlniri</h2>
        <ul>
          {intalniri.map((intalnire, index) => (
            <li key={index}>
              <div>{intalnire.data} {intalnire.ora}</div>
              <div>{intalnire.titlu}</div>
            </li>
          ))}
        </ul>
        <div style={{ textAlign: 'left' }}>
        <button className="buton" onClick={() => setEsteDeschisModalIntalniri(true)} >
        Adaugă întâlnire
      </button>
      </div>
      {esteDeschisModalIntalniri && (

        <FormularAdaugareIntalnire
          onAdaugaIntalnire={adaugaIntalnire}
          onClose={() => setEsteDeschisModalIntalniri(false)}
        />
      )}
      </div>

      <div className="container-calendar-extern">
        <h2>Calendar</h2>
        <Calendar
          onChange={(data) => setDataCalendar(data)}
          value={dataCalendar}
        />
      </div>
      <div className="container-statistici">
        <h2>Statisticile departamentelor</h2>
        <Bar data={graficDepartamente} options={{ scales: { y: { beginAtZero: true } } }} />
      </div>
    </div>

  );
};
export default HrDashboard;

