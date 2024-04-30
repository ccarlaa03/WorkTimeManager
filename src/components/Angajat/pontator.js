import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Pontator = ({ user_id }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurrentStatus = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("Access denied. No token available.");
                return;
            }
            try {
                const response = await axios.get(`http://localhost:8000/employee/${user_id}/current-status/`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                console.log('Current status:', response.data.status);
            } catch (error) {
                console.error('Failed to fetch current status:', error);
            }
        };
        fetchCurrentStatus();
    }, [user_id]);

    const handleClockIn = async () => {
        setLoading(true);
        setError(null);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            setError("Access denied. No token available. User must be logged in.");
            setLoading(false);
            alert("Access denied. You must be logged in.");
            return;
        }

        try {
            await axios.post(`http://localhost:8000/clock-in/${user_id}/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setStatus('intrare');
            alert('Successfully clocked in.');
        } catch (error) {
            console.error('Error clocking in:', error);
            setError('Failed to clock in. ' + error.message);
            alert('Failed to clock in.');
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        setLoading(true);
        setError(null);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            setError("Access denied. No token available. User must be logged in.");
            setLoading(false);
            alert("Access denied. You must be logged in.");
            return;
        }

        try {
            await axios.post(`http://localhost:8000/clock-out/${user_id}/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setStatus('iesire');
            alert('Successfully clocked out.');
        } catch (error) {
            console.error('Error clocking out:', error);
            setError('Failed to clock out. ' + error.message);
            alert('Failed to clock out.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {status === 'intrare' ? (
                <div>
                    <p>Ești pontat la intrare.</p>
                    <button onClick={handleClockOut}>Pontare ieșire</button>
                </div>
            ) : status === 'iesire' ? (
                <p>Ai pontat ieșirea pentru astăzi.</p>
            ) : (
                <button onClick={handleClockIn}>Pontare intrare</button>
            )}
        </div>
    );
};

export default Pontator;
