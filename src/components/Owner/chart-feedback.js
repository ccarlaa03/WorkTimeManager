import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const FeedbackCompletionChart = () => {
    const [completionData, setCompletionData] = useState({ titles: [], counts: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCompletionData = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("No access token found. User must be logged in to access this page.");
                setError("No access token found. Please log in.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get('/feedback-completion-report/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                const data = response.data;
                setCompletionData({
                    titles: data.map(item => item.form__title),
                    counts: data.map(item => item.completion_count),
                });
            } catch (error) {
                console.error('Error fetching completion data:', error);
                setError("Failed to fetch data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompletionData();
    }, []);

    const chartData = {
        labels: completionData.titles,
        datasets: [
            {
                label: 'Număr de feedback-uri completate',
                data: completionData.counts,
                backgroundColor: 'rgba(160, 135, 188, 0.5)',
                borderColor: 'rgba(160, 135, 188, 0.5)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="card-curs">
            <h2>Rapoarte completare feedback</h2>
            {isLoading ? (
                <p>Se încarcă...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <Bar data={chartData} />
            )}
        </div>
    );
};

export default FeedbackCompletionChart;
