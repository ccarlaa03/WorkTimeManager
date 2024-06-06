import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import instance from '../../axiosConfig';
import ReactPaginate from 'react-paginate';

const GestionareFeedback = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hrCompanyId, setHrCompany] = useState(null);
  const [feedbackForms, setFeedbackForms] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const feedbackFormsPerPage = 4;
  const [totalPages, setTotalPages] = useState(0);

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
          fetchPaginatedFeedbackForms(hrCompanyId, currentPage);
        } else {
          console.log('HR Company data:', hrResponse.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching HR company data:', error);
        setIsLoading(false);
      }
    };

    fetchFeedbackForms();
  }, [currentPage]);

  const fetchPaginatedFeedbackForms = async (companyId, page) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error("No access token found. User is not logged in.");
      return;
    }

    const params = new URLSearchParams({
      page: page + 1,
      page_size: feedbackFormsPerPage
    });

    try {
      const feedbackResponse = await axios.get(`http://localhost:8000/gestionare-feedback/${companyId}/?${params}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (feedbackResponse.data) {
        setFeedbackForms(feedbackResponse.data.results);
        setTotalPages(Math.ceil(feedbackResponse.data.count / feedbackFormsPerPage));
        console.log('Feedback Forms:', feedbackResponse.data);
      } else {
        setFeedbackForms([]);
        console.error('No feedback forms found or data not in expected format:', feedbackResponse.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching feedback data:', error.response ? error.response.data : error);
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return <div>Se încarcă...</div>;
  }

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="container-dashboard">
      <h1>Gestionare feedback angajați</h1>
      <div className="card-curs">
        <table className="tabel column">
          <thead>
            <tr>
              <th>Titlu</th>
              <th>Creat de</th>
              <th>Creat la ora</th>
              <th>Status</th>
              <th>Angajat</th>
              <th>Data completată</th>
              <th>Scorul</th>
            </tr>
          </thead>
          <tbody>
            {feedbackForms.map((form, formIndex) => {
              if (form.employee_feedbacks && form.employee_feedbacks.length > 0) {
                return form.employee_feedbacks.map((feedback, feedbackIndex) => (
                  <tr key={`${formIndex}-${feedbackIndex}`}>
                    <td>{form.title}</td>
                    <td>{form.created_by}</td>
                    <td>{new Date(form.created_at).toLocaleDateString()}</td>
                    <td>{form.hr_review_status_display}</td>
                    <td>{feedback.employee_name}</td>
                    <td>{new Date(feedback.date_completed).toLocaleDateString()}</td>
                    <td>{feedback.total_score}</td>
                  </tr>
                ));
              } else {
                return (
                  <tr key={`form-${formIndex}`}>
                    <td>{form.title}</td>
                    <td>{form.created_by}</td>
                    <td>{new Date(form.created_at).toLocaleDateString()}</td>
                    <td>{form.hr_review_status_display}</td>
                    <td colSpan="3">Niciun angajt nu a completat formularul.</td>
                  </tr>
                );
              }
            })}
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
          forcePage={currentPage}
        />
      </div>
      <div className="button-container">
        <Link to="/formulare-feedback">
          <button className="buton">Formulare Feedback</button>
        </Link>
      </div>
    </div>
  );
}

export default GestionareFeedback;
