import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const FeedbackForm = () => {
  const [feedbackForms, setFeedbackForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [responses, setResponses] = useState({});
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const accessToken = localStorage.getItem('access_token');
  const [employeeInfo, setEmployeeInfo] = useState({ name: '', user: '' });
  const months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("Access denied. No token available. User must be logged in to access this.");
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/employee-dashboard/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log(response.data);
        setEmployeeInfo(response.data.employee_info);
      } catch (error) {
        console.error("Error retrieving profile data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setError("Access denied. No token available. User must be logged in to access this.");
      return;
    }

    const fetchForms = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/feedback-forms/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log("Fetched forms data:", response.data);
        if (Array.isArray(response.data)) {
          setFeedbackForms(response.data);
        } else {
          console.error("Expected an array but received:", response.data);
          setFeedbackForms([]);
        }
      } catch (err) {
        console.error("Error fetching forms:", err);
        setError('Failed to fetch forms');
      } finally {
        setLoading(false);
      }
    };


    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/feedback-history/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log("Fetched history data:", response.data);
        console.log("Rendering feedback history with data:", feedbackHistory);
        if (Array.isArray(response.data)) {
          setFeedbackHistory(response.data);
        } else {
          console.error("Data fetched is not an array:", response.data);

          setFeedbackHistory([]);
        }
      } catch (error) {
        console.error("Failed to fetch feedback history:", error);
        setError('Failed to fetch feedback history');
      } finally {
        setLoading(false);
      }
    };


    fetchForms();
    fetchHistory();
  }, [accessToken]);

  const handleSubmit = async (currentForm, responses) => {
    if (!accessToken) {
      setError("No access token available. Please log in.");
      return;
    }

    setLoading(true);
    const payload = {
      form_id: currentForm.id,
      responses: Object.keys(responses).map(key => ({
        question_id: key,
        response: responses[key]
      }))
    };

    try {
      await axios.post('http://localhost:8000/feedback-responses/', payload, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      alert('Feedback submitted successfully');
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectForm = (form) => {
    setCurrentForm(form);
    setResponses({});
  };

  const handleResponseChange = (questionId, response) => {
    setResponses({ ...responses, [questionId]: response });
  };


  if (loading) return <p>Se încarcă...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className='container-dashboard'>
      <div className="content-container">
        <div className="card-curs">
          <h1 style={{ textAlign: 'center' }}>Formularul de Feedback pe {months[month]}/{year}</h1>
          {feedbackForms.length > 0 ? (
            feedbackForms.map(form => (
              <button key={form.id} onClick={() => handleSelectForm(form)} style={{ margin: '5px' }}>
                {form.title}
              </button>
            ))
          ) : (
            <p>Nu există niciun formular.</p>
          )}

          {currentForm && (
            <div>
              {currentForm.questions.map(question => (
                <div key={question.id} style={{ margin: '10px 0' }}>
                  <label>{question.text}</label>
                  {question.response_type === 'text' && (
                    <input
                      type="text"
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      style={{ marginLeft: '10px' }}
                    />
                  )}
                  {question.response_type === 'rating' && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="range"
                        min="1"
                        max={question.rating_scale || 5}
                        value={responses[question.id] || 1} // Setăm valoarea implicită la minim
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        style={{ marginLeft: '10px' }}
                      />
                      <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                        {responses[question.id] === '1' ? 'Foarte nemulțumit' :
                          responses[question.id] === '2' ? 'Nemulțumit' :
                            responses[question.id] === '3' ? 'Neutru' :
                              responses[question.id] === '4' ? 'Mulțumit' :
                                'Foarte mulțumit'}
                      </span>
                    </div>
                  )}

                  {question.response_type === 'multiple_choice' && (
                    <select
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      style={{ marginLeft: '10px' }}
                    >
                      {question.options.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.text}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
              <button onClick={handleSubmit} style={{ marginTop: '20px' }}>Trimite Feedback</button>
            </div>
          )}
        </div>

        <div className="card-curs">
          <h1>Istoric Feedback</h1>
          <table>
            <thead>
              <tr>
                <th>Titlu formular</th>
                <th>Data completării</th>
                <th>Scor</th>
                <th>Departament</th>
              </tr>
            </thead>
            <tbody>
              {feedbackHistory.length > 0 ? (
                feedbackHistory.map((feedback, index) => (
                  <tr key={index}>
                    <td>{feedback.form.title}</td>
                    <td>{new Date(feedback.date_completed).toLocaleDateString('ro-RO')}</td>
                    <td>{feedback.total_score}</td>
                    <td>{feedback.employee_department}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Niciun istoric nu este disponibil.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
