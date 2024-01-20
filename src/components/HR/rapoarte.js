import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Rapoarte = ({ cursuri }) => {
  const raportInscrieri = cursuri.map(curs => ({
    titlu: curs.titlu,
    inscrieri: curs.inscrieri ? curs.inscrieri.length : 0
  }));

  const data = {
    labels: raportInscrieri.map(curs => curs.titlu),
    datasets: [
      {
        label: 'Număr de înscrieri',
        data: raportInscrieri.map(curs => curs.inscrieri),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="rapoarte-cursuri">
      <h2>Rapoarte Cursuri</h2>
      <Bar data={data} />
    </div>
  );
};

export default Rapoarte;
