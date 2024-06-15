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
    const [options, setOptions] = useState([]);
    const [importance, setImportance] = useState(1);

    const [newQuestion, setNewQuestion] = useState({
        text: '',
        importance: 1,
        order: 0,
        responseType: '',
        options: [],
    });


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

        async function fetchEmployees(accessToken, hrCompanyId) {
            if (!accessToken) {
                console.error("No access token found. User is not logged in.");
                return;
            }
        
            if (!hrCompanyId) {
                console.error("No HR Company ID found.");
                return;
            }
        
            const url = `http://localhost:8000/gestionare-ang/${hrCompanyId}/`;
            console.log(`Fetching employees from: ${url}`);
        
            try {
                const employeeResponse = await instance.get(url, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
        
                if (employeeResponse.data) {
                    console.log('All Employees:', employeeResponse.data);
                    setEmployees(employeeResponse.data);  
                } else {
                    console.error('No employee data or data not in expected format:', employeeResponse.data);
                    setEmployees([]);  
                }
            } catch (error) {
                console.error('Error fetching employees:', error.response ? error.response.data : error);
            }
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
            text: newQuestion.text.trim(),
            order: formDetails.questions.length + 1,
            response_type: newQuestion.responseType,
            rating_scale: newQuestion.responseType === 'rating' ? parseInt(newQuestion.ratingScale, 10) : null,
            importance: newQuestion.importance,
        };

        // Add options if it's a multiple-choice question
        if (newQuestion.responseType === 'multiple_choice') {
            newQuestionData.options = newQuestion.options.map(option => ({
                text: option.text.trim(),
                score: parseInt(option.score, 10)
            }));
        }

        console.log('Data sent to backend:', newQuestionData);

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
            console.error('Error adding a new question:', error.response ? error.response.data : error);
        }
    };



    // UPDATE
    const handleEditQuestion = async (e) => {
        e.preventDefault();

        const accessToken = localStorage.getItem('access_token');

        const updatedQuestionData = {
            text: currentQuestion.text,
            order: currentQuestion.order,
            response_type: currentQuestion.response_type,
            rating_scale: currentQuestion.rating_scale,
            form: form_id,
            options: options,
            importance: importance,
        };

        try {
            const response = await instance.put(`/feedback/update-question/${currentQuestion.id}/`, updatedQuestionData, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (response.status === 200) {
                const updatedQuestions = formDetails.questions.map(q =>
                    q.id === currentQuestion.id ? { ...q, ...response.data } : q
                );
                setFormDetails({ ...formDetails, questions: updatedQuestions });

                setIsEditModalOpen(false);
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

    const loadQuestionForEditing = (questionData) => {
        setCurrentQuestion({
            ...questionData,
            options: questionData.options || []
        });
    };

    const handleNewQuestionResponseTypeChange = (e) => {
        const selectedResponseType = e.target.value;
        setNewQuestion((prevQuestion) => ({
            ...prevQuestion,
            responseType: selectedResponseType,
            ratingScale: selectedResponseType === 'rating' ? 1 : null,  // Set default rating scale
        }));
    };

    const handleNewOptionTextChange = (index, newText) => {
        setNewQuestion(prevQuestion => {
            const newOptions = [...prevQuestion.options];
            newOptions[index].text = newText;
            return { ...prevQuestion, options: newOptions };
        });
    };
    const handleRatingScaleChange = (e) => {
        const newScale = parseInt(e.target.value, 10);
        if (newScale > 0) {
            setNewQuestion(prevQuestion => ({
                ...prevQuestion,
                ratingScale: newScale
            }));
        }
    };
    const handleNewOptionScoreChange = (index, newScore) => {
        setNewQuestion(prevQuestion => {
            const newOptions = [...prevQuestion.options];
            newOptions[index].score = parseInt(newScore, 10) || 0;
            return { ...prevQuestion, options: newOptions };
        });
    };

    const handleAddNewOption = () => {
        setNewQuestion(prevQuestion => ({
            ...prevQuestion,
            options: [...prevQuestion.options, { text: '', score: 0 }],
        }));
    };

    const handleOptionTextChange = (index, newText) => {
        setNewQuestion(prevNewQuestion => {
            const updatedOptions = prevNewQuestion.options.map((option, idx) =>
                idx === index ? { ...option, text: newText } : option
            );
            return { ...prevNewQuestion, options: updatedOptions };
        });
    };

    const handleOptionScoreChange = (index, newScore) => {
        setNewQuestion(prevNewQuestion => {
            const updatedOptions = prevNewQuestion.options.map((option, idx) =>
                idx === index ? { ...option, score: Number(newScore) } : option
            );
            return { ...prevNewQuestion, options: updatedOptions };
        });
    };


    const openAddModal = () => {
        setIsAddModalOpen(true);
    };
    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    const openEditModal = (question) => {
        loadQuestionForEditing(question);
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
                    <label htmlFor="questionImportance">Importanța întrebării:</label>
                    <input
                        id="questionImportance"
                        type="number"
                        value={currentQuestion.importance}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, importance: parseInt(e.target.value) })}
                    />
                    {currentQuestion.response_type === 'multiple_choice' && currentQuestion.options && currentQuestion.options.length > 0 && (
                        <div>
                            <h3>Opțiuni de Răspuns</h3>
                            {currentQuestion.options.map((option, index) => (
                                <div key={index}>
                                    <label htmlFor={`optionText-${index}`}>Text Opțiune:</label>
                                    <input
                                        id={`optionText-${index}`}
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                                    />
                                    <label htmlFor={`optionScore-${index}`}>Scor Opțiune:</label>
                                    <input
                                        id={`optionScore-${index}`}
                                        type="number"
                                        value={option.score}
                                        onChange={(e) => handleOptionScoreChange(index, e.target.value)}
                                    />
                                </div>
                            ))}

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
                        value={newQuestion.text}
                        onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                    />
                    <label htmlFor="newQuestionImportance">Importanța întrebării:</label>
                    <input
                        id="newQuestionImportance"
                        type="number"
                        value={newQuestion.importance}
                        onChange={(e) => setNewQuestion({ ...newQuestion, importance: parseInt(e.target.value) })}
                    />

                    <label htmlFor="newQuestionResponseType">Tip de răspuns:</label>
                    <select
                        id="newQuestionResponseType"
                        value={newQuestion.responseType}
                        onChange={handleNewQuestionResponseTypeChange}
                    >
                        <option value="text">Text</option>
                        <option value="rating">Rating</option>
                        <option value="multiple_choice">Multiple Choice</option>
                    </select>

                    {newQuestion.responseType === 'multiple_choice' && (
                        <div>
                            {newQuestion.options.map((option, index) => (
                                <div key={index}>
                                    <label htmlFor={`newOptionText-${index}`}>Opțiune {String.fromCharCode(65 + index)}:</label>
                                    <input
                                        id={`newOptionText-${index}`}
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleNewOptionTextChange(index, e.target.value)}
                                    />
                                    <label htmlFor={`newOptionScore-${index}`}>Scor:</label>
                                    <input
                                        id={`newOptionScore-${index}`}
                                        type="number"
                                        value={option.score}
                                        onChange={(e) => handleNewOptionScoreChange(index, e.target.value)}
                                    />
                                </div>
                            ))}
                            <button type="button" onClick={handleAddNewOption}>Adaugă Opțiune</button>
                        </div>
                    )}

                    {newQuestion.responseType === 'rating' && (
                        <div>
                            <label htmlFor="newQuestionRatingScale">Scara de rating:</label>
                            <input
                                id="newQuestionRatingScale"
                                type="number"
                                value={newQuestion.ratingScale || 1}
                                min="1"
                                onChange={handleRatingScaleChange}
                            />
                        </div>
                    )}


                    <button type="submit">Adaugă</button>
                    <button onClick={closeAddModal}>Anulează</button>
                </form>
            </Modal>

        </div >
    );

};

export default FeedbackDetails;
