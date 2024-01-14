import React, { useState, useEffect } from 'react';

const Feedback = () => {
  const [istoricFeedback, setIstoricFeedback] = useState([])
  const [punctaj, setPunctaj] = useState(null); 
  const [formularCurent, setFormularCurent] = useState(null); 

  useEffect(() => {
    // Logica pentru a prelua istoricul feedback-ului, punctajul și formularul curent
    // De exemplu, puteți folosi fetch() pentru a apela un API
    // setIstoricFeedback(...);
    // setPunctaj(...);
    // setFormularCurent(...);
  }, []);

  const trimiteFeedback = (e) => {
    e.preventDefault();
    // Logica pentru a trimite feedback-ul completat către server
    alert('Feedback-ul a fost trimis!');
  };

  return (
    <div className="container-dashboard">
      <h1>Feedback </h1>
      
      <div className="container-program-lucru">
        <h2>Istoric Feedback</h2>
        {/* Aici ar fi afișat istoricul feedback-ului */}
      </div>

      <div className="container-program-lucru">
        <h2>Punctaj acumulat: {punctaj}</h2>
        {/* Aici ar fi afișat punctajul acumulat */}
      </div>

      <div className="container-program-lucru">
        {formularCurent ? (
          <>
            <h2>Formular Feedback Curent</h2>
            {/* Aici ar fi afișat formularul de feedback curent pentru a fi completat */}
            <form onSubmit={trimiteFeedback}>
              {/* Generați dinamic câmpurile de formular în funcție de formularCurent */}
              <button type="submit">Trimite Feedback</button>
            </form>
          </>
        ) : (
          <p>Nu există un formular de feedback de completat în acest moment.</p>
        )}
      </div>
    </div>
  );
};

export default Feedback;
