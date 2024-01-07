import React, { useState } from 'react';
import Calendar from './calendar';
import imagine from '../../photos/imagine-profil.jpg';
import EditareProfil from './editare-profil';
import FormularModificare from './Formular-mod';
import Statistici from './statistici'; 


// Componenta Dashboard
const Dashboard = () => {
  const [profil, setProfil] = useState({
    nume: "Chereji Carla",
    imagine: imagine,
    post: "Domeniu de activitate: Asigurarea calității produselor software",
    departament: "Departamentul de testare și control al calității",
  });
  const [editareProfil, setEditareProfil] = useState(false);

  const [oreLucrate, setOreLucrate] = useState(40); // Exemplu de valoare
  const [zileLibere, setZileLibere] = useState(2); // Exemplu de valoare

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

  const programLucru = [
    { zi: 'Luni', oraInceput: '09:00', oraSfarsit: '17:00' },
  ];

  const notificari = [
    { text: 'Orar actualizat pentru săptămâna viitoare.' },
  ];
  const [esteDeschisModalModificare, setEsteDeschisModalModificare] = useState(false);

  return (
    <div className="container-dashboard">
      <h1>Dashboard</h1>

      <div className="container-profil">
        <img src={profil.imagine} alt="Profil" className="imagine-profil" />
        <h3>{profil.nume}</h3>
        <p>{profil.post}</p>
        <p>{profil.departament}</p>
        <button className="buton" onClick={() => setEditareProfil(true)}>Editează Profilul</button>

        <EditareProfil
          profil={profil}
          isOpen={editareProfil}
          onClose={() => setEditareProfil(false)}
          onSave={handleSave}
        />
      </div>

      <div className="container-program-lucru">
        <h2>Program de lucru</h2>
        <ul>
          {programLucru.map((zi, index) => (
            <li key={index}>{zi.zi}: {zi.oraInceput} - {zi.oraSfarsit}</li>
          ))}
        </ul>
        <button
          className="buton"
          onClick={() => setEsteDeschisModalModificare(true)} >
          Cere modificare program
        </button>

        {esteDeschisModalModificare && (
          <FormularModificare
            onClose={() => setEsteDeschisModalModificare(false)}
          />
        )}
      </div>

      <div className="container-flex">
          <Statistici oreLucrate={oreLucrate} zileLibere={zileLibere} />

     <div className="container-item container-notificari">
        <h2>Notificări</h2>
        <ul>
          {notificari.map((notificare, index) => (
            <li key={index}>{notificare.text}</li>
          ))}
        </ul>
      </div>
      </div>

      <div className="container-calendar-extern">
        <h2>Calendar</h2>
        <Calendar />
      </div>


    </div>
  );
};

export default Dashboard;
