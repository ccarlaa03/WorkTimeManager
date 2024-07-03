import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notifications = ({ user_id }) => {
    const [notifications, setNotifications] = useState([]);
    const [events, setEvents] = useState([]);

    // Functia pentru a prelua notificarile
    useEffect(() => {
        const fetchNotifications = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
                return;
            }

            try {
                // Verifică dacă ruta este corect configurată și dacă accessToken-ul este trimis corect
                const response = await axios.get(`http://localhost:8000/notifications/${user_id}/`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setNotifications(response.data.notifications);
            } catch (error) {
                console.error('Eroare la preluarea notificărilor:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 50000); // Re-fetch every 50 seconds

        return () => clearInterval(interval);
    }, [user_id]);

    // Functia pentru a marca notificările ca fiind citite
    const markAsRead = async (id) => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error("Acces refuzat. Nu există token disponibil.");
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
                console.error('Eroare la marcarea notificării ca citită:', response.data);
            }
        } catch (error) {
            console.error('Eroare la marcarea notificării ca citită:', error);
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
                                    aria-label="Marchează ca citit"
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
