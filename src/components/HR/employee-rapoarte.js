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

  useEffect(() => {
    const fetchDepartmentReport = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("No access token found. User is not logged in.");
        return;
      }

      try {
        const reportResponse = await instance.get('/department-rapoarte/', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        setDepartmentData(reportResponse.data);
      } catch (error) {
        console.error('Error fetching department report:', error.response ? error.response.data : error);
      }
    };

    fetchDepartmentReport();
  }, []);

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
    <div >
      <h2>Rapoarte angajați pe departamente</h2>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default DepartmentRaporte;
