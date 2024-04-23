import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import instance from '../../axiosConfig';
import Modal from 'react-modal';

const FeedbackDetails = () => {
    const [formDetails, setFormDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { form_id } = useParams();
    const [hrCompanyId, setHrCompany] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newQuestionOrder, setNewQuestionOrder] = useState('');
    const [newQuestionResponseType, setNewQuestionResponseType] = useState('text');
    const [newQuestionRatingScale, setNewQuestionRatingScale] = useState('');


    useEffect(() => {
        async function fetchCompanyDetails() {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("No access token found. User is not logged in.");
                setIsLoading(false);
                return;
            }

            try {
                const hrResponse = await instance.get('/hr-dashboard/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });

                if (hrResponse.data && hrResponse.data.company_id) {
                    setHrCompany(hrResponse.data.company_id);
                    await fetchEmployees(accessToken);
                    await fetchFormDetails(accessToken, form_id);
                } else {
                    console.log('HR Company data:', hrResponse.data);
                }
            } catch (error) {
                console.error('Error fetching company details:', error.response ? error.response.data : error);
            }
        }

        async function fetchEmployees(accessToken) {
            const employeeResponse = await instance.get('/gestionare-ang/', {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            console.log('All Employees:', employeeResponse.data);
            setEmployees(employeeResponse.data);
        }

        async function fetchFormDetails(accessToken, formId) {
            try {
                const response = await instance.get(`/feedback-details/${formId}/`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                console.log(response.data);
                setFormDetails(response.data);

            } catch (error) {
                console.error('Error fetching form details:', error);
            }
        }

        setIsLoading(true);
        fetchCompanyDetails().finally(() => setIsLoading(false));
    }, [form_id]);


    // CREATE
    const handleAddQuestion = async (e) => {
        e.preventDefault();
        const newQuestionData = {
            text: newQuestionText,
            order: formDetails.questions.length + 1,
            response_type: newQuestionResponseType,
            rating_scale: newQuestionResponseType === 'rating' ? parseInt(newQuestionRatingScale) : null,
        };

        try {
            const response = await instance.post(`/feedback/add-question/${form_id}/`, newQuestionData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            setFormDetails(prevFormDetails => ({
                ...prevFormDetails,
                questions: [...prevFormDetails.questions, response.data],
            }));

            setIsAddModalOpen(false);
            setNewQuestionText('');
        } catch (error) {
            console.error('Error adding a new question:', error);
        }
    };

    // UPDATE
    const handleEditQuestion = async (e) => {
        e.preventDefault();

        const accessToken = localStorage.getItem('access_token'); // Sau orice metodă folosiți pentru a obține token-ul

        const updatedQuestionData = {
            text: currentQuestion.text,
            order: currentQuestion.order,
            response_type: currentQuestion.response_type,
            rating_scale: currentQuestion.rating_scale, // asigurați-vă că acesta este un număr dacă `response_type` este 'rating'
            form: form_id, // ID-ul formularului la care aparține întrebarea
        };

        try {
            const response = await instance.put(`/feedback/update-question/${currentQuestion.id}/`, updatedQuestionData, {
                headers: { 'Authorization': `Bearer ${accessToken}` }, // Asigurați-vă că înlocuiți acest lucru cu token-ul dvs. de acces real
            });
            if (response.status === 200) {
                // Acum, actualizați starea locală
                const updatedQuestions = formDetails.questions.map(q =>
                    q.id === currentQuestion.id ? { ...q, ...response.data } : q
                );
                setFormDetails({ ...formDetails, questions: updatedQuestions });

                setIsEditModalOpen(false); // Închideți modalul de editare
            } else {
                console.error('Unexpected response status:', response.status);
            }
        } catch (error) {
            console.error('Error updating the question:', error.response ? error.response.data : error);
        }
    };



    // DELETE
    const handleDeleteQuestion = async (questionId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await instance.delete(`/feedback/delete-question/${questionId}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            setFormDetails(prevFormDetails => ({
                ...prevFormDetails,
                questions: prevFormDetails.questions.filter(q => q.id !== questionId),
            }));
        } catch (error) {
            console.error('Error deleting the question:', error);
        }
    };

    const openAddModal = () => {
        setIsAddModalOpen(true);
    };
    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    const openEditModal = (question) => {
        setCurrentQuestion(question);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setCurrentQuestion({});
    };

    if (isLoading) {
        return <div>Se încarcă...</div>;
    }

    return (
        <div className="container-dashboard">
            <div className="content-container">
                {formDetails ? (
                    <>
                        <div className="form-details-header">
                            <h2>{formDetails.title}</h2>
                            <p><i>{formDetails.description}</i></p>
                        </div>
                        <div className="card-curs">
                            {formDetails.questions && formDetails.questions.map((question, index) => (
                                <div key={question.id} className="question-block">
                                    <div className="question-title">Întrebarea {index + 1}: {question.text}</div>
                                    <div className="options">Tip de răspuns: {question.response_type}</div>
                                    {question.response_type === 'rating' && (
                                        <div className="rating-scale">Scor posibil: 1 - {question.rating_scale || 5}</div>
                                    )}
                                    <div className="options">
                                        {question.options && question.options.map(option => (
                                            <div key={option.id} className="option">
                                                {option.text} (Scor: {option.score || 'N/A'})
                                            </div>
                                        ))}
                                    </div>
                                    <div className="question-actions">
                                        <button className="buton" onClick={() => openEditModal(question)}>Editează</button>
                                        <button className="buton" onClick={() => handleDeleteQuestion(question.id)}>Șterge</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <button className="buton" onClick={openAddModal}>Adaugă întrebări</button>
                        </div>
                    </>
                ) : (
                    <p>Nu sunt disponibile detalii pentru acest formular de feedback.</p>
                )}
            </div>

            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={closeEditModal}
                contentLabel="Edit Question"
                className="modal-content"
            >
                <h2>Editare</h2>
                <form onSubmit={handleEditQuestion}>
                    <label htmlFor="questionTitle">întrebare:</label>
                    <input
                        id="questionTitle"
                        type="text"
                        value={currentQuestion.text || ''}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                    />
                    <label htmlFor="questionResponseType">Tip de răspuns:</label>
                    <select
                        id="questionResponseType"
                        value={currentQuestion.response_type || 'text'}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, response_type: e.target.value })}
                    >
                        <option value="text">Text</option>
                        <option value="rating">Rating</option>
                        <option value="multiple_choice">Multiple Choice</option>
                    </select>
                    {currentQuestion.response_type === 'rating' && (
                        <div>
                            <label htmlFor="questionRatingScale">Scara de rating:</label>
                            <input
                                id="questionRatingScale"
                                type="number"
                                value={currentQuestion.rating_scale || ''}
                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, rating_scale: e.target.value })}
                            />
                        </div>
                    )}
                    <button type="submit">Salvează</button>
                    <button type="button" onClick={closeEditModal}>Anulează</button>
                </form>
            </Modal>

            <Modal
                isOpen={isAddModalOpen}
                onRequestClose={closeAddModal}
                contentLabel="Add Question"
                className="modal-content"
            >
                <h2>Adaugă</h2>
                <form onSubmit={handleAddQuestion}>
                    <label htmlFor="newQuestionText">Întrebare:</label>
                    <input
                        id="newQuestionText"
                        type="text"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                    />
                    <label htmlFor="newQuestionOrder">Ordinea întrebării:</label>
                    <input
                        id="newQuestionOrder"
                        type="number"
                        value={newQuestionOrder}
                        onChange={(e) => setNewQuestionOrder(e.target.value)}
                    />
                    <label htmlFor="newQuestionResponseType">Tip de răspuns:</label>
                    <select
                        id="newQuestionResponseType"
                        value={newQuestionResponseType}
                        onChange={(e) => setNewQuestionResponseType(e.target.value)}
                    >
                        <option value="text">Text</option>
                        <option value="rating">Rating</option>
                        <option value="multiple_choice">Multiple Choice</option>
                    </select>
                    <label htmlFor="newQuestionRatingScale">Scara de rating:</label>
                    <input
                        id="newQuestionRatingScale"
                        type="number"
                        value={newQuestionRatingScale}
                        onChange={(e) => setNewQuestionRatingScale(e.target.value)}
                    />
                    <button type="submit">Adaugă</button>
                    <button onClick={closeAddModal}>Anulează</button>
                </form>
            </Modal>

        </div>
    );



};

export default FeedbackDetails;
