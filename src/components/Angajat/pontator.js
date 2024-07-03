import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const Pontator = ({ user_id }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showMessageModal, setShowMessageModal] = useState(false);

    // Functia pentru a prelua statusul curent al pontării
    const fetchCurrentStatus = async () => {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            setMessage("Acces refuzat. Nu există token disponibil.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8000/employee/${user_id}/current-status/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setStatus(response.data.status);
            setLoading(false);
            console.log('Statusul curent:', response.data.status);
        } catch (error) {
            setMessage('Eșec la preluarea statusului curent.');
            console.error('Eșec la preluarea statusului curent:', error);
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

    // Functia pentru a închide modalul de mesaje
    const handleModalClose = () => {
        setShowMessageModal(false);
    };

    // Functia pentru a efectua pontarea la intrare
    const handleClockIn = async () => {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            setMessage("Acces refuzat. Nu există token disponibil.");
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
            setMessage('Eșec la pontarea intrării.');
            console.error('Eroare la pontarea intrării:', error);
            setLoading(false);
        }
    };

    // Functia pentru a efectua pontarea la ieșire
    const handleClockOut = async () => {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            setMessage("Acces refuzat. Nu există token disponibil.");
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
            setMessage('Eșec la pontarea ieșirii.');
            console.error('Eroare la pontarea ieșirii:', error);
            setLoading(false);
        }
    };

    return (
        <div>
            {loading ? <p>Se încarcă...</p> : null}
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

            <Modal isOpen={showMessageModal} onRequestClose={handleModalClose} contentLabel="Message Modal">
                <h2>Mesaj</h2>
                <p>{message}</p>
                <button className="buton" onClick={handleModalClose}>Închide</button>
            </Modal>
        </div>
    );
};

export default Pontator;
