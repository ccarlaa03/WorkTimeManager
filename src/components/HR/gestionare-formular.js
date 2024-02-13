import React, { useState } from 'react';
import Modal from 'react-modal';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

Modal.setAppElement('#root');

const GestionareÎntrebăriFeedback = () => {
  const templatesIntrebari = [
    { text: 'Cum evaluezi comunicarea în echipă?', categorie: 'Comunicare', punctaj: 'Scale' },
    { text: 'Ești mulțumit de beneficiile oferite de companie?', categorie: 'Beneficii', punctaj: 'Scale' },
  ];

  const scaleRaspunsuri = [
    { eticheta: 'Foarte Nesatisfăcut', valoare: 1 },
    { eticheta: 'Nesatisfăcut', valoare: 2 },
    { eticheta: 'Neutru', valoare: 3 },
    { eticheta: 'Satisfăcut', valoare: 4 },
    { eticheta: 'Foarte Satisfăcut', valoare: 5 },
  ];

  const categoriiIntrebari = ['Comunicare', 'Beneficii', 'Satisfacția muncii'];

  const [intrebari, setIntrebari] = useState([
    { id: 1, text: 'Cum evaluezi comunicarea în echipă?', punctaj: 10, categorie: 'Comunicare' },
    { id: 2, text: 'Ești mulțumit de beneficiile oferite de companie?', punctaj: 8, categorie: 'Beneficii' },
  ]);

  const [intrebareCurenta, setIntrebareCurenta] = useState('');
  const [punctajCurent, setPunctajCurent] = useState(0);
  const [categorieSelectata, setCategorieSelectata] = useState('');
  const [scaleSelectata, setScaleSelectata] = useState('');
  const [modalAdaugaDeschis, setModalAdaugaDeschis] = useState(false);
  const [intrebareEditata, setIntrebareEditata] = useState(null);

  const handleSelectTemplate = (event) => {
    const templateIndex = parseInt(event.target.value, 10);
    const template = templatesIntrebari[templateIndex];
    if (template) {
      setIntrebareCurenta(template.text);
      setCategorieSelectata(template.categorie);
      // Adaugă logica pentru setarea scalei selectate, dacă e necesar
    }
  };

  const handleSelectCategorie = (event) => {
    setCategorieSelectata(event.target.value);
  };

  const handleSelectScale = (event) => {
    setScaleSelectata(event.target.value);
  };

  const handleOpenModal = () => setModalAdaugaDeschis(true);
  const handleCloseModal = () => setModalAdaugaDeschis(false);

  const handleAdaugaSauActualizeazaIntrebare = () => {
    if (intrebareEditata) {
      const updatedIntrebari = intrebari.map((intreb) =>
        intreb.id === intrebareEditata.id ? { ...intreb, text: intrebareCurenta, punctaj: punctajCurent, categorie: categorieSelectata } : intreb
      );
      setIntrebari(updatedIntrebari);
    } else {
      const newIntrebare = { id: Date.now(), text: intrebareCurenta, punctaj: punctajCurent, categorie: categorieSelectata };
      setIntrebari([...intrebari, newIntrebare]);
    }
    handleCloseModal();
  };

  const handleEditareIntrebare = (id) => {
    const intrebare = intrebari.find((intreb) => intreb.id === id);
    setIntrebareEditata(intrebare);
    setIntrebareCurenta(intrebare.text);
    setPunctajCurent(intrebare.punctaj);
    setCategorieSelectata(intrebare.categorie);
    setModalAdaugaDeschis(true);
  };

  const handleStergeIntrebare = (id) => {
    setIntrebari(intrebari.filter((intreb) => intreb.id !== id));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(intrebari);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setIntrebari(items);
  };
  return (
    <div>
      <div className="container-dashboard">
        <h1>Întrebări Feedback</h1>

        <div className="filter-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%', }}>
          <label>Categorie:</label>
          <select value={categorieSelectata} onChange={handleSelectCategorie}>
            <option value="">Selectează o categorie</option>
            {categoriiIntrebari.map((categorie, index) => (
              <option key={index} value={categorie}>{categorie}</option>
            ))}
          </select>
        </div>
        <br></br>
        <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
          <label>Scale răspunsuri:</label>
          <select value={scaleSelectata} onChange={handleSelectScale}>
            <option value="">Selectează un tip de răspuns</option>
            {scaleRaspunsuri.map((scale, index) => (
              <option key={index} value={scale.valoare}>{scale.eticheta}</option>
            ))}
          </select>
        </div>

        <br></br>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <table className="tabel column" {...provided.droppableProps} ref={provided.innerRef}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Întrebare</th>
                    <th>Punctaj</th>
                    <th>Categorie</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {intrebari.map((intrebare, index) => (
                    <Draggable key={intrebare.id.toString()} draggableId={intrebare.id.toString()} index={index}>
                      {(provided) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <td>{intrebare.id}</td>
                          <td>{intrebare.text}</td>
                          <td>{intrebare.punctaj}</td>
                          <td>{intrebare.categorie || 'General'}</td>
                          <td>
                            <div class="button-container">
                              <button onClick={() => handleEditareIntrebare(intrebare.id)}>Editează</button>
                              <button onClick={() => handleStergeIntrebare(intrebare.id)}>Șterge</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>

        <div className="button-container">
          <button className="buton" onClick={() => setModalAdaugaDeschis(true)}>Adaugă Întrebare</button>
        </div>


        <Modal
          isOpen={modalAdaugaDeschis}
          onRequestClose={handleCloseModal}
          className="modal-content"
        >
          <h2>{intrebareEditata ? 'Editează întrebare' : 'Crează o întrebare'}</h2>
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
          <div class="button-container">
            <button onClick={handleAdaugaSauActualizeazaIntrebare}>{intrebareEditata ? 'Actualizează' : 'Adaugă'}</button>
            <button onClick={handleCloseModal}>Închide</button>
          </div>
        </Modal>


      </div>
    </div>
  );
};

export default GestionareÎntrebăriFeedback;
