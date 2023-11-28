// Dashboard.js
import React from 'react';
import PersonalInfo from './PersonalInfo';
import UpdateInfoForm from './UpdateInfoForm';
import UpdateProfilePic from './UpdateProfilePic';
import ViewDocuments from './ViewDocuments';

const Dashboard = () => {
  return (
    <div style={{ backgroundColor: '#E4E9EF', padding: '20px' }}>
      <h1>Dashboard</h1>
      <div style={{ backgroundColor: '#A087BC', padding: '10px', marginBottom: '20px' }}>
        Elemente de Navigare
      </div>

      <div>
        <h2>Vizualizare date personale</h2>
        <PersonalInfo />
      </div>

      <div>
        <h2>Actualizare informații</h2>
        <UpdateInfoForm />
      </div>

      <div>
        <h2>Actualizare fotografie de profil</h2>
        <UpdateProfilePic />
      </div>

      <div>
        <h2>Vizualizare Documente</h2>
        <ViewDocuments />
      </div>
    </div>
  );
};

export default Dashboard;
