import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import FeedbackCompletionChart from './chart-feedback';

const RapoarteFeedback = () => {
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
    const expectedCompanyId = localStorage.getItem('company_id');

   // Functia pentru a prelua feedback-ul angajaților
    const fetchEmployeeFeedbacks = async (page = 1) => {
        if (!accessToken) {
            console.error("Nu s-a găsit niciun token de acces. Utilizatorul trebuie să fie autentificat pentru a accesa această pagină.");
            setErrorFeedbacks("Nu s-a găsit niciun token de acces. Vă rugăm să vă autentificați.");
            setIsLoadingFeedbacks(false);
            return;
        }

        // Verifică dacă ID-ul companiei este cel așteptat
        if (localStorage.getItem('company_id') !== expectedCompanyId) {
            console.error("Acces neautorizat la datele companiei.");
            setErrorFeedbacks("Nu aveți permisiunea de a accesa aceste date.");
            setIsLoadingFeedbacks(false);
            return;
        }

        try {
            const response = await axios.get('/employee-feedbacks/', {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                params: { page }
            });
            console.log('Datele răspunsului:', response.data);

            if (response.data && Array.isArray(response.data.results)) {
                setEmployeeFeedbacks(response.data.results);
                setTotalFeedbackPages(response.data.total_pages || 1);
            } else {
                console.warn('Nu s-au primit date sau rezultatele sunt goale.');
                setEmployeeFeedbacks([]);
                setTotalFeedbackPages(1);
            }
        } catch (error) {
            console.error("Eroare la preluarea feedback-urilor angajaților:", error);
            setErrorFeedbacks("Preluarea datelor a eșuat. Vă rugăm să încercați din nou.");
        } finally {
            setIsLoadingFeedbacks(false);
        }
    };
    // Efectul pentru a prelua feedback-ul angajaților la schimbarea paginii sau tokenului de acces
    useEffect(() => {
        fetchEmployeeFeedbacks(currentFeedbackPage);
    }, [currentFeedbackPage, accessToken]);

    // Functia pentru a schimba pagina curentă a formularelor
    const handleFormPageChange = ({ selected }) => setCurrentFormPage(selected + 1);

    // Functia pentru a schimba pagina curentă a feedback-urilor
    const handleFeedbackPageChange = ({ selected }) => setCurrentFeedbackPage(selected + 1);

    return (
        <div className="container-dashboard" >
            <div className="card-curs">
                <h2>Feedback angajați</h2>
                {isLoadingFeedbacks ? <p>Se încarcă...</p> : errorFeedbacks ? <p>Eroare: {errorFeedbacks}</p> : (
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
                                        <td>{feedback.department}</td>
                                        <td>{feedback.form.title}</td>
                                        <td>{new Date(feedback.date_completed).toLocaleDateString()}</td>
                                        <td>{feedback.additional_comments || "Nu există comentarii"}</td>
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
