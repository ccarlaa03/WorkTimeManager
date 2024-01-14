import React, { useState } from 'react';

const FormularFeedbackHR = () => {
  const [raspunsuri, setRaspunsuri] = useState({
    intrebare1: '',
    intrebare2: '',
    intrebare3: '',
    intrebare4: '',
    intrebare5: ''
  });

  const intrebari = [
    {
      id: 'intrebare1',
      text: 'Cum ați evalua nivelul de stres la locul de muncă în această lună?',
      optiuni: [
        { text: 'Foarte scăzut', punctaj: 5 },
        { text: 'Scăzut', punctaj: 4 },
        { text: 'Moderat', punctaj: 3 },
        { text: 'Ridicat', punctaj: 2 },
        { text: 'Foarte ridicat', punctaj: 1 }
      ],
    },
    {
      id: 'intrebare2',
      text: 'Cum apreciați calitatea comunicării dintre departamente?',
      optiuni: [
        { text: 'Excelentă', punctaj: 5 },
        { text: 'Bună', punctaj: 4 },
        { text: 'Satisfăcătoare', punctaj: 3 },
        { text: 'Slabă', punctaj: 2 },
        { text: 'Foarte slabă', punctaj: 1 }
      ],
    },
    {
      id: 'intrebare3',
      text: 'Cât de mulțumit(ă) sunteți de echilibrul dintre viața profesională și cea personală?',
      optiuni: [
        { text: 'Foarte mulțumit(ă)', punctaj: 5 },
        { text: 'Mulțumit(ă)', punctaj: 4 },
        { text: 'Nici mulțumit(ă), nici nemulțumit(ă)', punctaj: 3 },
        { text: 'Nemulțumit(ă)', punctaj: 2 },
        { text: 'Foarte nemulțumit(ă)', punctaj: 1 }
      ],
    },
    {
      id: 'intrebare4',
      text: 'Cum evaluați oportunitățile de dezvoltare profesională oferite de companie?',
      optiuni: [
        { text: 'Excelente', punctaj: 5 },
        { text: 'Bune', punctaj: 4 },
        { text: 'Satisfăcătoare', punctaj: 3 },
        { text: 'Slabe', punctaj: 2 },
        { text: 'Inexistente', punctaj: 1 }
      ],
    },
    {
      id: 'intrebare5',
      text: 'Cât de adecvat considerați feedback-ul primit de la superiori?',
      optiuni: [
        { text: 'Foarte adecvat', punctaj: 5 },
        { text: 'Adecvat', punctaj: 4 },
        { text: 'Acceptabil', punctaj: 3 },
        { text: 'Inadecvat', punctaj: 2 },
        { text: 'Foarte inadecvat', punctaj: 1 }
      ],
    }
  ];

  const handleChange = (intrebareId, optiune) => {
    setRaspunsuri(prevRaspunsuri => ({
      ...prevRaspunsuri,
      [intrebareId]: optiune,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(raspunsuri);
    // Implementați trimiterea datelor la server aici
  };

  return (
    <div className="container-feedback">
      <h1>Feedback lunar angajați</h1>
      <form onSubmit={handleSubmit}>
        {intrebari.map(intrebare => (
          <div key={intrebare.id} className="intrebare">
            <p>{intrebare.text}</p>
            {intrebare.optiuni.map(optiune => (
              <label key={optiune.text}>
                <input
                  type="radio"
                  name={intrebare.id}
                  value={optiune.punctaj}
                  checked={raspunsuri[intrebare.id] === optiune.text}
                  onChange={() => handleChange(intrebare.id, optiune.text)}
                />
                {optiune.text}
              </label>
            ))}
          </div>
        ))}
        <button type="submit">Trimite Feedback</button>
      </form>
    </div>
  );
};

export default FormularFeedbackHR;
