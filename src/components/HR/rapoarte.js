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

const Rapoarte = ({ trainings }) => {
  const raportInscrieri = trainings.map(training => ({
    titlu: training.title,
    inscrieri: training.employee.length,
  }));

  const data = {
    labels: raportInscrieri.map(training => training.titlu),
    datasets: [
      {
        label: 'Număr de înscrieri',
        data: raportInscrieri.map(training => training.inscrieri),
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
