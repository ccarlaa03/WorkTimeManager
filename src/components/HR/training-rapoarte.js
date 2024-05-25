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

const Rapoarte = ({ trainings }) => {
  const [reportData, setReportData] = useState([]);


  useEffect(() => {
    const fetchReport = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("No access token found. User is not logged in.");
        return;
      }
      console.log('Trainings prop:', trainings);
      console.log('Chart data:', data);
      try {
        const reportResponse = await instance.get('/training-rapoarte/', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        setReportData(reportResponse.data);
      } catch (error) {
        console.error('Error fetching report:', error.response ? error.response.data : error);
      }
    };

    fetchReport();
  }, [trainings]);

  const purple = 'rgba(160, 135, 188, 0.5)';
  const darkGray = 'rgba(201, 203, 207, 0.8)';

  const data = {
    labels: trainings.map(training => training.title),
    datasets: [
      {
        label: 'Număr de înscrieri',
        data: trainings.map(training => training.participants.length),
        backgroundColor: trainings.map((_, index) => index % 2 === 0 ? darkGray : purple),
      },
    ],
  };



  return (
    <div  className="rapoarte-cursuri">
      <h2>Rapoarte cursuri</h2>
      
      <Bar data={data} />
    </div>
  );
};

export default Rapoarte;
