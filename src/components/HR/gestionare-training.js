import React, { useState, useMemo, useEffect } from 'react';
import Modal from 'react-modal';
import Rapoarte from './training-rapoarte';
import instance from '../../axiosConfig';
import axios from 'axios';

Modal.setAppElement('#root');

const GestionareTrainingHR = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [hrCompanyId, setHrCompany] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [duration_days, setDuration] = useState('');
    const [capacity, setCapacity] = useState('');
    const [enrollmentDeadline, setEnrollmentDeadline] = useState('');
    const [trainings, setTrainings] = useState([]);
    const [editingTraining, setEditingTraining] = useState({
        title: '',
        description: '',
        date: '',
        duration_days: '',
        capacity: '',
        enrollment_deadline: '',
        status: '',
    });
    const [selectedTrainingId, setSelectedTrainingId] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [training, setTraining] = useState({ participants: [] });
    const getStatusLabel = (status) => {
        switch (status) {
            case 'planned':
                return 'Planificat';
            case 'in_progress':
                return 'În progres';
            case 'completed':
                return 'Completat';
            case 'canceled':
                return 'Anulat';
            default:
                return status;
        }
    };

    useEffect(() => {
        const fetchTraining = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("No access token found. User is not logged in.");
                return;
            }

            try {
                const hrResponse = await instance.get('/hr-dashboard/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });

                if (hrResponse.data && hrResponse.data.company_id) {
                    console.log('HR Company ID:', hrResponse.data.company_id);
                    const hrCompanyId = hrResponse.data.company_id;
                    setHrCompany(hrCompanyId);

                    const employeeResponse = await axios.get('/gestionare-ang/', {
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    });
                    console.log('All Employees:', employeeResponse.data);

                    console.log("Employees data:", employees);

                    const trainingResponse = await axios.get(`http://localhost:8000/trainings/${hrCompanyId}/`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    });

                    if (trainingResponse.data) {
                        setTrainings(trainingResponse.data);
                        console.log('Trainings data:', trainingResponse.data);
                    } else {
                        setError("No training data found.");
                    }
                    console.log('Trainings data:', trainingResponse.data);
                    setTrainings(trainingResponse.data);
                    setIsLoading(false);

                } else {
                    console.log('HR Company data:', hrResponse.data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching trainings:', error.response ? error.response.data : error);
                setIsLoading(false);
            }
        };

        fetchTraining();
    }, []);

    //CREATE

    const handleCreateTraining = async () => {
        const newTrainingData = {
            title: title.trim(),
            description: description.trim(),
            date,
            duration_days: parseInt(duration_days),
            capacity: parseInt(capacity),
            enrollment_deadline: enrollmentDeadline,
        };
        console.log('Data sent to backend for new training:', newTrainingData);

        try {
            const response = await instance.post('http://localhost:8000/trainings/create/', newTrainingData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                setTrainings(prevTrainings => [...prevTrainings, response.data]);
                closeAddModal();
            } else {
                console.error('Unexpected response status:', response.status);
            }
        } catch (error) {
            console.error('Error creating new training:', error.response ? error.response.data : error);
        }
    };


    //UPDATE
    const handleEditTraining = async (event) => {
        event.preventDefault();
        if (!editingTraining) {
            alert('Nu s-a selectat niciun training pentru editare.');
            return;
        }
        const formData = {
            title: editingTraining.title.trim(),
            description: editingTraining.description.trim(),
            date: editingTraining.date,
            duration_days: editingTraining.duration_days,
            capacity: editingTraining.capacity,
            enrollment_deadline: editingTraining.enrollment_deadline,
            status: editingTraining.status,
        };
        console.log('Data sent to backend for edit:', formData);
        try {
            const response = await instance.put(`http://localhost:8000/trainings/update/${editingTraining.id}/`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('Response from backend:', response);
            if (response.status === 200) {
                const updatedTrainings = trainings.map(training =>
                    training.id === editingTraining.id ? { ...training, ...response.data } : training
                );
                setTrainings(updatedTrainings);

                closeEditModal();
            } else {
                console.error('Unexpected response status:', response.status);
            }
        } catch (error) {
            console.error('Error updating training:', error.response ? error.response.data : error);

        }
    };


    //DELETE
    const handleDeleteTraining = async (trainingId) => {
        const confirm = window.confirm("Ești sigur că vrei să ștergi acest training?");
        if (confirm) {
            try {
                const response = await instance.delete(`http://localhost:8000/trainings/delete/${trainingId}/`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
                if (response.status === 204) {
                    setTrainings(prevTrainings => prevTrainings.filter(training => training.id !== trainingId));
                }
            } catch (error) {
                console.error('Error deleting training:', error.response ? error.response.data : error);
            }
        }
    };


    const openAddModal = () => {
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const openEditModal = (training) => {
        setEditingTraining({
            ...training,
            date: training.date.substring(0, 10),
            duration_days: training.duration_days,
            enrollment_deadline: training.enrollment_deadline ? training.enrollment_deadline.substring(0, 10) : '',
            status: training.status,
        });
        setIsEditModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditingTraining(prevTraining => ({
            ...prevTraining,
            [name]: value
        }));
    };

    if (isLoading) {
        return <div>Se încarcă...</div>;
    }

    const TrainingDetailsModal = ({ isOpen, onClose, training_id }) => {
        useEffect(() => {
            const fetchDetails = async () => {

                const accessToken = localStorage.getItem('access_token');

                if (!accessToken) {
                    console.error("No access token found. User is not logged in.");
                    return;
                }

                try {
                    const response = await instance.get(`/trainings/${training_id}/details/`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    });
                    setTraining(response.data);
                } catch (error) {
                    console.error('Error fetching training details:', error.response ? error.response.data : error);
                }

            };

            if (isOpen && training_id) {
                fetchDetails();
            }
        }, [isOpen, training_id]);




        return (
            <Modal isOpen={isOpen} className="modal-content" onRequestClose={onClose} contentLabel="Training Details">
                <h2>Detali</h2>
                {training && (
                    <div>
                        <h3>{training.title}</h3>
                        <p>Numărul de participanți: {training.participant_count}</p>
                        <h3>Participanți:</h3>
                        {training.participants && training.participants.length > 0 ? (
                            <ul>
                                {training.participants.map(participant => (
                                    <li key={participant.employee_name}>
                                        {participant.employee_name} - {participant.employee_department}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nu există participanți înregistrați la acest training.</p>
                        )}
                    </div>
                )}

                <button onClick={onClose}>Închide</button>
            </Modal>
        );
    };
    const handleOpenDetails = (training_id) => {
        setSelectedTrainingId(training_id);
        setIsDetailsModalOpen(true);
    };
    return (
        <div className="container-dashboard">
            <h1 style={{ textAlign: 'center' }}>Training</h1>
            <div className="lista-cursuri">
                {trainings.map(training => (
                    <div key={training.id} className="card">
                        <h3>{training.title}</h3>
                        <p>{training.description}</p>
                        <p>Data: {new Date(training.date).toLocaleDateString()}</p>
                        <p>Status: {getStatusLabel(training.status)}</p>
                        <p>Durata: {training.duration_days} zile</p>
                        <p>Capacitate: {training.capacity} persoane</p>
                        <p>Înregistrare până la: {training.enrollment_deadline ? new Date(training.enrollment_deadline).toLocaleDateString() : 'N/A'}</p>
                        <div className="button-container">
                            <button className='buton' onClick={() => handleOpenDetails(training.id)}>Detali</button>
                            <button className='buton' onClick={() => openEditModal(training)}>Editează</button>
                            <button className='buton' onClick={() => handleDeleteTraining(training.id)}>Șterge</button>
                        </div>
                    </div>
                ))}

                <TrainingDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    training_id={selectedTrainingId}
                />
            </div>

            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={closeEditModal}
                className="modal-content"
                contentLabel="Edit Training"
            >
                <h2>Editare curs</h2>
                <form onSubmit={handleEditTraining}>
                    <div className="form-group">
                        <label htmlFor="title">Titlu curs:</label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={editingTraining.title}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="description">Descriere:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={editingTraining.description}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="date">Data:</label>
                        <input
                            id="date"
                            type="date"
                            name="date"
                            value={editingTraining.date}
                            onChange={handleChange}
                        />
                        <label htmlFor="status">Status:</label>
                        <select
                            id="status"
                            name="status"
                            value={editingTraining.status}
                            onChange={handleChange}
                        >
                            <option value="planned">{getStatusLabel('planned')}</option>
                            <option value="in_progress">{getStatusLabel('in_progress')}</option>
                            <option value="completed">{getStatusLabel('completed')}</option>
                            <option value="canceled">{getStatusLabel('canceled')}</option>
                        </select>

                        <label htmlFor="duration">Durata (zile):</label>
                        <input
                            id="duration"
                            type="number"
                            name="duration_days"
                            value={editingTraining.duration_days}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="capacity">Capacitate:</label>
                        <input
                            id="capacity"
                            type="number"
                            name="capacity"
                            value={editingTraining.capacity}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="enrollment_deadline">Înregistrare până la:</label>
                        <input
                            id="enrollment_deadline"
                            type="date"
                            name="enrollment_deadline"
                            value={editingTraining.enrollment_deadline}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="submit">Salvează modificările</button>
                        <button type="button" onClick={closeEditModal}>Închide</button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isAddModalOpen}
                onRequestClose={closeAddModal}
                className="modal-content"
                contentLabel="Adaugă Training"
            >
                <h2>Adaugă Curs Nou</h2>
                <form onSubmit={handleCreateTraining}>
                    <label>
                        Titlu:
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Descriere:
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Data:
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Durata (zile):
                        <input
                            type="number"
                            value={duration_days}
                            onChange={(e) => setDuration(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Capacitate:
                        <input
                            type="number"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Înregistrare până la:
                        <input
                            type="date"
                            value={enrollmentDeadline}
                            onChange={(e) => setEnrollmentDeadline(e.target.value)}
                        />
                    </label>
                    <button type="submit">Adaugă</button>
                    <button type="button" onClick={closeAddModal}>Închide</button>
                </form>
            </Modal>
            <div className="button-container">
                <button onClick={openAddModal} className="buton">Adaugă curs nou</button>
            </div>
            <div>
                <Rapoarte trainings={trainings} />

            </div>
        </div>
    );
};

export default GestionareTrainingHR;
