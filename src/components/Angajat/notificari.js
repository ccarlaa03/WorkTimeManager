import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notifications = ({ user_id }) => {
    const [notifications, setNotifications] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.log("Access denied. No token available.");
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8000/notifications/${user_id}/`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                console.log(response.data.notifications);

                setNotifications(response.data.notifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 50000);

        return () => clearInterval(interval);
    }, [user_id]);

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
                setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            } else {
                console.error('Error marking notification as read:', response.data.message);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };
    
   useEffect(() => {
        const fetchEvents = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.log("Access denied. No token available.");
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8000/events/`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (response.status === 200) {
                    console.log(response.data);
                    setEvents(response.data.map(event => ({
                        title: event.title,
                        start: new Date(event.start),
                        end: new Date(event.end)
                    })));
                } else {
                    console.error('Failed to fetch events', response.data);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 50000);

        return () => clearInterval(interval);
    }, [user_id]);
    

    return (
        <div className="content-container">
            <div className="card-curs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ textAlign: 'center' }}>Notificări</h2>
                {notifications.map(notification => (
                    <div key={notification.id} className="notification-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: notification.is_read ? '#f0f0f0' : '#fff', padding: '10px', margin: '5px', width: '80%', maxWidth: '600px' }}>
                        <p className="notification-message" style={{ flex: 1 }}>{notification.message}</p>
                        <span className="notification-date" style={{ flex: 0, marginRight: '20px' }}>
                            {notification.created_at ? new Date(notification.created_at).toLocaleDateString() : 'Data necunoscută'}
                        </span>
                        {!notification.is_read && (
                            <input
                                type="checkbox"
                                style={{ flex: 0 }}
                                checked={notification.is_read}
                                onChange={() => markAsRead(notification.id)}
                                aria-label="Mark as read"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Notifications;
