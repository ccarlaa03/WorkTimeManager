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


    // Functia pentru a prelua detaliile companiei
    useEffect(() => {
        async function fetchCompanyDetails() {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
                setIsLoading(false);
                return;
            }

            try {
                const hrResponse = await instance.get('/hr-dashboard/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });

                if (hrResponse.data && hrResponse.data.company_id) {
                    setHrCompany(hrResponse.data.company_id);
                    await fetchEmployees(accessToken, hrResponse.data.company_id);
                    await fetchFormDetails(accessToken, form_id);
                } else {
                    console.log('Datele companiei HR:', hrResponse.data);
                }
            } catch (error) {
                console.error('Eroare la preluarea detaliilor companiei:', error.response ? error.response.data : error);
            }
        }

        // Functia pentru a prelua angajații companiei
        async function fetchEmployees(accessToken, hrCompanyId) {
            if (!accessToken) {
                console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
                return;
            }

            if (!hrCompanyId) {
                console.error("Nu s-a găsit ID-ul companiei HR.");
                return;
            }

            const url = `http://localhost:8000/gestionare-ang/${hrCompanyId}/`;
            console.log(`Preluarea angajaților de la: ${url}`);

            try {
                const employeeResponse = await instance.get(url, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (employeeResponse.data) {
                    console.log('Toți angajații:', employeeResponse.data);
                    setEmployees(employeeResponse.data);
                } else {
                    console.error('Datele angajaților lipsesc sau nu sunt în formatul așteptat:', employeeResponse.data);
                    setEmployees([]);
                }
            } catch (error) {
                console.error('Eroare la preluarea angajaților:', error.response ? error.response.data : error);
            }
        }

        // Functia pentru a prelua detaliile formularului
        async function fetchFormDetails(accessToken, formId) {
            try {
                const response = await instance.get(`/feedback-details/${formId}/`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                console.log(response.data);
                setFormDetails(response.data);
            } catch (error) {
                console.error('Eroare la preluarea detaliilor formularului:', error);
            }
        }

        setIsLoading(true);
        fetchCompanyDetails().finally(() => setIsLoading(false));
    }, [form_id]);

    // Functia pentru a adăuga o întrebare nouă
    const handleAddQuestion = async (e) => {
        e.preventDefault();

        const newQuestionData = {
            text: newQuestion.text.trim(),
            order: formDetails.questions.length + 1,
            response_type: newQuestion.responseType,
            rating_scale: newQuestion.responseType === 'rating' ? parseInt(newQuestion.ratingScale, 10) : null,
            importance: newQuestion.importance,
        };

        // Adăugarea opțiunilor dacă este o întrebare de tip multiple-choice
        if (newQuestion.responseType === 'multiple_choice') {
            newQuestionData.options = newQuestion.options.map(option => ({
                text: option.text.trim(),
                score: parseInt(option.score, 10)
            }));
        }

        console.log('Datele trimise la backend:', newQuestionData);

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
            console.error('Eroare la adăugarea unei noi întrebări:', error.response ? error.response.data : error);
        }
    };

    // Functia pentru a edita o întrebare existentă
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
                console.error('Statusul răspunsului este neașteptat:', response.status);
            }
        } catch (error) {
            console.error('Eroare la actualizarea întrebării:', error.response ? error.response.data : error);
        }
    };

    // Functia pentru a șterge o întrebare
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
            console.error('Eroare la ștergerea întrebării:', error);
        }
    };

    // Functia pentru a încărca datele unei întrebări pentru editare
    const loadQuestionForEditing = (questionData) => {
        setCurrentQuestion({
            ...questionData,
            options: questionData.options || []
        });
    };

    // Functia pentru a gestiona schimbarea tipului de răspuns al unei întrebări noi
    const handleNewQuestionResponseTypeChange = (e) => {
        const selectedResponseType = e.target.value;
        setNewQuestion((prevQuestion) => ({
            ...prevQuestion,
            responseType: selectedResponseType,
            ratingScale: selectedResponseType === 'rating' ? 1 : null,  // Set default rating scale
        }));
    };

    // Functia pentru a gestiona schimbarea textului unei opțiuni noi
    const handleNewOptionTextChange = (index, newText) => {
        setNewQuestion(prevQuestion => {
            const newOptions = [...prevQuestion.options];
            newOptions[index].text = newText;
            return { ...prevQuestion, options: newOptions };
        });
    };

    // Functia pentru a gestiona schimbarea scalei de evaluare
    const handleRatingScaleChange = (e) => {
        const newScale = parseInt(e.target.value, 10);
        if (newScale > 0) {
            setNewQuestion(prevQuestion => ({
                ...prevQuestion,
                ratingScale: newScale
            }));
        }
    };

    // Functia pentru a gestiona schimbarea scorului unei opțiuni noi
    const handleNewOptionScoreChange = (index, newScore) => {
        setNewQuestion(prevQuestion => {
            const newOptions = [...prevQuestion.options];
            newOptions[index].score = parseInt(newScore, 10) || 0;
            return { ...prevQuestion, options: newOptions };
        });
    };

    // Functia pentru a adăuga o opțiune nouă
    const handleAddNewOption = () => {
        setNewQuestion(prevQuestion => ({
            ...prevQuestion,
            options: [...prevQuestion.options, { text: '', score: 0 }],
        }));
    };
    // Functia pentru a gestiona schimbarea textului unei opțiuni existente
    const handleOptionTextChange = (index, newText) => {
        setNewQuestion(prevNewQuestion => {
            const updatedOptions = prevNewQuestion.options.map((option, idx) =>
                idx === index ? { ...option, text: newText } : option
            );
            return { ...prevNewQuestion, options: updatedOptions };
        });
    };

    // Functia pentru a gestiona schimbarea scorului unei opțiuni existente
    const handleOptionScoreChange = (index, newScore) => {
        setNewQuestion(prevNewQuestion => {
            const updatedOptions = prevNewQuestion.options.map((option, idx) =>
                idx === index ? { ...option, score: Number(newScore) } : option
            );
            return { ...prevNewQuestion, options: updatedOptions };
        });
    };

    // Functia pentru a deschide modalul de adăugare
    const openAddModal = () => {
        setIsAddModalOpen(true);
    };

    // Functia pentru a închide modalul de adăugare
    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    // Functia pentru a deschide modalul de editare cu datele întrebării selectate
    const openEditModal = (question) => {
        loadQuestionForEditing(question);
        setIsEditModalOpen(true);
    };

    // Functia pentru a închide modalul de editare
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
