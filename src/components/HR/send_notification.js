import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = ({ }) => {
    const [notifications, setNotifications] = useState([]);
    const [userOption, setUserOption] = useState('all');
    const [loggedInUserId, setloggedInUserId] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`/notifications/${getCurrentUserId()}/`);
                setNotifications(response.data.notifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

    const handleSendNotification = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await axios.post(`/send-notification/${recipientId}/`, { message });
            setSuccessMessage('Notification sent successfully!');
            setLoading(false);
            setRecipientId('');
            setMessage('');
        } catch (error) {
            setError('Failed to send notification.');
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Trimite un mesaj</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            <input
                type="text"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                placeholder="Recipient User ID"
            />
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message"
            />
            <button onClick={handleSendNotification} disabled={loading}>
                {loading ? 'Sending...' : 'Send Notification'}
            </button>

            <select value={userOption} onChange={(e) => setUserOption(e.target.value)}>
                <option value="all">Toți angajații</option>
                <option value="single">Un singur angajat</option>
            </select>
            {userOption === 'single' && (
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                    <option value="">Selectează un angajat</option>
                    {/* Aici poți popula opțiunile cu lista de angajați disponibili */}
                </select>
            )}
            {notifications.map(notification => (
                <div key={notification.id}>
                    {notification.message}
                </div>
            ))}
        </div>
    );
};

export default Notifications;
