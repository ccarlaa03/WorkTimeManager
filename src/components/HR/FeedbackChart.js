import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const BarChart = ({ data }) => {
  const options = {

  };

  const dataForChart = {
    labels: data.map(d => d.departament),
    datasets: [
      {
        label: 'Punctaje pe departamente',
        data: data.map(d => d.punctajMediu),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return <Bar data={dataForChart} options={options} />;
};
