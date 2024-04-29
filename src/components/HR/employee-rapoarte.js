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
      console.log(departmentData);

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

  const purple = 'rgba(160, 135, 188, 0.5)';
  const darkGray = 'rgba(201, 203, 207, 0.8)';

  const chartData = {
    labels: departmentData.map(dept => dept.department.charAt(0).toUpperCase() + dept.department.slice(1)),
    datasets: [
      {
        label: 'Numărul de angajați pe departament',
        data: departmentData.map(dept => dept.employee_count),
        backgroundColor: purple,  
      },
    ],
  };
  
  return (
    <div className="rapoarte-cursuri">
      <h2>Rapoarte angajați pe departamente</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default DepartmentRaporte;
