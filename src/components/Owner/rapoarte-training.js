import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Rapoarte from '../HR/training-rapoarte';
import Participanti from './chart-training';
import ReactPaginate from 'react-paginate';

Modal.setAppElement('#root');

const RapoarteTraining = () => {
    const { user_id } = useParams();
    const [trainings, setTrainings] = useState([]);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [modalIsOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);
    const [owner, setOwner] = useState(null);
    const [company, setCompany] = useState({
        id: '',
        name: '',
        address: '',
        phone_number: '',
        email: '',
        industry: '',
        number_of_employees: 0,
        founded_date: ''
    });
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
        const fetchData = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("No access token found. User must be logged in to access this page.");
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${accessToken}` }
            };

            try {
                const response = await axios.get('http://localhost:8000/owner-dashboard/', config);
                if (response.data.owner) {
                    setOwner(response.data.owner);
                    if (response.data.company) {
                        setCompany(response.data.company);
                    }
                } else {
                    console.error("Owner data is not available or company ID is undefined.");
                }
            } catch (error) {
                console.error("Error fetching data:", error.response || error);
            }
        }

        fetchData();
    }, []);

    const fetchTrainings = async (page = 1) => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error("No access token found. User must be logged in to access this page.");
            setError("No access token found. Please log in.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get('/training-reports/', {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                params: { page }
            });
            setTrainings(response.data.results || []);
            setTotalPages(response.data.total_pages || 1);
        } catch (error) {
            console.error('Error fetching training data:', error);
            setError("Failed to fetch data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainings(currentPage);
    }, [currentPage]);

    const fetchTrainingDetails = async (training_id) => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error("No access token found. User must be logged in to access this page.");
            return;
        }

        try {
            console.log(`Fetching details for training ID: ${training_id}`);
            const response = await axios.get(`/trainings/${training_id}/details/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            console.log('Training Details Response:', response.data);
            setSelectedTraining(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching training details:', error);
            alert('Failed to fetch training details');
        }
    };

    const openModal = (training_id) => {
        fetchTrainingDetails(training_id);
    };
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected + 1);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="container-dashboard">
            <h1 style={{ textAlign: 'center' }}>Rapoarte cursuri angajați</h1>
            <div className="card-curs">
                {trainings.length > 0 ? (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Titlu</th>
                                    <th>Data începerii</th>
                                    <th>Data terminării</th>
                                    <th>Detalii</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainings.map((training) => (
                                    <tr key={training.id}>
                                        <td>{training.title}</td>
                                        <td>{new Date(training.date).toLocaleDateString()}</td>
                                        <td>{new Date(training.date).toLocaleDateString()}</td>
                                        <td><button onClick={() => openModal(training.id)}>Vizualizează Detalii</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <ReactPaginate
                            previousLabel={'Anterior'}
                            nextLabel={'Următorul'}
                            breakLabel={'...'}
                            pageCount={totalPages}
                            onPageChange={handlePageChange}
                            containerClassName={'pagination'}
                            activeClassName={'active'}
                            forcePage={currentPage - 1}
                        />
                    </>
                ) : <p>Nu există sesiuni de training disponibile.</p>}

                {selectedTraining && (
                    <Modal isOpen={modalIsOpen} className="modal-content" onRequestClose={closeModal} contentLabel="Detalii Training">
                        <h2>{selectedTraining.title}</h2>
                        <li>{selectedTraining.description}</li>
                        <p><b>Data:</b> {new Date(selectedTraining.date).toLocaleDateString()}</p>
                        <p><b>Status:</b> {getStatusLabel(selectedTraining.status)}</p>
                        <p><b>Durata (zile): </b>{selectedTraining.duration_days}</p>
                        <p><b>Capacitate:</b> {selectedTraining.capacity}</p>
                        <p><b>Data limită de înregistrare:</b> {selectedTraining.enrollment_deadline ? new Date(selectedTraining.enrollment_deadline).toLocaleDateString() : 'N/A'}</p>
                        <p><b>Numărul de participanți: </b> {selectedTraining.participant_count}</p>
                        <div>
                            <h3>Participanți:</h3>
                            <ul>
                                {selectedTraining.participants && selectedTraining.participants.length > 0 ? (
                                    selectedTraining.participants.map(participant => (
                                        <li key={participant.employee_id}>
                                            {participant.employee_name} - {participant.employee_department}
                                        </li>
                                    ))
                                ) : (
                                    <p>Nu există participanți înregistrați la acest training.</p>
                                )}
                            </ul>
                        </div>
                        <button className='buton' onClick={closeModal}>Închide</button>
                    </Modal>
                )}
            </div>
            <div className="rapoarte-container">
                <div className="rapoarte-section">
                    <Rapoarte trainings={trainings} />
                </div>
                <div className="rapoarte-section">
                    <Participanti />
                </div>
            </div>
        </div>
    );
};

export default RapoarteTraining;
