import React, { useState, useEffect } from 'react';
import instance from '../../axiosConfig';
import { useParams } from 'react-router-dom';
import axios from 'axios';


const ProfilAngajat = () => {
  const { user_id } = useParams();
  const instance = axios.create({
    baseURL: "http://localhost:8000",
  });

  const initialEmployeeState = {
    user_id: '',
    name: '',
    position: '',
    department: '',
    hire_date: '',
    email: '',
    address: '',
    telephone_number: '',
  };


  const handleSaveClick = () => {
    // Logic to save the edited employee details
    // You can send a POST or PUT request to your API endpoint here with the employee data
    console.log('Save changes for employee:', employee);
    setEditMode(false); // Exit edit mode after save
  };
  const [editMode, setEditMode] = useState(false);
  const [employee, setEmployee] = useState(initialEmployeeState);

  const [workingSchedule, setWorkSchedule] = useState(null);
  const [leaves, setLeaves] = useState(null);

  useEffect(() => {
    const getAccessToken = () => localStorage.getItem('access_token');

    const fetchHrCompany = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.error("No access token found. User is not logged in.");
        return null;
      }
      try {
        const hrResponse = await instance.get('/hr-dashboard/', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (hrResponse.data && hrResponse.data.company_id) {
          console.log('HR Company ID:', hrResponse.data.company_id);
          return hrResponse.data.company_id;
        } else {
          console.log('HR Company data:', hrResponse.data);
          return null;
        }
      } catch (error) {
        console.error('Error fetching HR company data:', error);
        return null;
      }
    };

    const fetchEmployeeDetails = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.error("No access token found. User is not logged in.");
        return;
      }
      console.log(`User ID from useParams is: ${user_id}`);
      if (!user_id) {
        console.error('User ID is undefined or null');
        return;
      }


      const url = `/angajat-profil/${user_id}/`;

      console.log(`Requesting employee details from URL: http://localhost:8000${url}`);



      const headers = {
        'Authorization': `Bearer ${accessToken}`,
      };
      console.log(`Making a GET request to: ${url}`);
      console.log(`Headers:`, headers);

      try {
        const response = await instance.get(url, { headers });
        setEmployee(response.data);

      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };



    const initializeData = async () => {
      const hrCompanyId = await fetchHrCompany();
      if (hrCompanyId) {
        await fetchEmployeeDetails();
      }
    };

    initializeData(user_id);
  }, [user_id]);

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  if (!user_id) {
    return <div>Încărcarea detaliilor angajatului...</div>;
  }

  const EmployeeDetailsEdit = ({ employee, onSaveClick, onChange }) => {
    return (
      <div className="personal-info">
        <div className="detail">
          <label>Nume:</label>
          <input
            type="text"
            name="name"
            value={employee.name || ''}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={employee.email || ''}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Departament:</label>
          <input
            type="text"
            name="department"
            value={employee.department || ''}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Post:</label>
          <input
            type="text"
            name="position"
            value={employee.position || ''}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <button className="button" onClick={onSaveClick}>
          Salvează modificările
        </button>
      </div>
    );
  };
  const EmployeeDetailsView = ({ employee, onEditClick }) => {
    return (
      <div className="personal-info">
        <div className="detail">
          <label>Nume:</label>
          <span>{employee.name}</span>
        </div>
        <div className="detail">
          <label>Email:</label>
          <span>{employee.email}</span>
        </div>
        <div className="detail">
          <label>Departament:</label>
          <span>{employee.department}</span>
        </div>
        <div className="detail">
          <label>Post:</label>
          <span>{employee.position}</span>
        </div>
        <button className="button" onClick={onEditClick}>
          Editează profilul
        </button>
      </div>
    );
  };
  return (
    <div className="employee-profile">

      <div className="profile-content">

        {editMode ? (
          <EmployeeDetailsEdit
            employee={employee}
            onSaveClick={handleSaveClick}
            onChange={handleChange}
          />
        ) : (
          <EmployeeDetailsView employee={employee} onEditClick={handleEdit} />
        )}

        {/* Informații suplimentare (concedii, program de lucru) */}
        <div className="additional-info">
          <h2>Concedii</h2>
          {
            leaves ? (
              // Presupunând că "leaves" este un array, îl parcurgi și afișezi fiecare concediu
              leaves.map(leave => (
                <div key={leave.id}>
                  {/* Aici afișezi detaliile fiecărui concediu, în funcție de structura datelor tale */}
                  <p>Tip Concediu: {leave.leave_type}</p>
                  <p>Descriere: {leave.leave_description}</p>
                  {/* Adaugă restul detaliilor necesare */}
                </div>
              ))
            ) : (
              <p>Încărcarea datelor despre concedii...</p>
            )
          }

          <h2>Program de lucru</h2>
          {
            workingSchedule ? (
              // Afișează detaliile programului de lucru, similar cu concediile
              <div>
                <p>Ore de lucru: {workingSchedule.hours}</p>
                {/* Adaugă restul detaliilor necesare */}
              </div>
            ) : (
              <p>Încărcarea programului de lucru...</p>
            )
          }
        </div>
      </div>
    </div>
  );

};

export default ProfilAngajat;
