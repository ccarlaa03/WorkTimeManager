import React from 'react';

const HrDashboard = () => {

  const programLucru = [
    { zi: 'Luni', oraInceput: '09:00', oraSfarsit: '17:00' },

  ];

  const notificari = [
    { text: 'Orar actualizat pentru săptămâna viitoare.' },

  ];

  return (
    <div style={{ backgroundColor: '#E4E9EF', padding: '20px' }}>
      <h1>Dashboard</h1>


      <div style={{ backgroundColor: '#A087BC', padding: '10px', marginBottom: '20px' }}>
        <h2>Program de Lucru</h2>
        <ul>
          {programLucru.map((zi, index) => (
            <li key={index}>
              {zi.zi}: {zi.oraInceput} - {zi.oraSfarsit}
            </li>
          ))}
        </ul>
      </div>


      <div style={{ backgroundColor: '#D9CCE8', padding: '10px', marginBottom: '20px' }}>
        <h2>Notificări</h2>
        <ul>
          {notificari.map((notificare, index) => (
            <li key={index}>{notificare.text}</li>
          ))}
        </ul>
      </div>


    </div>
  );
};

export default HrDashboard;