import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const Participanti = () => {
    const [growthData, setGrowthData] = useState({ dates: [], counts: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGrowthData = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("No access token found. User must be logged in to access this page.");
                setError("No access token found. Please log in.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get('/participanti/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                setGrowthData(response.data);
            } catch (error) {
                console.error('Error fetching growth data:', error);
                setError("Failed to fetch data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchGrowthData();
    }, []);

    const chartData = {
        labels: growthData.dates,
        datasets: [
            {
                label: 'Creșterea participanților la cursuri',
                data: growthData.counts,
                fill: false,
                backgroundColor: 'rgba(160, 135, 188, 0.5)',
                borderColor: 'rgba(160, 135, 188, 0.5)'
            },
        ],
    };

    return (
        <div className="rapoarte-cursuri">
            <h2>Rapoarte participanți</h2>
            {isLoading ? (
                <p>Se încarcă...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (

                <Line data={chartData} />
            )}
        </div>
    );
};

export default Participanti;
