import React, { useState, useEffect } from 'react';

const GestionareFeedback = () => {
  const [intrebari, setIntrebari] = useState([]);
  const [formularDeschis, setFormularDeschis] = useState(false);
  const [intrebareSelectata, setIntrebareSelectata] = useState(null);

  useEffect(() => {
    // Aici ar trebui să adăugați logica de a prelua întrebările dintr-un backend sau serviciu
    // setIntrebari(...);
  }, []);

  const deschideFormular = (intrebare = null) => {
    setIntrebareSelectata(intrebare); // null pentru o întrebare nouă sau obiectul întrebării pentru editare
    setFormularDeschis(true);
  };

  const inchideFormular = () => {
    setFormularDeschis(false);
  };

  const salveazaIntrebare = (intrebare) => {
    if (intrebareSelectata) {
      // Logica de actualizare a întrebării existente
    } else {
      // Logica de adăugare a unei noi întrebări
    }
    inchideFormular();
  };

  const stergeIntrebare = (id) => {
    // Logica de ștergere a întrebării cu id-ul dat
  };

  return (
    <div className="pagina-feedback-hr">
      <h1>Administrare Feedback</h1>
      <button onClick={() => deschideFormular()}>Adaugă Întrebare Nouă</button>
      {intrebari.map((intrebare) => (
        <div key={intrebare.id} className="intrebare">
          <p>{intrebare.text}</p>
          <button onClick={() => deschideFormular(intrebare)}>Modifică</button>
          <button onClick={() => stergeIntrebare(intrebare.id)}>Șterge</button>
        </div>
      ))}
      {formularDeschis && (
        <FormularEditare
          intrebare={intrebareSelectata}
          salveazaIntrebare={salveazaIntrebare}
          inchideFormular={inchideFormular}
        />
      )}
    </div>
  );
};

const FormularEditare = ({ intrebare, salveazaIntrebare, inchideFormular }) => {
  const [textIntrebare, setTextIntrebare] = useState(intrebare ? intrebare.text : '');

  const handleSalvare = () => {
    const intrebareSalvata = {
      ...intrebare,
      text: textIntrebare,
    };
    salveazaIntrebare(intrebareSalvata);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <label>Text Întrebare</label>
        <input
          type="text"
          value={textIntrebare}
          onChange={(e) => setTextIntrebare(e.target.value)}
        />
        <button onClick={handleSalvare}>Salvează</button>
        <button onClick={inchideFormular}>Închide</button>
      </div>
    </div>
  );
};

export default GestionareFeedback;
