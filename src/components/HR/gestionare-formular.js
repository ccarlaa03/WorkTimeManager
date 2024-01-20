import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // At the root of your application

const GestionareÎntrebăriFeedback = () => {
  const [intrebari, setIntrebari] = useState([
    { id: 1, text: 'Cum evaluezi comunicarea în echipă?', punctaj: 10 },
    { id: 2, text: 'Ești mulțumit de beneficiile oferite de companie?', punctaj: 8 },
    // ...alte întrebări
  ]);

  const [intrebareCurenta, setIntrebareCurenta] = useState('');
  const [punctajCurent, setPunctajCurent] = useState(0);
  const [modalAdaugaDeschis, setModalAdaugaDeschis] = useState(false);
  const [modalEditareDeschis, setModalEditareDeschis] = useState(false);
  const [intrebareEditata, setIntrebareEditata] = useState(null);

  const handleAdaugaIntrebare = () => {
    if (!intrebareCurenta) return;
    setIntrebari([...intrebari, { id: Date.now(), text: intrebareCurenta, punctaj: punctajCurent }]);
    setIntrebareCurenta('');
    setPunctajCurent(0);
    setModalAdaugaDeschis(false);
  };

  const handleStergeIntrebare = (id) => {
    setIntrebari(intrebari.filter((intrebare) => intrebare.id !== id));
  };

  const handleEditareIntrebare = (id) => {
    const intrebare = intrebari.find((intrebare) => intrebare.id === id);
    setIntrebareEditata(intrebare);
    setIntrebareCurenta(intrebare.text);
    setPunctajCurent(intrebare.punctaj);
    setModalEditareDeschis(true);
  };

  const handleActualizeazaIntrebare = () => {
    const updatedIntrebari = intrebari.map((intrebare) =>
      intrebare.id === intrebareEditata.id
        ? { ...intrebare, text: intrebareCurenta, punctaj: punctajCurent }
        : intrebare
    );
    setIntrebari(updatedIntrebari);
    setModalEditareDeschis(false);
    setIntrebareEditata(null);
    setIntrebareCurenta('');
    setPunctajCurent(0);
  };

  const handleInchideModal = () => {
    setModalAdaugaDeschis(false);
    setModalEditareDeschis(false);
    setIntrebareEditata(null);
    setIntrebareCurenta('');
    setPunctajCurent(0);
  };

  return (
    <div>
      <div className="container-dashboard">
        <h1>Întrebări Feedback</h1>
        <table className="tabel column">
          <thead>
            <tr>
              <th>ID</th>
              <th>Întrebare</th>
              <th>Punctaj</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {intrebari.map((intrebare) => (
              <tr key={intrebare.id}>
                <td>{intrebare.id}</td>
                <td>{intrebare.text}</td>
                <td>{intrebare.punctaj}</td>
                <td>
                  <button onClick={() => handleEditareIntrebare(intrebare.id)}>Editează</button>
                  <button onClick={() => handleStergeIntrebare(intrebare.id)}>Șterge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="form-group" style={{ textAlign: "center" }}>
          <button className="buton" onClick={() => setModalAdaugaDeschis(true)}>Adaugă Întrebare</button>
        </div>
        <Modal
          isOpen={modalAdaugaDeschis || modalEditareDeschis}
          onRequestClose={handleInchideModal}
          className="modal-content"
        >
          <h2>{intrebareEditata ? 'Editează Întrebare' : 'Adaugă Întrebare'}</h2>
          <div className="form-group">
            <label htmlFor="intrebare">Întrebare:</label>
            <input
              id="intrebare"
              type="text"
              value={intrebareCurenta}
              onChange={(e) => setIntrebareCurenta(e.target.value)}
            />
            <label htmlFor="punctaj">Punctaj:</label>
            <input
              id="punctaj"
              type="number"
              value={punctajCurent}
              onChange={(e) => setPunctajCurent(Number(e.target.value))}
            />
          </div>
          <button onClick={intrebareEditata ? handleActualizeazaIntrebare : handleAdaugaIntrebare}>
            {intrebareEditata ? 'Actualizează' : 'Adaugă'}
          </button>
          <button onClick={handleInchideModal}>Închide</button>
        </Modal>
      </div>
    </div>
  );
};

export default GestionareÎntrebăriFeedback;
