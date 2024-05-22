import React, { useState, useEffect } from 'react';
import instance from '../../axiosConfig';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';

const ProfilAngajatOwner = () => {
    const { user_id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedbackForms, setFeedbackForms] = useState([]);
    const [trainingSessions, setTrainingSessions] = useState([]);
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
    const LEAVE_TYPES = [
        { value: 'AN', label: 'Concediu Anual' },
        { value: 'SI', label: 'Concediu Medical' },
        { value: 'UP', label: 'Concediu Fără Plată' },
        { value: 'MA', label: 'Concediu de Maternitate' },
        { value: 'PA', label: 'Concediu de Paternitate' },
        { value: 'ST', label: 'Concediu de Studii' },
    ];

    const statusMap = {
        'AC': 'Acceptat',
        'RE': 'Refuzat',
        'PE': 'În așteptare'
    };

    const handleEdit = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setConfirmationMessage("");
    };

    const [employee, setEmployee] = useState(initialEmployeeState);
    const [workschedule, setWorkSchedule] = useState(null);
    const [leaves, setLeaves] = useState(null);
    const [employeedetails, seEmployeeDetails] = useState(null);

    const getAccessToken = () => localStorage.getItem('access_token');

    // Fetch details about the employee
    const fetchEmployeeDetails = async () => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error("No access token found. User is not logged in.");
            return;
        }

        const url = `http://localhost:8000/owner/angajat-profil/${user_id}/`;
        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            console.log('Employee details fetched successfully:', response.data);
            setEmployee(response.data);
        } catch (error) {
            console.error('Failed to fetch employee details:', error.response ? error.response.data : error);
        }
    };

    // Fetch leaves information
    const fetchLeaves = async () => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error("No access token found. User is not logged in.");
            return;
        }

        try {
            const leaveResponse = await axios.get(`http://localhost:8000/angajat-concedii/${user_id}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            setLeaves(leaveResponse.data);
        } catch (error) {
            console.error('Error fetching leaves:', error);
        }
    };

    // Fetch work schedule information
    const fetchWorkSchedule = async () => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error("No access token found. User is not logged in.");
            return;
        }

        try {
            const scheduleResponse = await axios.get(`http://localhost:8000/angajat-prog/${user_id}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            setWorkSchedule(scheduleResponse.data);
        } catch (error) {
            console.error('Error fetching work schedule:', error);
        }
    };

    const fetchFeedbackData = async () => {
        setIsLoading(true);
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error("No access token found. User is not logged in.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(`/employee/${user_id}/feedback/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            console.log('Feedback Forms:', response.data);
            setFeedbackForms(response.data);
        } catch (error) {
            console.error('Error fetching feedback data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const fetchTrainingData = async () => {
        setIsLoading(true);
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error("No access token found. User is not logged in.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(`/employee/${user_id}/trainings/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            console.log('Training Sessions:', response.data);
            setTrainingSessions(response.data);
        } catch (error) {
            console.error('Error fetching training data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize all data fetch operations
    useEffect(() => {
        const initializeData = async () => {
            await fetchEmployeeDetails();
            await fetchLeaves();
            await fetchWorkSchedule();
            await fetchFeedbackData();
            await fetchTrainingData();
        };

        initializeData();
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
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const time = new Date('1970-01-01T' + timeString + 'Z');
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
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


                <div className="card-curs">
                    <h2>Concedii</h2>
                    {leaves ? (
                        <table>
                            <tbody>
                                {leaves.map((leave) => (
                                    <tr key={leave.id} className="leave-item">
                                        <th >Id:</th>
                                        <td>{leave.id}</td>
                                        <th >Status:</th>
                                        <td>{statusMap[leave.status]}</td>
                                        <th >Tipul de concediu:</th>
                                        <td>{LEAVE_TYPES.find(type => type.value === leave.leave_type)?.label}</td>
                                        <th >Perioada:</th>
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
                                        <th >Id:</th>
                                        <td>{schedule.id}</td>
                                        <th >Data:</th>
                                        <td>{schedule.date}</td>
                                        <th>Program:</th>
                                        <td>{`${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`}</td>
                                        <th >Ore suplimentare:</th>
                                        <td>{schedule.overtime_hours}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Încărcarea programului de lucru...</p>
                    )}
                </div>

                <div className="card-curs">
                    <h2>Feedback</h2>
                    {isLoading ? (
                        <p>Încărcarea feedback-ului...</p>
                    ) : feedbackForms.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Titlu</th>
                                    <th>Creat de</th>
                                    <th>Creat la ora</th>
                                    <th>Angajat</th>
                                    <th>Data completată</th>
                                    <th>Scorul</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbackForms.map((feedback) => (
                                    <tr key={feedback.id}>
                                        <td>{feedback.form.title}</td>
                                        <td>{feedback.form.created_by}</td>
                                        <td>{new Date(feedback.form.created_at).toLocaleDateString()}</td>
                                        <td>{feedback.employee_name}</td>
                                        <td>{new Date(feedback.date_completed).toLocaleDateString()}</td>
                                        <td>{feedback.total_score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Nu există feedback-uri disponibile.</p>
                    )}
                </div>

                <div className="card-curs">
                    <h2>Particicpări la cursuri</h2>
                    {isLoading ? (
                        <p>Încărcarea sesiunilor de training...</p>
                    ) : trainingSessions.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Titlu</th>
                                    <th>Data începerii</th>
                                    <th>Data terminării</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainingSessions.map((session) => (
                                    <tr key={session.id}>
                                        <td>{session.title}</td>
                                        <td>{new Date(session.start_date).toLocaleDateString()}</td>
                                        <td>{new Date(session.end_date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Nu există sesiuni de training disponibile.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilAngajatOwner;