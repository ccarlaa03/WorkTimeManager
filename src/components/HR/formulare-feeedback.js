import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import instance from '../../axiosConfig';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { useParams } from 'react-router-dom';

const FeedbackForm = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
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

    useEffect(() => {
        const fetchFeedbackForms = async () => {
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



                    const feedbackResponse = await axios.get(`/formulare-feedback/?company_id=${hrCompanyId}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    });
                    console.log('Feedback Forms:', feedbackResponse.data);
                    setFeedbackForms(feedbackResponse.data);

                    setIsLoading(false);

                } else {
                    console.log('HR Company data:', hrResponse.data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching feedback data:', error.response ? error.response.data : error);
                setIsLoading(false);
            }
        };

        fetchFeedbackForms();
    }, []);

    const handleCreateForm = async (form_id) => {

        const newFormData = {
            title: formTitle.trim(),
            description: formDescription.trim(),
            created_by: user_id,
            hr_review_status: hrReviewStatus,
        };

        console.log('Data sent to backend for new form:', newFormData);

        try {
            const response = await axios.post('http://localhost:8000/feedback/add-form/', newFormData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            setFeedbackForms(prevForms => [...prevForms, response.data]);
            alert('Formularul a fost creat cu succes!');
            setFormTitle('');
            setFormDescription('');
            setHrReviewStatus('pending');
            closeModal();
        } catch (error) {
            console.error('Error creating new form:', error.response ? error.response.data : error);
            alert('A apărut o eroare la crearea formularului.');
        }
    };


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
                console.error('Error deleting feedback form:', error.response ? error.response.data : error);
                alert('A apărut o eroare la ștergerea formularului.');
            }
        }
    };


    const handleEditFeedback = async () => {
        if (!editFormId) {
            alert('ID-ul formularului nu este specificat.');
            return;
        }

        const formData = {
            title: editFormTitle.trim(),
            description: editFormDescription.trim(),
            hr_review_status: editHrReviewStatus,
            // You don't need to send 'created_by' or 'created_at' as they should not change on update
        };

        try {
            const response = await axios.put(`http://localhost:8000/feedback/update-form/${editFormId}/`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            // Update the feedbackForms state to reflect the changes
            setFeedbackForms(prevForms => prevForms.map(form => {
                if (form.id === editFormId) {
                    return { ...form, ...response.data };
                }
                return form;
            }));

            alert('Formularul a fost actualizat cu succes!');
            // Reset edit state and close modal if you have one
            setEditFormId(null);
            setEditFormTitle('');
            setEditFormDescription('');
            setEditHrReviewStatus('pending');
            closeModal(); // You should have a function to close your edit modal
        } catch (error) {
            console.error('Error updating feedback form:', error.response ? error.response.data : error);
            alert('A apărut o eroare la actualizarea formularului.');
        }
    };

    const openEditModal = (form) => {
        setEditFormId(form.id);
        setEditFormTitle(form.title);
        setEditFormDescription(form.description);
        setEditHrReviewStatus(form.hr_review_status);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditFormId(null);
        setEditFormTitle('');
        setEditFormDescription('');
        setEditHrReviewStatus('pending');
    };
    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormTitle("");
        setFormDescription("");
    };

    if (isLoading) {
        return <div>Se încarcă...</div>;
    }
    const truncateText = (text, length) => {
        if (text.length > length) {
            return text.substring(0, length) + '...';
        }
        return text;
    };
    return (
        <div>
            <div className="container-dashboard">
                <h1>Gestionare feedback angajați</h1>
                <table className="tabel column">
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
                                    <button onClick={() => openEditModal(form)}>Editează</button>
                                    <button onClick={() => handleDeleteFeedback(form.id)}>Șterge</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>


                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    contentLabel="Adaugă Formular Nou"
                    className="modal-content"
                >
                    <h2>Adaugă Formular Nou</h2>
                    <form onSubmit={handleCreateForm}>
                        <label htmlFor="title">Titlu Formular:</label>
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
                        <label htmlFor="hrReviewStatus">Status Revizuire HR:</label>
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

            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button className='buton' onClick={openModal}>Adaugă Formular Nou</button>
            </div>

        </div>
    );
};

export default FeedbackForm;
