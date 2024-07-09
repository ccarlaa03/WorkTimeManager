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

    // Functia pentru a obține eticheta statusului
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

    // Functia pentru a prelua datele de pe server
    useEffect(() => {
        const fetchData = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("Nu s-a găsit niciun token de acces. Utilizatorul trebuie să fie autentificat pentru a accesa această pagină.");
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${accessToken}` }
            };

            try {
                const response = await axios.get('http://localhost:8000/owner-dashboard/', config);
                if (response.data.owner && response.data.owner.company_id) {
                    console.log("Company ID:", response.data.owner.company_id);
                    setOwner(response.data.owner);
                    if (response.data.company) {
                        setCompany(response.data.company);
                    }
                } else {
                    console.error("Datele proprietarului nu sunt disponibile sau ID-ul companiei nu este definit.");
                }
            } catch (error) {
                console.error("Eroare la preluarea datelor:", error.response || error);
            }
        }


        fetchData();
    }, []);

    // Functia pentru a prelua sesiunile de training
    const fetchTrainings = async (page = 1) => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error("Nu s-a găsit niciun token de acces. Utilizatorul trebuie să fie autentificat pentru a accesa această pagină.");
            setError("Nu s-a găsit niciun token de acces. Vă rugăm să vă autentificați.");
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
            console.error('Eroare la preluarea datelor despre training:', error);
            setError("Preluarea datelor a eșuat. Vă rugăm să încercați din nou.");
        } finally {
            setIsLoading(false);
        }
    };

    // Efect pentru a prelua sesiunile de training la schimbarea paginii curente
    useEffect(() => {
        fetchTrainings(currentPage);
    }, [currentPage]);

    // Functia pentru a prelua detaliile unui training

    const fetchTrainingDetails = async (training_id) => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error("Nu s-a găsit niciun token de acces. Utilizatorul trebuie să fie autentificat pentru a accesa această pagină.");
            setError("Nu s-a găsit niciun token de acces. Vă rugăm să vă autentificați.");
            setIsLoading(false);
            return;
        }
        setIsModalOpen(true); // Setează modalul să se deschidă înainte sau după fetch, în funcție de necesități
        try {
            const response = await axios.get(`/trainings/${training_id}/details/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            console.log('Răspuns detalii training:', response.data);
            setSelectedTraining(response.data);
        } catch (error) {
            console.error('Eroare la preluarea detaliilor training-ului:', error);
            alert('Preluarea detaliilor despre training a eșuat');
            setIsModalOpen(false); // Închide modalul dacă fetch-ul eșuează
        }
    };


    // Functia pentru a deschide modalul de detalii training
    const openModal = (training_id) => {
        fetchTrainingDetails(training_id);
    };

    // Functia pentru a schimba pagina curentă
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected + 1);
    };

    // Functia pentru a închide modalul de detalii training
    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (isLoading) return <p>Se încarcă...</p>;
    if (error) return <p>Eroare: {error}</p>;

    return (
        <div className="container-dashboard">
            <h1 style={{ textAlign: 'center' }}>Rapoarte cursuri angajați</h1>
            <div className="card-curs">
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
            </div>
            <div className="rapoarte-container">
                <div className="rapoarte-chart-container">
                    <Rapoarte trainings={trainings} />
                </div>
                <div className="rapoarte-chart-container">
                    <Participanti />
                </div>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Detalii Training"
                className="modal-content"
            >
                <h2>Detalii despre curs</h2>
                {selectedTraining && (
                    <div>
                        <h3>{selectedTraining.title}</h3>
                        <p>Numărul de participanți: {selectedTraining.participant_count}</p>
                        <h3>Participanți:</h3>
                        {selectedTraining.participants && selectedTraining.participants.length > 0 ? (
                            <ul>
                                {selectedTraining.participants.map(participant => (
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
                <button onClick={closeModal}>Închide</button>
            </Modal>

        </div>

    );

};

export default RapoarteTraining;

