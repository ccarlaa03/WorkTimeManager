import React, { useState, useEffect } from 'react';
import instance from '../../axiosConfig';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';

const ProfilAngajat = () => {
  const { user_id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
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

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setConfirmationMessage("");
  };

  const [editMode, setEditMode] = useState(false);
  const [employee, setEmployee] = useState(initialEmployeeState);
  const [workschedule, setWorkSchedule] = useState(null);
  const [leaves, setLeaves] = useState(null);
  const [employeedetails, seEmployeeDetails] = useState(null);

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

    const fetchLeaves = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.error("No access token found. User is not logged in.");
        return;
      }
      try {
        const leaveResponse = await instance.get(`http://localhost:8000/angajat-concedii/${user_id}/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        setLeaves(leaveResponse.data);
      } catch (error) {
        console.error('Error fetching leaves:', error);
      }
    };


    const fetchWorkSchedule = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.error("No access token found. User is not logged in.");
        return;
      }
      try {
        const leaveResponse = await instance.get(`http://localhost:8000/angajat-prog/${user_id}/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        setWorkSchedule(leaveResponse.data);
      } catch (error) {
        console.error('Error fetching workschedule:', error);
      }
    };


    const initializeData = async () => {
      const hrCompanyId = await fetchHrCompany();
      if (hrCompanyId) {
        await fetchEmployeeDetails();
        await fetchLeaves();
        await fetchWorkSchedule();

      }
    };

    initializeData(user_id);
  }, [user_id]);


  const saveEmployeeDetails = async () => {
    const getAccessToken = () => localStorage.getItem('access_token');
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.error("No access token found. User is not logged in.");
      return;
    }

    const url = `/employee-edit/${user_id}/`;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await instance.put(url, employee, { headers });
      console.log(typeof saveEmployeeDetails);
      seEmployeeDetails(response.data);
      setConfirmationMessage('Modificările au fost salvate cu succes!');
      setTimeout(() => {
        setConfirmationMessage('');
        setIsModalOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating employee details:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  if (!user_id) {
    return <div>Încărcarea detaliilor angajatului...</div>;
  }

  const EmployeeDetailsEdit = ({ employee, onSave, onChange, confirmationMessage }) => {
    return (
      <div className="personal-info">
        <div className="detail">
          <label>Nume:</label>
          <input
            type="text"
            name="name"
            value={employee.name}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={employee.email}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Departament:</label>
          <input
            type="text"
            name="department"
            value={employee.department}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Post:</label>
          <input
            type="text"
            name="position"
            value={employee.position}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Data angajării:</label>
          <input
            type="text"
            name="hire_date"
            value={employee.hire_date}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Ore lucrate:</label>
          <input
            type="text"
            name="working_hours"
            value={employee.working_hours}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Zile libere:</label>
          <input
            type="text"
            name="free_days"
            value={employee.free_days}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div className="detail">
          <label>Adresa:</label>
          <input
            type="text"
            name="address"
            value={employee.address}
            onChange={onChange}
            className="input-field"
          />
        </div>

        <div className="detail">
          <label>Număr de telefon:</label>
          <input
            type="text"
            name="telephone"
            value={employee.telephone_number}
            onChange={onChange}
            className="input-field"
          />
        </div>
        {confirmationMessage && <div className="save-confirmation">{confirmationMessage}</div>}
        <button className='buton' onClick={onSave}>Salvează modificările</button>
      </div>
    );
  };
  const EmployeeDetailsView = ({ employee, onEditClick }) => {
    return (
      <div className="personal-info">
        <table className="info-table">
          <tbody>
            <tr>
              <th>Nume:</th>
              <td><b>{employee.name}</b></td>
            </tr>
            <tr>
              <th>Email:</th>
              <td>{employee.email}</td>
            </tr>
            <tr>
              <th>Departament:</th>
              <td>{employee.department}</td>
            </tr>
            <tr>
              <th>Post:</th>
              <td><b>{employee.position}</b></td>
            </tr>
            <tr>
              <th>Adresă:</th>
              <td>{employee.address}</td>
            </tr>
            <tr>
              <th>Număr de telefon:</th>
              <td>{employee.telephone_number}</td>
            </tr>
            <tr>
              <th>Data angajării:</th>
              <td><b>{employee.hire_date}</b></td>
            </tr>
            <tr>
              <th>Ore lucrate:</th>
              <td>{employee.working_hours}</td>
            </tr>
            <tr>
              <th>Zile libere:</th>
              <td>{employee.free_days}</td>
            </tr>
          </tbody>
        </table>
        <button className='buton' onClick={handleEdit}>Editează profilul</button>
      </div>
    );
  };
  return (
    <div className="container-dashboard">
      <div className="profile-content">
        <Modal className="modal-content" isOpen={isModalOpen} onRequestClose={handleCloseModal}>
          <EmployeeDetailsEdit
            employee={employee}
            onSave={saveEmployeeDetails}
            onChange={handleChange}
          />
          <button className='buton' onClick={handleCloseModal}>Închide</button>
        </Modal>

        <div className="card-curs">
          <EmployeeDetailsView employee={employee} onEditClick={handleEdit} />
        </div>

        <div className="lista-cursuri">
          <div className="card-curs">
            <h2>Concedii</h2>
            {leaves ? (
              <table>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="leave-item">
                      <th style={{ color: '#A087BC' }}>Id:</th>
                      <td>{leave.id}</td>
                      <th style={{ color: '#A087BC' }}>Status:</th>
                      <td>{leave.status}</td>
                      <th style={{ color: '#A087BC' }}>Tipul de concediu:</th>
                      <td>{leave.leave_type}</td>
                      <th style={{ color: '#A087BC' }}>Perioada:</th>
                      <td>{`${leave.start_date} - ${leave.end_date}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Încărcarea datelor despre concedii...</p>
            )}
          </div>

          <div className="card-curs">
            <h2>Program de lucru</h2>
            {workschedule ? (
              <table>
                <tbody>
                  {workschedule.map((schedule) => (
                    <tr key={schedule.id} className="schedule-item">
                      <th style={{ color: '#A087BC' }}>Id:</th>
                      <td>{schedule.id}</td>
                      <th style={{ color: '#A087BC' }}>Data:</th>
                      <td>{schedule.date}</td>
                      <th style={{ color: '#A087BC' }}>Program:</th>
                      <td>{`${schedule.start_time} - ${schedule.end_time}`}</td>
                      <th style={{ color: '#A087BC' }}>Ore suplimentare:</th>
                      <td>{schedule.overtime_hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Încărcarea programului de lucru...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilAngajat;