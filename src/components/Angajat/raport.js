import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Raport = ({ user_id }) => {
    const [workHistory, setWorkHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const accessToken = localStorage.getItem('access_token');
    const [chartData, setChartData] = useState({
        labels: ['Total ore lucrate în luna'],
        datasets: []
    });

    useEffect(() => {
        const fetchWorkHistory = async () => {
            setLoadingHistory(true);
            if (!accessToken) {
                console.error("Acces refuzat. Nu există token disponibil.");
                return;
            }

            const currentDate = new Date();
            const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
            const year = previousMonth.getFullYear();
            const month = previousMonth.getMonth() + 1;

            try {
                const url = `http://localhost:8000/employee/${user_id}/work-history/${year}/${month}/`;
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (response.status === 200 && Array.isArray(response.data)) {
                    setWorkHistory(response.data);
                    updateChartData(response.data);
                } else {
                    console.error('Failed to fetch work history or data is not an array');
                    setWorkHistory([]);
                }
            } catch (error) {
                console.error('Error fetching work history:', error);
                setWorkHistory([]);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchWorkHistory();
    }, [user_id, accessToken]);

    const updateChartData = (data) => {
        const totalHoursWorked = data.reduce((total, item) => {
            const hoursWorked = calculateHours(item.start_time, item.end_time);
            return total + hoursWorked;
        }, 0);

        setChartData({
            labels: ['Total ore lucrate în luna'],
            datasets: [
                {
                    label: 'Ore lucrate',
                    data: [totalHoursWorked.toFixed(2)],
                    backgroundColor: 'rgba(160, 135, 188, 0.5)',
                    borderColor: 'rgba(201, 203, 207, 0.8)',
                    borderWidth: 1,
                }
            ]
        });
    };

    const calculateHours = (start, end) => {
        if (!start || !end) return 0;
        const startTime = new Date(`1970-01-01T${start}Z`);
        const endTime = new Date(`1970-01-01T${end}Z`);
        return (endTime - startTime) / (1000 * 3600); // Converts milliseconds to hours
    };

    return (
        <div className="content-container">
            <div className="card-curs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2>Istoricul programului de lucru pentru luna precedentă</h2>
                {loadingHistory ? (
                    <p>Se încarcă istoricul...</p>
                ) : chartData.datasets.length > 0 ? (
                    <>
                        <Bar data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
                        <ul>
                            {workHistory.map((item, index) => (
                                <li key={index}>
                                    {item.date}: {calculateHours(item.start_time, item.end_time).toFixed(2)} ore lucrate
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>Nu există date disponibile pentru a afișa graficul.</p>
                )}
            </div>
        </div>
    );
};

export default Raport;
