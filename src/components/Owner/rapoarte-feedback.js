import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';

const RapoarteFeedback = () => {
    const [feedbackForms, setFeedbackForms] = useState([]);
    const [employeeFeedbacks, setEmployeeFeedbacks] = useState([]);
    const [currentFormPage, setCurrentFormPage] = useState(1);
    const [currentFeedbackPage, setCurrentFeedbackPage] = useState(1);
    const [totalFormPages, setTotalFormPages] = useState(1);
    const [totalFeedbackPages, setTotalFeedbackPages] = useState(1);
    const [isLoadingForms, setIsLoadingForms] = useState(true);
    const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);
    const [errorForms, setErrorForms] = useState(null);
    const [errorFeedbacks, setErrorFeedbacks] = useState(null);

    useEffect(() => {
        const fetchFeedbackForms = async (page) => {
            try {
                const response = await axios.get('/feedback-forms/', { params: { page } });
                console.log("Feedback Forms Data:", response.data);
                setFeedbackForms(response.data.results || []);
                setTotalFormPages(response.data.total_pages || 1);
                setIsLoadingForms(false);
            } catch (error) {
                console.error("Error fetching feedback forms:", error);
                setErrorForms("Failed to fetch data. Please try again.");
                setIsLoadingForms(false);
            }
        };

        fetchFeedbackForms(currentFormPage);
    }, [currentFormPage]);


    useEffect(() => {
        const fetchEmployeeFeedbacks = async () => {
            try {
                const response = await axios.get('/employee-feedbacks/', { params: { page: currentFeedbackPage } });
                setEmployeeFeedbacks(response.data.results || []);
                setTotalFeedbackPages(response.data.total_pages);
                setIsLoadingFeedbacks(false);
                console.log("Employee data:", response.data);
            } catch (error) {
                setErrorFeedbacks("Failed to fetch data. Please try again.");
                setIsLoadingFeedbacks(false);
            }
        };

        fetchEmployeeFeedbacks();
    }, [currentFeedbackPage]);

    const handleFormPageChange = ({ selected }) => setCurrentFormPage(selected + 1);
    const handleFeedbackPageChange = ({ selected }) => setCurrentFeedbackPage(selected + 1);

    return (
        <div className="container-dashboard">
            <h1>Rapoarte Feedback</h1>
            <div className="card-curs">
                <h2>Formulare Feedback</h2>
                {isLoadingForms ? <p>Se încarcă...</p> : errorForms ? <p>Error: {errorForms}</p> : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Titlu</th>
                                    <th>Descriere</th>
                                    <th>Status</th>
                                    <th>Data Creării</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbackForms.length > 0 ? (
                                    feedbackForms.map(form => (
                                        <tr key={form.id}>
                                            <td>{form.title}</td>
                                            <td>{form.description}</td>
                                            <td>{form.get_hr_review_status_display}</td>
                                            <td>{new Date(form.created_at).toISOString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">Nu există formulare de feedback.</td>
                                    </tr>
                                )}


                            </tbody>

                        </table>
                        <ReactPaginate
                            previousLabel={'Anterior'}
                            nextLabel={'Următorul'}
                            breakLabel={'...'}
                            pageCount={totalFormPages || 1}
                            onPageChange={handleFormPageChange}
                            containerClassName={'pagination'}
                            activeClassName={'active'}
                            forcePage={currentFormPage - 1}
                        />

                    </>
                )}
            </div>

            <div className="card-curs">
                <h2>Feedback Angajați</h2>
                {isLoadingFeedbacks ? <p>Loading...</p> : errorFeedbacks ? <p>Error: {errorFeedbacks}</p> : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nume Angajat</th>
                                    <th>Departament</th>
                                    <th>Formular</th>
                                    <th>Data Completării</th>
                                    <th>Comentarii</th>
                                    <th>Scor Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeeFeedbacks.map(feedback => (
                                    <tr key={feedback.id}>
                                        <td>{feedback.employee_name}</td>
                                        <td>{feedback.employee_department}</td>
                                        <td>{feedback.form.title}</td>
                                        <td>{new Date(feedback.date_completed).toLocaleDateString()}</td>
                                        <td>{feedback.additional_comments}</td>
                                        <td>{feedback.total_score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <ReactPaginate
                            previousLabel={'Anterior'}
                            nextLabel={'Următorul'}
                            breakLabel={'...'}
                            pageCount={totalFormPages || 1}
                            onPageChange={handleFormPageChange}
                            containerClassName={'pagination'}
                            activeClassName={'active'}
                            forcePage={currentFormPage - 1}
                        />

                    </>
                )}
            </div>
        </div>
    );
};

export default RapoarteFeedback;
