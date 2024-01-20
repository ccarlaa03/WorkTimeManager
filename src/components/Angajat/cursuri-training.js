import React from 'react';

const DetaliiCurs = () => {

const [cursuri, setCursuri] = useState([
  { id: 1, titlu: 'Leadership Strategic', descriere: 'Curs avansat pentru dezvoltarea abilităților de leadership.', durata: '3 luni', nivel: 'Avansat', inscrisi: 12 },
  { id: 2, titlu: 'Management de Proiect', descriere: 'Tehnici moderne de management aplicabile în proiectele agile.', durata: '2 luni', nivel: 'Intermediar', inscrisi: 35 },
  // ...more courses
]);

const [detaliiCurs, setDetaliiCurs] = useState(null);
const [modalVisible, setModalVisible] = useState(false);

// Assume this function fetches course details based on ID
const fetchDetaliiCurs = (id) => {
  // This would be replaced with an actual API call
  const cursDetalii = cursuri.find(curs => curs.id === id);
  setDetaliiCurs(cursDetalii);
  setModalVisible(true);
};

// Modal for course details
const CourseDetailsModal = ({ curs, onClose }) => (
  <div className="modal-overlay">
      <div className="modal-content">
          <h2>Detalii Curs: {curs.titlu}</h2>
          <p>Descriere: {curs.descriere}</p>
          <p>Durata: {curs.durata}</p>
          <p>Nivel: {curs.nivel}</p>
          <p>Inscrisi: {curs.inscrisi}</p>
          <button onClick={onClose}>Închide</button>
      </div>
  </div>
);

return (
  <div className="container-dashboard">
      <h1>Gestionare Cursuri Training</h1>
      <div className="gestionare-cursuri">
          {cursuri.map(curs => (
              <div key={curs.id} className="card-curs">
                  <h3>{curs.titlu}</h3>
                  <p>{curs.descriere}</p>
                  <button onClick={() => fetchDetaliiCurs(curs.id)}>Vezi Detalii</button>
              </div>
          ))}
      </div>
      {modalVisible && detaliiCurs && (
          <CourseDetailsModal curs={detaliiCurs} onClose={() => setModalVisible(false)} />
      )}
  </div>
);
      };

export default DetaliiCurs;
