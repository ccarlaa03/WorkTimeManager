import React, { useState } from 'react';

const Calendar = () => {
  const [dataCurenta, setDataCurenta] = useState(new Date());
  const [evenimente] = useState([
    {
      data: new Date(2024, 0, 10),
      ora: '10:00',
      descriere: 'Reuniune de echipă',
    },
    {
      data: new Date(2024, 0, 15),
      ora: '14:30',
      descriere: 'Prezentare client',
    },
    // Alte evenimente...
  ]);
  const zileSaptamana = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
  const luni = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

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

      {/* Afișează lista de evenimente */}
      <div className="lista-evenimente">
        <h2>Evenimente</h2>
        <ul>
          {evenimente.map((eveniment, index) => (
            <li key={index}>
              <strong>{eveniment.data.toLocaleDateString()}</strong> la {eveniment.ora}: {eveniment.descriere}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Calendar;
