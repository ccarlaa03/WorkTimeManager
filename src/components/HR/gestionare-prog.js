import React, { useState } from 'react';

const ProgramLucruHR = () => {
  const [programLucru, setProgramLucru] = useState([]);
  const [ziSelectata, setZiSelectata] = useState({ zi: '', oraInceput: '', oraSfarsit: '' });

  const handleAdaugaZi = () => {
    setProgramLucru([...programLucru, ziSelectata]);
    setZiSelectata({ zi: '', oraInceput: '', oraSfarsit: '' }); // Resetarea formularului
  };

  const handleStergeZi = index => {
    const updatedProgram = [...programLucru];
    updatedProgram.splice(index, 1);
    setProgramLucru(updatedProgram);
  };

  // Funcția de modificare a zilei este comentată deoarece nu este folosită
  // const handleModificaZi = (index, updatedZi) => {
  //   const updatedProgram = [...programLucru];
  //   updatedProgram[index] = updatedZi;
  //   setProgramLucru(updatedProgram);
  // };

  const handleZiChange = (e) => {
    setZiSelectata({ ...ziSelectata, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h1>Gestionare Program de Lucru</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="zi"
          placeholder="Ziua săptămânii"
          value={ziSelectata.zi}
          onChange={handleZiChange}
        />
        <input
          type="time"
          name="oraInceput"
          value={ziSelectata.oraInceput}
          onChange={handleZiChange}
        />
        <input
          type="time"
          name="oraSfarsit"
          value={ziSelectata.oraSfarsit}
          onChange={handleZiChange}
        />
        <button type="button" onClick={handleAdaugaZi}>Adaugă Zi</button>
      </form>
      <ul>
        {programLucru.map((zi, index) => (
          <li key={index}>
            {zi.zi}: {zi.oraInceput} - {zi.oraSfarsit}
            <button onClick={() => handleStergeZi(index)}>Șterge</button>
            {/* Butonul Modifică este comentat până când funcționalitatea este implementată */}
            {/* <button onClick={() => { /* logic to set the selected day for editing * / }}>Modifică</button> */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgramLucruHR;
