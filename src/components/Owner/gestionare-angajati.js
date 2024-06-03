import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import ReactPaginate from 'react-paginate';
import { Link } from 'react-router-dom';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [userType, setUserType] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        department: '',
        position: '',
        hireDate: '',
        address: '',
        telephoneNumber: '',
        workingHours: 0,
        freeDays: 0
    });
    const [hrMembers, setHrMembers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({ name: '', function: '', department: '' });
    const [owner, setOwner] = useState(null);
    const [company, setCompany] = useState({
        id: '',
        name: '',
        address: '',
        phone_number: '',
        email: '',
        industry: '',
        number_of_employees: 0,
        founded_date: ''
    });
    const [modalAddOpen, setModalAddOpen] = useState(false);
    const [error, setError] = useState(null);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const baseApiUrl = 'http://localhost:8000';
        const endpoint = userType === 'hr' ? '/create-hr/' : '/create-employee/';

        const requestData = {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            department: formData.department,
            position: formData.position,
            hire_date: formData.hireDate,
            address: formData.address,
            telephone_number: formData.telephoneNumber,
            company: owner.company_id,
        };

        console.log("Request Data:", requestData);

        try {
            const response = await axios.post(`${baseApiUrl}${endpoint}`, requestData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                }
            });

            setModalMessage(`Utilizator creat cu succes! ID Utilizator: ${response.data.user_id}`);
            setIsInfoModalOpen(true);
            setTimeout(() => {
                setIsInfoModalOpen(false);
                setIsAddModalOpen(false);
            }, 1000);
        } catch (error) {
            setModalMessage(`Crearea utilizatorului a eșuat: ${error.response.data.error}`);
            setIsInfoModalOpen(true);
        }
    };


    const handleSearch = async () => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error("No access token provided.");
            return;
        }

        if (!owner || !owner.company_id) {
            console.error("Owner or company_id is not defined.");
            return;
        }

        const companyId = owner.company_id;
        const params = new URLSearchParams({
            name: filter.name,
            function: filter.function,
            department: filter.department
        }).toString();

        try {
            const response = await axios.get(`http://localhost:8000/companies/${companyId}/employees/?${params}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Filtered response:', response.data);

            if (response.data) {
                const { employees, hr_members, count } = response.data.results;
                setEmployees(employees || []);
                setHrMembers(hr_members || []);
                setTotalPages(Math.ceil(count / 4));
                setCurrentPage(1);
            } else {
                console.error('Unexpected response structure:', response.data);
                setError('Unexpected response structure');
            }
        } catch (err) {
            console.error('Error fetching filtered employees:', err);
            setError(err.response ? err.response.data : 'Error fetching filtered employees');
        }
    };


    const handleFilterChange = ({ target: { name, value } }) => {
        setFilter(prevFilter => ({
            ...prevFilter,
            [name]: value
        }));
    };


    const openAddModal = () => setModalAddOpen(true);
    const closeAddModal = () => setModalAddOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => {
            const updatedFormData = {
                ...prevFormData,
                [name]: value
            };

            if (name === 'name' || name === 'birthDate') {
                generateEmailAndPassword(updatedFormData);
            }

            return updatedFormData;
        });
    };

    const generateEmailAndPassword = (formData) => {
        const { name, birthDate } = formData;
        if (name && birthDate) {
            const [firstName, lastName] = name.split(' ');
            if (firstName && lastName) {
                const formattedDate = new Date(birthDate).toISOString().split('T')[0];
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`;
                const password = `${firstName.toLowerCase()}${lastName.toLowerCase()}${formattedDate.replace(/-/g, '')}`;
                setFormData(prevFormData => ({
                    ...prevFormData,
                    email,
                    password
                }));
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("No access token found. User must be logged in to access this page.");
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${accessToken}` }
            };

            try {
                const response = await axios.get('http://localhost:8000/owner-dashboard/', config);
                if (response.data.owner) {
                    setOwner(response.data.owner);
                    console.log('Owner data:', response.data.owner);
                    if (response.data.company) {
                        setCompany(response.data.company);
                        console.log('Company data:', response.data.company);
                    }
                } else {
                    console.error("Owner data is not available or company ID is undefined.");
                }
            } catch (error) {
                console.error("Error fetching data:", error.response || error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchEmployees = async (page = 1) => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error("No access token provided.");
                return;
            }

            if (!owner || !owner.company_id) {
                console.error("Owner or company_id is not defined.");
                return;
            }

            const companyId = owner.company_id;
            const params = new URLSearchParams({
                page,
                name: filter.name,
                function: filter.function,
                department: filter.department
            }).toString();

            try {
                const response = await axios.get(`http://localhost:8000/companies/${companyId}/employees/?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log('Employee and HR data:', response.data);
                setEmployees(response.data.results.employees || []);
                setHrMembers(response.data.results.hr_members || []);
                setTotalPages(Math.ceil(response.data.count / 4));
            } catch (err) {
                setError(err.response ? err.response.data : 'Error fetching employees');
            }
        };

        if (owner && owner.company_id) {
            fetchEmployees(currentPage);
        }
    }, [currentPage, filter, owner]);




    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected + 1);
    };


    const handleDeleteHr = async (hrId) => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error("No access token provided.");
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/hr/${hrId}/delete/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setHrMembers(hrMembers.filter(hr => hr.user !== hrId));
            setModalMessage('Membrul HR a fost șters cu succes.');
            setIsModalOpen(true);

            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);

            setTimeout(() => {
                window.location.reload();
            }, 3000);

        } catch (err) {
            setError(err.response.data);
            setModalMessage('A apărut o eroare la ștergerea membrului HR.');
            setIsModalOpen(true);

            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);

            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    }

    const deleteEmployee = async (employeeId) => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error("No access token provided.");
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/employees/${employeeId}/delete/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setEmployees(employees.filter(employee => employee.user !== employeeId));
            setModalMessage('Angajatul a fost șters cu succes.');
            setIsModalOpen(true);

            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);

            setTimeout(() => {
                window.location.reload();
            }, 3000);

        } catch (err) {
            setError(err.response.data);
            setModalMessage('A apărut o eroare la ștergerea angajatului.');
            setIsModalOpen(true);

            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);

            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }

    };


    return (
        <div className="container-dashboard">
            <h1 style={{ textAlign: 'center' }}>Gestionare angajați</h1>
            <div className="filter-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <input
                    type="text"
                    name="name"
                    placeholder="Caută după nume..."
                    value={filter.name}
                    onChange={handleFilterChange}
                    style={{ flexBasis: 'auto' }}
                />

                <div style={{ display: 'flex', width: '83%', gap: '10px' }}>
                    <select
                        name="function"
                        value={filter.function}
                        onChange={handleFilterChange}
                    >
                        <option value="">Selectează funcția</option>
                        <option value="Programator">Programator</option>
                        <option value="Manager">Manager</option>
                    </select>
                    <select
                        name="department"
                        value={filter.department}
                        onChange={handleFilterChange}
                    >
                        <option value="">Selectează departamentul</option>
                        <option value="IT">IT</option>
                        <option value="Resurse Umane">Resurse Umane</option>
                    </select>
                    <button onClick={handleSearch}>CAUTĂ</button>
                </div>
            </div>
            <table className="card-curs">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nume</th>
                        <th>Număr de telefon</th>
                        <th>Adresa de email</th>
                        <th>Departament</th>
                        <th>Funcție</th>
                        <th>Adresă</th>
                        <th>Data angajării</th>
                        <th>Acțiuni</th>
                    </tr>
                </thead>
                <tbody>
                    {(employees.length > 0 || hrMembers.length > 0) ? (
                        <>
                            {employees.map((employee) => (
                                <tr key={employee.user}>
                                    <td>{employee.user}</td>
                                    <td>
                                        <Link
                                            to={`owner/angajat-profil/${employee.user}`}
                                            style={{ color: 'black', textDecoration: 'none', opacity: 0.7 }}
                                        >
                                            {employee.name}
                                        </Link>
                                    </td>
                                    <td>{employee.telephone_number}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.department}</td>
                                    <td>{employee.position}</td>
                                    <td>{employee.address}</td>
                                    <td>{employee.hire_date}</td>
                                    <td>
                                        <button className='buton' onClick={() => deleteEmployee(employee.user)}>Șterge</button>
                                    </td>
                                </tr>
                            ))}
                            {hrMembers.map((hr) => (
                                <tr key={hr.user}>
                                    <td>{hr.user}</td>
                                    <td>{hr.name}</td>
                                    <td>{hr.telephone_number}</td>
                                    <td>{hr.email}</td>
                                    <td>{hr.department}</td>
                                    <td>{hr.position}</td>
                                    <td>{hr.address}</td>
                                    <td>{hr.hire_date}</td>
                                    <td>
                                        <button className='buton' onClick={() => handleDeleteHr(hr.user)}>Șterge</button>
                                    </td>
                                </tr>
                            ))}
                        </>
                    ) : (
                        <tr>
                            <td colSpan="9">Nu există angajați</td>
                        </tr>
                    )}
                </tbody>

            </table>


            <div className="button-container">
                <button className="buton" onClick={openAddModal}>Adaugă angajat nou</button>
            </div>

            <ReactPaginate
                previousLabel={'Anterior'}
                nextLabel={'Următorul'}
                breakLabel={'...'}
                pageCount={totalPages}
                onPageChange={handlePageChange}
                containerClassName={'pagination'}
                activeClassName={'active'}
                forcePage={currentPage - 1}
            />

            <Modal
                isOpen={modalAddOpen}
                onRequestClose={closeAddModal}
                contentLabel="Adaugă angajat nou"
                className="modal-content"
            >
                <h2>Adaugă {userType || "User"}</h2>
                <select value={userType} onChange={e => setUserType(e.target.value)}>
                    <option value="">Selectează tipul de utilizator</option>
                    <option value="hr">HR</option>
                    <option value="employee">Angajat</option>
                </select>

                {userType && (
                    <form onSubmit={handleSubmit}>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required />
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Parolă" required />
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nume" required />
                        <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="Departament" required />
                        <input type="text" name="position" value={formData.position} onChange={handleInputChange} placeholder="Funcție" required />
                        <input type="date" name="hireDate" value={formData.hireDate} onChange={handleInputChange} placeholder="Data angajării" required />
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Adresa" required />
                        <input type="text" name="telephoneNumber" value={formData.telephoneNumber} onChange={handleInputChange} placeholder="Numărul de telefon" required />
                        <button type="submit">Adaugă</button>
                        <button type="button" onClick={closeAddModal}>Închide</button>
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Informare"
                className="modal-content"
            >
                <h2>Informare</h2>
                <p>{modalMessage}</p>
                <button onClick={() => setIsModalOpen(false)}>Închide</button>
            </Modal>
            <Modal
                isOpen={isInfoModalOpen}
                onRequestClose={() => setIsInfoModalOpen(false)}
                contentLabel="Informare"
                className="modal-content"
            >
                <h2>Informare</h2>
                <p>{modalMessage}</p>
                <button onClick={() => setIsInfoModalOpen(false)}>Închide</button>
            </Modal>
        </div>
    );
};

export default EmployeeManagement;