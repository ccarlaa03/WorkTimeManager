import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import instance from '../../axiosConfig';


const GestionareFeedback = () => {
  const [cautare, setCautare] = useState("");
  const [filtrareDepartament, setFiltrareDepartament] = useState("");
  const [paginaCurenta, setPaginaCurenta] = useState(1);
  const [filtrareLuna, setFiltrareLuna] = useState('');
  const navigate = useNavigate();
  const NUMAR_ANGAJATI_PER_PAGINA = 5;
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


          const feedbackResponse = await axios.get(`/gestionare-feedback/?company_id=${hrCompanyId}`, {
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

  
  const angajatiFiltrati = employees
    .filter(angajat => angajat.nume.toLowerCase().includes(cautare.toLowerCase()))
    .filter(angajat => filtrareDepartament ? angajat.departament === filtrareDepartament : true);

  const numarTotalAngajati = angajatiFiltrati.length;
  const indexUltimAngajat = paginaCurenta * NUMAR_ANGAJATI_PER_PAGINA;
  const indexPrimAngajat = indexUltimAngajat - NUMAR_ANGAJATI_PER_PAGINA;
  const angajatiCurenti = angajatiFiltrati.slice(indexPrimAngajat, indexUltimAngajat);

  // Definirea funcției paginate
  const paginate = (numarPagina) => setPaginaCurenta(numarPagina);


  // Afișează butoanele de paginație
  const butoanePaginatie = (
    <div className='pagination'>
      {Array.from(Array(Math.ceil(numarTotalAngajati / NUMAR_ANGAJATI_PER_PAGINA)).keys()).map(num => (
        <button key={num} onClick={() => paginate(num + 1)}>
          {num + 1}
        </button>
      ))}
    </div>
  );
  const handleSearch = () => {

  };
  const componentaCautare = (
    <div>
      <input
        type="text"
        placeholder="Caută după nume..."
        value={cautare}
        onChange={(e) => setCautare(e.target.value)}
      />
      <button onClick={handleSearch} className="buton">
        Caută
      </button>

      <select
        value={filtrareDepartament}
        onChange={(e) => setFiltrareDepartament(e.target.value)}
      >
        <option value="">Toate departamentele</option>
        {/* Aici ar trebui să listezi toate departamentele unice din datele tale */}
      </select>
      <select
        value={filtrareLuna}
        onChange={(e) => setFiltrareLuna(e.target.value)}
      >
        <option value="">Toate lunile</option>
        {/* Opțiuni pentru luni */}
      </select>

    </div>
  );

  const handleNavigateToProfile = (angajatId) => {
    navigate(`/user-profil/${angajatId}`);
  };


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
              <th>Angajat</th>
              <th>Data completată</th>
              <th>Scorul</th>
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
                  <td>{feedback.employee_name}</td>
                  <td>{new Date(feedback.date_completed).toLocaleDateString()}</td>
                  <td>{feedback.total_score}</td>
                </tr>
              ))
            ))}
          </tbody>
        </table>

        <div className="button-container">

          <Link to="/formulare-feeedback">
            <button className="buton">Formulare Feedback</button>
          </Link>
        </div>


        {butoanePaginatie}

      </div>
    </div>
  );
};

export default GestionareFeedback;
