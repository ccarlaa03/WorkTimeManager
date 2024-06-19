import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notifications = ({ user_id }) => {
    const [notifications, setNotifications] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("No access token found. User is not logged in.");
                return;
            }

            try {
                // Verifică dacă ruta este corect configurată și dacă accessToken-ul este trimis corect
                const response = await axios.get(`http://localhost:8000/notifications/${user_id}/`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setNotifications(response.data.notifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 50000); // Re-fetch every 50 seconds

        return () => clearInterval(interval);
    }, [user_id]);

    // Funcție pentru a marca notificările ca fiind citite
    const markAsRead = async (id) => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error("Access denied. No token available.");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8000/notifications/mark-read/${id}/`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (response.status === 200) {
                // Filtrăm notificările pentru a elimina notificarea citită
                setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== id));
            } else {
                console.error('Error marking notification as read:', response.data);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <div className="content-container">
            <div className="card-curs">
                <h2>Notificări</h2>
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div key={notification.id} className="notification-item">
                            <p>{notification.message}</p>
                            {!notification.is_read && (
                                <input
                                    type="checkbox"
                                    checked={false}
                                    onChange={() => markAsRead(notification.id)}
                                    aria-label="Mark as read"
                                />
                            )}
                        </div>

                    ))
                ) : (
                    <p>Nu există notificări necitite.</p>
                )}
            </div>
        </div>
    );


};

export default Notifications;
