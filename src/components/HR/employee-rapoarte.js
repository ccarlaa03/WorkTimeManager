import React, { useEffect, useState } from 'react';
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
import instance from '../../axiosConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DepartmentRaporte = () => {
  const [departmentData, setDepartmentData] = useState([]);

  // Functia pentru a prelua rapoartele pe departamente
  useEffect(() => {
    const fetchDepartmentReport = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
        return;
      }

      try {
        const reportResponse = await instance.get('/department-rapoarte/', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        setDepartmentData(reportResponse.data);
      } catch (error) {
        console.error('Eroare la preluarea raportului pe departamente:', error.response ? error.response.data : error);
      }
    };

    fetchDepartmentReport();
  }, []);

  // Datele pentru grafic
  const chartData = {
    labels: departmentData.map(dept => dept.department.charAt(0).toUpperCase() + dept.department.slice(1)),
    datasets: [
      {
        label: 'Numărul de angajați pe departament',
        data: departmentData.map(dept => dept.employee_count),
        backgroundColor: 'rgba(160, 135, 188, 0.5)',
        borderColor: 'rgba(160, 135, 188, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Opțiunile pentru grafic
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Numărul de angajați pe departament',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div>
      <h2>Rapoarte angajați pe departamente</h2>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default DepartmentRaporte;

