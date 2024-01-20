import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';

const GestionareFeedback = () => {
  const [istoricFeedback, setIstoricFeedback] = useState(null);
  const [modalIstoricDeschis, setModalIstoricDeschis] = useState(false);

  const angajati = [
    { id: 1, nume: 'Angajat 1', departament: 'HR', data: '2024-01-01', puncte: 85 },
    { id: 2, nume: 'Angajat 2', departament: 'Marketing', data: '2024-01-02', puncte: 92 },
    // ... alte date despre angajați
  ];

  const handleDetaliiClick = (angajatId) => {
    // Aici ar trebui să obții istoricul feedback-ului angajatului bazat pe id
    const istoric = `Istoric feedback pentru angajatul cu ID-ul: ${angajatId}`;
    setIstoricFeedback(istoric);
    setModalIstoricDeschis(true);
  };
  return (
    <div>
      <div className="container-dashboard">
        <h1>Gestionare feedback angajați</h1>
        <table className="tabel column">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume angajat</th>
              <th>Departament</th>
              <th>Data</th>
              <th>Puncte</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {angajati.map(angajat => (
              <tr key={angajat.id}>
                <td>{angajat.id}</td>
                <td>{angajat.nume}</td>
                <td>{angajat.departament}</td>
                <td>{angajat.data}</td>
                <td>{angajat.puncte}</td>
                <td>
                  <button onClick={() => handleDetaliiClick(angajat.id)}>Detalii</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="form-group" style={{ textAlign: "center" }}>
          <Link to="/gestionare-formular">
            <button className="buton">Modifică formular Feedback</button>
          </Link>
        </div>

        <Modal
          isOpen={modalIstoricDeschis}
          onRequestClose={() => setModalIstoricDeschis(false)}
          className="modal-content"
        >
          <h2>Istoric Feedback</h2>
          {istoricFeedback && <p>{istoricFeedback}</p>}
          <button onClick={() => setModalIstoricDeschis(false)}>Închide</button>
        </Modal>

      </div>
    </div>
  );
};

export default GestionareFeedback;
