import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const Participanti = () => {
    // Definirea state-urilor pentru datele de creștere, starea de încărcare și eventualele erori
    const [growthData, setGrowthData] = useState({ dates: [], counts: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Funcția pentru a prelua datele de creștere
        const fetchGrowthData = async () => {
            // Obținerea tokenului de acces din localStorage
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("Utilizatorul trebuie să fie autentificat pentru a accesa această pagină.");
                setError("Nu s-a găsit niciun token de acces. Vă rugăm să vă autentificați.");
                setIsLoading(false);
                return;
            }

            try {
                // Efectuarea unei cereri GET pentru a prelua datele de creștere
                const response = await axios.get('/participanti/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                // Setarea datelor de creștere în state
                setGrowthData(response.data);
            } catch (error) {
                console.error('Eroare la preluarea datelor de creștere:', error);
                setError("Preluarea datelor a eșuat. Vă rugăm să încercați din nou.");
            } finally {
                // Setarea stării de încărcare la false după ce datele au fost preluate
                setIsLoading(false);
            }
        };

        fetchGrowthData();
    }, []);

    // Datele pentru graficul de tip linie
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
        <div className="card-curs">
            <h2>Rapoarte participanți</h2>
            {isLoading ? (
                // Afișarea unui mesaj de încărcare dacă datele sunt încă în proces de preluare
                <p>Se încarcă...</p>
            ) : error ? (
                // Afișarea unui mesaj de eroare dacă a apărut o problemă la preluarea datelor
                <p>{error}</p>
            ) : (
                // Afișarea graficului de tip linie cu datele preluate
                <Line data={chartData} />
            )}
        </div>
    );
};

export default Participanti;
