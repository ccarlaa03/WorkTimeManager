import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import instance from '../../axiosConfig';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { useParams } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { Bar } from 'react-chartjs-2';

const FeedbackForm = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [hrCompanyId, setHrCompany] = useState(null);
    const [feedbackForms, setFeedbackForms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState('');
    const { user_id } = useParams();
    const [hrReviewStatus, setHrReviewStatus] = useState('pending');
    const [editFormId, setEditFormId] = useState(null);
    const [editFormTitle, setEditFormTitle] = useState('');
    const [editFormDescription, setEditFormDescription] = useState('');
    const [editHrReviewStatus, setEditHrReviewStatus] = useState('pending');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const feedbackFormsPerPage = 4;
    const [totalPages, setTotalPages] = useState(0);
    const [selectedForm, setSelectedForm] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Functia pentru a prelua formularele de feedback
    useEffect(() => {
        const fetchFeedbackForms = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
                return;
            }

            try {
                const hrResponse = await instance.get('/hr-dashboard/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });

                if (hrResponse.data && hrResponse.data.company_id) {
                    console.log('ID-ul companiei HR:', hrResponse.data.company_id);
                    const hrCompanyId = hrResponse.data.company_id;
                    setHrCompany(hrCompanyId);

                    // Apelăm funcția de preluare paginată a formularelor de feedback
                    fetchPaginatedFeedbackForms(hrCompanyId, currentPage);
                } else {
                    console.log('Datele companiei HR:', hrResponse.data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Eroare la preluarea datelor companiei HR:', error);
                setIsLoading(false);
            }
        };

        fetchFeedbackForms();
    }, [currentPage]); // Include currentPage în dependințe pentru a prelua noi pagini

    // Functia pentru a prelua formularele de feedback paginat
    const fetchPaginatedFeedbackForms = async (companyId, page) => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
            return;
        }

        const params = new URLSearchParams({
            page: page + 1,
            page_size: feedbackFormsPerPage
        }).toString();

        try {
            const feedbackResponse = await axios.get(`http://localhost:8000/gestionare-feedback/${companyId}/?${params}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (feedbackResponse.data) {
                setFeedbackForms(feedbackResponse.data.results);
                setTotalPages(Math.ceil(feedbackResponse.data.count / feedbackFormsPerPage));
                console.log('Formularele de feedback:', feedbackResponse.data);
            } else {
                setFeedbackForms([]);
                console.error('Nu s-au găsit formulare de feedback sau datele nu sunt în formatul așteptat:', feedbackResponse.data);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Eroare la preluarea datelor de feedback:', error.response ? error.response.data : error);
            setIsLoading(false);
        }
    };

    // Datele pentru grafic
    const feedbackData = {
        labels: feedbackForms.map(form => form.title),
        datasets: [{
            label: 'Număr de feedback-uri completate',
            data: feedbackForms.map(form => form.employee_feedbacks ? form.employee_feedbacks.length : 0),
            backgroundColor: 'rgba(160, 135, 188, 0.5)',
            borderColor: 'rgba(201, 203, 207, 0.8)',
            borderWidth: 1,
        }]
    };

    // Functia pentru a crea un nou formular de feedback
    const handleCreateForm = async () => {
        const newFormData = {
            title: formTitle.trim(),
            description: formDescription.trim(),
            created_by: user_id,
            hr_review_status: hrReviewStatus,
        };
    
        console.log('Datele trimise la backend pentru noul formular:', newFormData);
    
        try {
            const response = await axios.post('http://localhost:8000/feedback/add-form/', newFormData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.status === 201) {
                console.log('Răspunsul de la server:', response.data);
                setFeedbackForms(prevForms => [...prevForms, response.data]);
                alert('Formularul a fost creat cu succes!');
                closeModal();
            } else {
                console.error('Răspuns neașteptat de la server:', response);
            }
        } catch (error) {
            console.error('Eroare la crearea unui nou formular:', error.response ? error.response.data : error);
            alert('A apărut o eroare la crearea formularului.');
        }
    };
    

    // Functia pentru a șterge un formular de feedback
    const handleDeleteFeedback = async (formId) => {
        const confirm = window.confirm("Ești sigur că vrei să ștergi acest formular?");
        if (confirm) {
            try {
                const accessToken = localStorage.getItem('access_token');
                const response = await axios.delete(`http://localhost:8000/feedback/delete/${formId}/`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                if (response.status === 204) {
                    alert('Formularul a fost șters cu succes!');
                    setFeedbackForms(prevForms => prevForms.filter(form => form.id !== formId));
                }
            } catch (error) {
                console.error('Eroare la ștergerea formularului de feedback:', error.response ? error.response.data : error);
                alert('A apărut o eroare la ștergerea formularului.');
            }
        }
    };

    // Functia pentru a edita un formular de feedback existent
    const handleEditFeedback = async () => {
        if (!editFormId) {
            alert('ID-ul formularului nu este specificat.');
            return;
        }

        const formData = {
            title: editFormTitle.trim(),
            description: editFormDescription.trim(),
            hr_review_status: editHrReviewStatus,
        };

        try {
            const response = await axios.put(`http://localhost:8000/feedback/update-form/${editFormId}/`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            setFeedbackForms(prevForms => prevForms.map(form => {
                if (form.id === editFormId) {
                    return { ...form, ...response.data };
                }
                return form;
            }));

            alert('Formularul a fost actualizat cu succes!');
            setEditFormId(null);
            setEditFormTitle('');
            setEditFormDescription('');
            setEditHrReviewStatus('pending');
            closeEditModal();
        } catch (error) {
            console.error('Eroare la actualizarea formularului de feedback:', error.response ? error.response.data : error);
            alert('A apărut o eroare la actualizarea formularului.');
        }
    };

    // Functia pentru a deschide modalul de editare
    const openEditModal = (form) => {
        setEditFormId(form.id);
        setEditFormTitle(form.title);
        setEditFormDescription(form.description);
        setEditHrReviewStatus(form.hr_review_status);
        setIsEditModalOpen(true);
    };

    // Functia pentru a închide modalul de editare
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditFormId(null);
        setEditFormTitle('');
        setEditFormDescription('');
        setEditHrReviewStatus('pending');
    };

    // Functia pentru a deschide modalul de creare
    const openModal = () => {
        setIsModalOpen(true);
    };

    // Functia pentru a închide modalul de creare
    const closeModal = () => {
        setIsModalOpen(false);
        setFormTitle("");
        setFormDescription("");
    };

    // Functia pentru a închide modalul de detalii
    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedForm(null);
    };

    // Functia pentru a trunchia textul lung
    const truncateText = (text, length) => {
        if (text.length > length) {
            return text.substring(0, length) + '...';
        }
        return text;
    };

    // Functia pentru a schimba pagina curentă în paginare
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    // Functia pentru a deschide modalul de detalii pentru un formular specific
    const openDetailsModal = async (formId) => {
        const accessToken = localStorage.getItem('access_token');
        try {
            const response = await axios.get(`http://localhost:8000/feedback-form-details/${formId}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            setSelectedForm(response.data);
            setIsDetailsModalOpen(true);
        } catch (error) {
            console.error('Eroare la preluarea detaliilor formularului de feedback:', error);
        }
    };

    return (
        <div className="container-dashboard">
            <h1>Gestionare feedback</h1>
            <div className="card-curs">
                <div className="table-container">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Titlu</th>
                                <th>Descriere</th>
                                <th>Creat de</th>
                                <th>Creat la ora</th>
                                <th>Status</th>
                                <th>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbackForms.map((form) => (
                                <tr key={form.id}>
                                    <td>
                                        <Link to={`/feedback-details/${form.id}/`} style={{ color: 'black', textDecoration: 'none', opacity: 0.7 }}>
                                            {form.title}
                                        </Link>
                                    </td>
                                    <td>{truncateText(form.description, 50)}</td>
                                    <td>{form.created_by}</td>
                                    <td>{new Date(form.created_at).toLocaleDateString('ro-RO')}</td>
                                    <td>{form.hr_review_status_display}</td>
                                    <td>
                                        <button className='buton' onClick={() => openEditModal(form)}>Editează</button>
                                        <button className='buton' onClick={() => handleDeleteFeedback(form.id)}>Șterge</button>
                                        <button className='buton' onClick={() => openDetailsModal(form.id)}>Detalii</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <ReactPaginate
                    previousLabel={'Anterior'}
                    nextLabel={'Următorul'}
                    breakLabel={'...'}
                    pageCount={totalPages}
                    onPageChange={handlePageChange}
                    containerClassName={'pagination'}
                    activeClassName={'active'}
                    forcePage={currentPage}
                />
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button className='buton' onClick={openModal}>Adaugă formular nou</button>
                </div>


            </div>
            <Modal
                isOpen={isDetailsModalOpen}
                onRequestClose={closeDetailsModal}
                contentLabel="Feedback Form Details"
                className="modal-content"
            >
                {selectedForm ? (
                    <div align="center">
                        <h2>{selectedForm.title}</h2>
                        <p><strong>Creat de:</strong> {selectedForm.created_by}</p>
                        <p><strong>Data creării:</strong> {new Date(selectedForm.created_at).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {selectedForm.hr_review_status_display}</p>
                        <p><strong>Număr de participanți:</strong> {selectedForm.employee_feedbacks.length}</p>
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Numele angajatului</th>
                                    <th>Departamentul</th>
                                    <th>Scorul</th>
                                    <th>Data completării</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedForm.employee_feedbacks.map((feedback, index) => (
                                    <tr key={index}>
                                        <td>{feedback.employee_name}</td>
                                        <td>{feedback.department}</td>
                                        <td>{feedback.total_score}</td>
                                        <td>{new Date(feedback.date_completed).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button align="center" className="buton" onClick={closeDetailsModal}>Închide</button>
                    </div>
                ) : (
                    <p>Nu există încă detalii.</p>
                )}
            </Modal>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Adaugă formular nou"
                className="modal-content"
            >
                <h2>Adaugă formular nou</h2>
                <form onSubmit={handleCreateForm}>
                    <label htmlFor="title">Titlu formular:</label>
                    <input
                        id="title"
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        required
                    />
                    <label htmlFor="description">Descriere:</label>
                    <textarea
                        id="description"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                    />
                    <label htmlFor="hrReviewStatus">Status revizuire HR:</label>
                    <select
                        id="hrReviewStatus"
                        value={hrReviewStatus}
                        onChange={(e) => setHrReviewStatus(e.target.value)}
                        required
                    >
                        <option value="pending">În așteptare</option>
                        <option value="reviewed">Revizuit</option>
                        <option value="action_required">Acțiune necesară</option>
                    </select>
                    <div className="modal-footer">
                        <button type="submit">Creează Formular</button>
                        <button type="buton" onClick={closeModal}>Anulează</button>
                    </div>
                </form>
            </Modal>
            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={closeEditModal}
                contentLabel="Editează Formular"
                className="modal-content"
            >
                <h2>Editează Formular</h2>
                <form onSubmit={handleEditFeedback}>
                    <label htmlFor="editFormTitle">Titlu Formular:</label>
                    <input
                        id="editFormTitle"
                        type="text"
                        value={editFormTitle}
                        onChange={(e) => setEditFormTitle(e.target.value)}
                        required
                    />
                    <label htmlFor="editFormDescription">Descriere:</label>
                    <textarea
                        id="editFormDescription"
                        value={editFormDescription}
                        onChange={(e) => setEditFormDescription(e.target.value)}
                    />
                    <label htmlFor="editHrReviewStatus">Status Revizuire HR:</label>
                    <select
                        id="editHrReviewStatus"
                        value={editHrReviewStatus}
                        onChange={(e) => setEditHrReviewStatus(e.target.value)}
                        required
                    >
                        <option value="pending">În așteptare</option>
                        <option value="reviewed">Revizuit</option>
                        <option value="action_required">Acțiune necesară</option>
                    </select>
                    <div className="modal-footer">
                        <button type="submit">Salvează Modificările</button>
                        <button type="button" onClick={closeEditModal}>Anulează</button>
                    </div>
                </form>
            </Modal>
            <div className="card-curs">
                <h2>Rapoarte feedback</h2>
                <Bar data={feedbackData} />
            </div>
        </div>

    );
};

export default FeedbackForm;
