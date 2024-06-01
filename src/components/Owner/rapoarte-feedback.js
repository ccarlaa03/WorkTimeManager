import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import FeedbackCompletionChart from './chart-feedback';

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

    const accessToken = localStorage.getItem('access_token');

    const fetchEmployeeFeedbacks = async (page = 1) => {
        if (!accessToken) {
            console.error("No access token found. User must be logged in to access this page.");
            setErrorFeedbacks("No access token found. Please log in.");
            setIsLoadingFeedbacks(false);
            return;
        }
        try {
            const response = await axios.get('/employee-feedbacks/', {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                params: { page }
            });
            console.log('Response data:', response.data);
            console.log('Form Data:', response.data.results);

            if (response.data && Array.isArray(response.data.results)) {
                setEmployeeFeedbacks(response.data.results);
                setTotalFeedbackPages(response.data.total_pages || 1);
            } else {
                console.warn('No data received or empty results.');
                setEmployeeFeedbacks([]);
                setTotalFeedbackPages(1);
            }
            console.log("Employee data:", response.data);
        } catch (error) {
            console.error("Error fetching employee feedbacks:", error);
            setErrorFeedbacks("Failed to fetch data. Please try again.");
        } finally {
            setIsLoadingFeedbacks(false);
        }
    };

    useEffect(() => {
        fetchEmployeeFeedbacks(currentFeedbackPage);
    }, [currentFeedbackPage, accessToken]);

    const handleFormPageChange = ({ selected }) => setCurrentFormPage(selected + 1);
    const handleFeedbackPageChange = ({ selected }) => setCurrentFeedbackPage(selected + 1);

    return (
        <div className="container-dashboard" >

            <div className="card-curs">
                <h2>Feedback angajați</h2>
                {isLoadingFeedbacks ? <p>Se încarcă...</p> : errorFeedbacks ? <p>Error: {errorFeedbacks}</p> : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Numele angajatului</th>
                                    <th>Departament</th>
                                    <th>Formular</th>
                                    <th>Data completării</th>
                                    <th>Comentarii</th>
                                    <th>Scor total</th>
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
                            pageCount={totalFeedbackPages || 1}
                            onPageChange={handleFeedbackPageChange}
                            containerClassName={'pagination'}
                            activeClassName={'active'}
                            forcePage={currentFeedbackPage - 1}
                        />
                    </>
                )}
            </div>

            <div className="card-curs">
                <FeedbackCompletionChart />
            </div>
        </div>
    );
};

export default RapoarteFeedback;
