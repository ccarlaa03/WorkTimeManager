import React, { useState } from 'react';

const Calendar = () => {
  const [dataCurenta, setDataCurenta] = useState(new Date());
  const [evenimente, setEvenimente] = useState([
    {
      data: new Date(2024, 0, 10),
      ora: '10:00',
      descriere: 'Reuniune de echipă',
      culoare: 'verde'
    },
    {
      data: new Date(2024, 0, 15),
      ora: '14:30',
      descriere: 'Prezentare client',
      culoare: 'verde'
    },
    // Alte evenimente...
  ]);
  const zileSaptamana = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
  const luni = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

  const adaugaEveniment = (evenimentNou) => {
    evenimentNou.data = new Date(evenimentNou.data);
    setEvenimente(evenimenteActuale => [...evenimenteActuale, evenimentNou]);

  };

  const generareZileLuna = () => {
    const zile = [];
    const primaZi = new Date(dataCurenta.getFullYear(), dataCurenta.getMonth(), 1);
    const ultimaZi = new Date(dataCurenta.getFullYear(), dataCurenta.getMonth() + 1, 0).getDate();
  
    for (let zi = 1; zi <= ultimaZi; zi++) {
      const dataZi = new Date(dataCurenta.getFullYear(), dataCurenta.getMonth(), zi);
      const evenimenteZi = evenimente.filter(event => event.data.toDateString() === dataZi.toDateString());
      const areEvenimente = evenimenteZi.length > 0;
  
      zile.push(
        <div
          key={zi}
          className={`zi-calendar ${areEvenimente ? 'cu-eveniment' : ''}`}
        >
          {zi}
          <ul className="evenimente">
            {evenimenteZi.map((eveniment, index) => (
              <li key={index}>
                <div>{eveniment.ora}</div>
                <div>{eveniment.descriere}</div>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  
    return zile;
  };
  
  

  const schimbaLuna = (increment) => {
    setDataCurenta(new Date(dataCurenta.getFullYear(), dataCurenta.getMonth() + increment, 1));
  };

  const actualizeazaCalendar = () => {
    // Actualizează calendarul pentru a afișa evenimentele curente
    setDataCurenta(new Date(dataCurenta)); // Apelează setDataCurenta pentru a reactualiza componenta
  };

  return (
    <div>
      <div className="header-calendar">
        <button onClick={() => schimbaLuna(-1)}>&lt;</button>
        <span>{luni[dataCurenta.getMonth()]} {dataCurenta.getFullYear()}</span>
        <button onClick={() => schimbaLuna(1)}>&gt;</button>
      </div>

      <div className="container-zile-saptamana">
        {zileSaptamana.map(zi => <div key={zi} className="zi-saptamana">{zi}</div>)}
      </div>

      <div className="container-zile-luna">
        {generareZileLuna()}
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        const data = e.target.data.value;
        const ora = e.target.ora.value;
        const descriere = e.target.descriere.value;
        const culoare = e.target.culoare.value;
        adaugaEveniment({ data, ora, descriere, culoare });
        e.target.reset();
      }}>
        <input type="date" name="data" required />
        <input type="time" name="ora" required />
        <input type="text" name="descriere" placeholder="Descriere eveniment" required />
        <input type="color" name="culoare" />
        <button type="submit">Adaugă eveniment</button>
      </form>

      {/* Afișează lista de evenimente */}
      <div className="lista-evenimente">
        <h2>Evenimente</h2>
        <ul>
          {evenimente.map((eveniment, index) => (
            <li key={index}>{eveniment.descriere}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Calendar;
