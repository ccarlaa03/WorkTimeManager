import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const FeedbackCompletionChart = () => {
    // Definirea state-urilor pentru datele de completare, starea de încărcare și eventualele erori
    const [completionData, setCompletionData] = useState({ titles: [], counts: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Funcția pentru a prelua datele de completare
        const fetchCompletionData = async () => {
            // Obținerea tokenului de acces din localStorage
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("Utilizatorul trebuie să fie autentificat pentru a accesa această pagină.");
                setError("Nu s-a găsit niciun token de acces. Vă rugăm să vă autentificați.");
                setIsLoading(false);
                return;
            }

            try {
                // Efectuarea unei cereri GET pentru a prelua datele de completare
                const response = await axios.get('/feedback-completion-report/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                const data = response.data;
                // Setarea datelor de completare în state
                setCompletionData({
                    titles: data.map(item => item.form__title),
                    counts: data.map(item => item.completion_count),
                });
            } catch (error) {
                console.error('Eroare la preluarea datelor de completare:', error);
                setError("Preluarea datelor a eșuat. Vă rugăm să încercați din nou.");
            } finally {
                // Setarea stării de încărcare la false după ce datele au fost preluate
                setIsLoading(false);
            }
        };

        fetchCompletionData();
    }, []);

    // Datele pentru graficul de tip bară
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
                // Afișarea unui mesaj de încărcare dacă datele sunt încă în proces de preluare
                <p>Se încarcă...</p>
            ) : error ? (
                // Afișarea unui mesaj de eroare dacă a apărut o problemă la preluarea datelor
                <p>{error}</p>
            ) : (
                // Afișarea graficului de tip bară cu datele preluate
                <Bar data={chartData} />
            )}
        </div>
    );
};

export default FeedbackCompletionChart;
