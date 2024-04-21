import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import instance from '../../axiosConfig';


const FeedbackForm = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [hrCompanyId, setHrCompany] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [feedbackForms, setFeedbackForms] = useState([]);

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
                    const filteredEmployees = employees.filter(employee =>
                        employee.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    );


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


    if (isLoading) {
        return <div>Se încarcă...</div>;
    }

    return (
        <div>
            <div className="container-dashboard">
                <h1>Gestionare feedback angajați</h1>
                <table className="tabel column">

                    <thead>
                        <tr>
                            <th>Titlu</th>
                            <th>Creat de</th>
                            <th>Creat la ora</th>
                            <th> Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbackForms.map((form) => (
                            form.employee_feedbacks.map((feedback, index) => (
                                <tr key={feedback.id}>
                                    <td>{form.title}</td>
                                    <td>{form.created_by}</td>
                                    <td>{new Date(form.created_at).toLocaleDateString()}</td>
                                    <td>{form.hr_review_status_display}</td>

                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>



            </div>
        </div>
    );
};

export default FeedbackForm;
