import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';  

const Statistici = ({ user_id }) => {
  const [statsData, setStatsData] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.log("Access denied. No token available.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/employee/${user_id}/weekly-stats/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (response.data) {
          updateChartData(response.data);
        }
      } catch (error) {
        console.error("Error loading weekly statistics:", error);
      }
    };

    fetchStats();
  }, [user_id]);

  const updateChartData = (data) => {
    const chartData = {
      labels: ['Ore lucrate ', 'Media zilnică de ore', 'Ore suplimentare'],
      datasets: [
        {
          label: 'Hours',
          data: [data.total_hours, data.average_hours, data.total_overtime],
          backgroundColor: ['rgba(160, 135, 188, 0.5)', 'rgba(201, 203, 207, 0.8)', 'rgba(160, 135, 188, 0.5)']
        }
      ]
    };
    setStatsData(chartData);
  };

  return (
    <div>
      <h2>Statistici Săptămânale</h2>
      {statsData.labels ? (
        <Bar data={statsData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
      ) : (
        <p>Se încarcă statistici...</p>
      )}
    </div>
  );
};

export default Statistici;


