import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const FeedbackForm = () => {
  const [feedbackForms, setFeedbackForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [responses, setResponses] = useState({});
  const currentDate = new Date();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const accessToken = localStorage.getItem('access_token');
  const [employeeInfo, setEmployeeInfo] = useState({ name: '', user: '' });
  const months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Functia pentru a prelua datele profilului angajatului
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("Acces refuzat. Token inexistent. Utilizatorul trebuie să fie autentificat pentru a accesa această pagină.");
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/employee-dashboard/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log(response.data);
        setEmployeeInfo(response.data.employee_info);
      } catch (error) {
        console.error("Eroare la preluarea datelor profilului:", error);
      }
    };
    fetchData();
  }, []);

  // Functia pentru a prelua formularele de feedback și istoricul feedback-ului
  useEffect(() => {
    if (!accessToken) {
      setError("Acces refuzat. Token inexistent. Utilizatorul trebuie să fie autentificat pentru a accesa această pagină.");
      return;
    }

    const fetchForms = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/feedback-forms/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log("Datele formularelor preluate:", response.data);
        if (Array.isArray(response.data)) {
          setFeedbackForms(response.data);
        } else {
          console.error("Se aștepta un array dar s-a primit:", response.data);
          setFeedbackForms([]);
        }
      } catch (err) {
        console.error("Eroare la preluarea formularelor:", err);
        setError('Preluarea formularelor a eșuat');
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
        console.log("Datele istoricului preluate:", response.data);
        console.log("Redare istoric feedback cu date:", feedbackHistory);
        if (Array.isArray(response.data)) {
          setFeedbackHistory(response.data);
        } else {
          console.error("Datele preluate nu sunt un array:", response.data);
          setFeedbackHistory([]);
        }
      } catch (error) {
        console.error("Eroare la preluarea istoricului feedback-ului:", error);
        setError('Preluarea istoricului feedback-ului a eșuat');
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
    fetchHistory();
  }, [accessToken]);

  // Functia pentru a verifica dacă formularul a fost trimis deja
  useEffect(() => {
    const checkIfSubmitted = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error("Acces refuzat. Token inexistent. Utilizatorul trebuie să fie autentificat pentru a accesa această pagină.");
        return;
      }

      if (currentForm) {
        try {
          const response = await axios.get(`http://localhost:8000/feedback/check-submitted/${currentForm.id}/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (response.data.submitted) {
            setFormSubmitted(true);

            setTimeout(() => {
              window.location.href = '/feedback-ang';
            }, 1000);
          }
        } catch (error) {
          console.error("Eroare la verificarea trimiterii formularului:", error);
        }
      }
    };

    checkIfSubmitted();
  }, [currentForm]);

  // Afișează un mesaj dacă formularul a fost deja trimis
  if (formSubmitted) {
    return <p>Ai completat deja acest formular. Mulțumim!</p>;
  }

  // Functia pentru a selecta un formular de feedback
  const handleSelectForm = (form) => {
    setCurrentForm(form);
    setIsModalOpen(true);
    setResponses({});
  };

  // Functia pentru a închide modalul
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Functia pentru a trimite feedback-ul
  const handleSubmit = async () => {
    if (!accessToken) {
      setError("Nu există token de acces. Vă rugăm să vă autentificați.");
      return;
    }

    setLoading(true);

    const payload = {
      responses: currentForm.questions.map(question => {
        let responseValue = responses[question.id];
        if (question.response_type === 'multiple_choice') {
          responseValue = { selected_option: responseValue };
        } else if (question.response_type === 'rating') {
          responseValue = { score: parseInt(responseValue, 10) };
        } else {
          responseValue = { text: responseValue };
        }
        return {
          question_id: question.id,
          response: responseValue
        };
      })
    };

    console.log("Se trimit datele feedback-ului:", payload);

    try {
      const response = await axios.post(`http://localhost:8000/feedback/submit/${currentForm.id}/`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log("Răspunsul trimiterii feedback-ului:", response.data);
      alert('Feedback trimis cu succes');
      window.location.reload();
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert(err.response.data.error);
      } else {
        console.error("Eroare la trimiterea feedback-ului:", err);
        setError('Trimiterea feedback-ului a eșuat');
      }
    }
  };

  // Functia pentru a gestiona schimbarea răspunsului la întrebări
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

              </tr>
            </thead>
            <tbody>
              {feedbackHistory.length > 0 ? (
                feedbackHistory.map((feedback, index) => (
                  <tr key={index}>
                    <td>{feedback.form.title}</td>
                    <td>{new Date(feedback.date_completed).toLocaleDateString('ro-RO')}</td>
                    <td>{feedback.total_score}</td>

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
