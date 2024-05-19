import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

function getCurrentUserId() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).id : null;
}


const Notifications = ({ }) => {
    const [notifications, setNotifications] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [userOption, setUserOption] = useState('all');
    const [employees, setEmployees] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
    const openSendMessageModal = () => setIsSendMessageModalOpen(true);
    const closeSendMessageModal = () => {
        setIsSendMessageModalOpen(false);
        setError('');
        setSuccessMessage('');
    };
    useEffect(() => {
        const userId = getCurrentUserId();
        if (userId) {
            const fetchNotifications = async () => {
                try {
                    const response = await axios.get(`/notifications/${userId}/`);
                    setNotifications(response.data.notifications);
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            };
    
            fetchNotifications();
        } else {
            console.error('User ID is null, cannot fetch notifications');
        }
    }, []);
    

    const handleSendMessage = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const recipientId = userOption === 'single' ? selectedEmployee : 'all'; 
            const response = await axios.post('/send-notification/', {
                email,
                message,
                recipientId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setSuccessMessage('Notification sent successfully!');
                setEmail('');
                setMessage('');
                setSelectedEmployee('');
            } else {
                setError('Failed to send notification.');
            }
        } catch (error) {
            setError(`Failed to send notification: ${error.response?.data?.message || error.message}`);
        }
        setLoading(false);
    };

    return (
        <div>
           <Modal
                isOpen={isSendMessageModalOpen}
                onRequestClose={closeSendMessageModal}
                contentLabel="Send Message"
                className="modal-content"
            >
                <h2>Trimite un mesaj</h2>
                <form onSubmit={handleSendMessage}>
                    <div>
                        <label>Opțiunea destinatarului:</label>
                        <select value={userOption} onChange={(e) => setUserOption(e.target.value)}>
                            <option value="all">Toți angajații</option>
                            <option value="single">Un singur angajat</option>
                        </select>
                    </div>
                    {userOption === 'single' && (
                        <div>
                            <label>Selectează angajatul:</label>
                            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                                <option value="">Selectează un angajat</option>
                                {employees.map(employee => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.name} - {employee.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <label>Email destinatar:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Scrie emailul."
                        required
                    />
                    <label>Mesaj:</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Scrie mesajul."
                        required
                    />
                    <button type="submit" disabled={loading}>{loading ? 'Se trimite...' : 'Trimite'}</button>
                    {error && <div className="error" style={{ color: 'red' }}>{error}</div>}
                    {successMessage && <div className="success" style={{ color: 'green' }}>{successMessage}</div>}
                </form>
            </Modal>
        </div>
    );
};

export default Notifications;
