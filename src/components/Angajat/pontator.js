import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Pontator = ({ user_id }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [workSchedule, setWorkSchedule] = useState([]);

    const fetchCurrentStatus = async () => {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            setMessage("Access denied. No token available.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8000/employee/${user_id}/current-status/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setStatus(response.data.status);
            setLoading(false);
            console.log('Current status:', status);
            console.log("Current status set to:", response.data.status);

        } catch (error) {
            setMessage('Failed to fetch current status.');
            console.error('Failed to fetch current status:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentStatus();
    }, []);

    useEffect(() => {
        if (status === 'clocked out') {
            setMessage("Ți-ai pontat deja ieșirea");
        }
    }, [status]);


    const handleClockIn = async () => {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            setMessage("Access denied. No token available.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8000/clock-in/${user_id}/`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setStatus('clocked in');
            setMessage('Te-ai pontat cu succes pentru intrare. Să ai o zi productivă!');
            setTimeout(fetchCurrentStatus, 1000);
            setLoading(false);
        } catch (error) {
            setMessage('Failed to clock in.');
            console.error('Error clocking in:', error);
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            setMessage("Access denied. No token available.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8000/clock-out/${user_id}/`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setStatus('clocked out');
            setMessage('Te-ai pontat la ieșire. Ne vedem mâine!');
            setLoading(false);
        } catch (error) {
            setMessage('Failed to clock out.');
            console.error('Error clocking out:', error);
            setLoading(false);
        }
    };

    return (
        <div>
            {loading ? <p>Se încarcă...</p> : null}
            {message && <p>{message}</p>}
            {status === 'clocked in' ? (
                <div>
                    <p>Ești pontat la intrare.</p>
                    <button className="buton" onClick={handleClockOut}>Pontare ieșire</button>
                </div>
            ) : (
                <div>
                    <p>Ai pontat ieșirea pentru astăzi.</p>
                    <button className="buton" onClick={handleClockIn}>Pontare intrare</button>
                </div>
            )}
        </div>
    );

};

export default Pontator;
