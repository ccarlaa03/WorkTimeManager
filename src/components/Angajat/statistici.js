import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Chart as ChartJS
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ZileLucrateModal = ({ deschis, zileLucrate, onChange, onClose, onSubmit }) => {
  if (!deschis) return null;

  return (
    <div className="modal-background">
    <div className="modal">
      <div className="modal-content">
        <h2>Selectează zilele lucrate</h2>
        {Object.keys(zileLucrate).map((zi) => (
          <div key={zi}>
            <label>
              {zi.charAt(0).toUpperCase() + zi.slice(1)}:
              <input
                type="checkbox"
                checked={zileLucrate[zi]}
                onChange={(e) => onChange(zi, e.target.checked)}
              />
            </label>
          </div>
        ))}
           <div className="modal-actions">
        <button onClick={onSubmit}>Salvează</button>
        <button onClick={onClose}>Închide</button>
        </div>
      </div>
    </div>
    </div>
  );
};

const Statistici = ({ oreLucrateInitial, zileLibereInitial }) => {
  const [statistici, setStatistici] = useState({
    oreLucrate: oreLucrateInitial,
    zileLibere: zileLibereInitial,
  });

  const [esteDeschisModalZile, setEsteDeschisModalZile] = useState(false);
  const [zileLucrate, setZileLucrate] = useState({
    luni: false,
    marti: false,
    miercuri: false,
    joi: false,
    vineri: false,
    sambata: false,
    duminica: false,
  });

  const handleCheckboxChange = (zi, checked) => {
    setZileLucrate((prevZileLucrate) => ({
      ...prevZileLucrate,
      [zi]: checked,
    }));
  };

  const handleActualizeazaZile = () => {
    const zileLucrateArray = Object.values(zileLucrate);
    const numarZileLucrate = zileLucrateArray.filter(Boolean).length;
    const numarZileLibere = 5 - numarZileLucrate; // Presupunând că sunt 5 zile lucrătoare într-o săptămână

    setStatistici((prevStatistici) => ({
      ...prevStatistici,
      oreLucrate: numarZileLucrate * 8, // Presupunând că o zi lucrătoare are 8 ore
      zileLibere: numarZileLibere,
    }));

    setEsteDeschisModalZile(false);
  };

  const data = {
    labels: ['Ore lucrate', 'Zile libere'],
    datasets: [
      {
        label: 'Statistici săptămânale',
        data: [statistici.oreLucrate, statistici.zileLibere],
        backgroundColor: [
          'rgba(160, 135, 188, 1)',
          'rgba(160, 135, 188, 0.15)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container-item container-statistici">
      <h2>Statistici săptămânale</h2>
      <div className="chart-container">
        <Doughnut data={data} />
      </div>
      <button className="buton" onClick={() => setEsteDeschisModalZile(true)}>
        Selectează Zile Lucrate
      </button>

      <ZileLucrateModal
        deschis={esteDeschisModalZile}
        zileLucrate={zileLucrate}
        onChange={handleCheckboxChange}
        onClose={() => setEsteDeschisModalZile(false)}
        onSubmit={handleActualizeazaZile}
      />
    </div>
  );
};

export default Statistici;
