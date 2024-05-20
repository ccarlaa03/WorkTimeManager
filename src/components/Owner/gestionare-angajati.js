import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import ReactPaginate from 'react-paginate';
import { Link } from 'react-router-dom';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [hrMembers, setHrMembers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({
        name: '',
        function: '',
        department: '',
        hireDate: '',
    });
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        position: '',
        department: '',
        hire_date: '',
        working_hours: 0,
        free_days: 0,
        email: '',
        address: '',
        telephone_number: ''
    });
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
    const handleSearch = () => {
        // Logica de căutare aici
    };


    const openAddModal = () => setModalAddOpen(true);
    const closeAddModal = () => setModalAddOpen(false);

    const handleInputChange = (e) => {
        setNewEmployee({
            ...newEmployee,
            [e.target.name]: e.target.value
        });
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

            const companyId = owner.company_id;
            try {
                const response = await axios.get(`http://localhost:8000/companies/${companyId}/employees/?page=${page}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log('Employee and HR data:', response.data);
                setEmployees(response.data.results.employees || []);
                setHrMembers(response.data.results.hr_members || []);
                setTotalPages(Math.ceil(response.data.count / 3) || 1);
            } catch (err) {
                setError(err.response ? err.response.data : 'Error fetching employees');
            }
        };

        if (owner && owner.company_id) {
            fetchEmployees(currentPage);
        }
    }, [owner, currentPage]);



    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected + 1);
    };




    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/employees/', newEmployee);
            setEmployees([...employees, response.data]);
        } catch (err) {
            setError(err.response.data);
        }
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

            // Închide modalitatea după 2 secunde
            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);

            // Dă refresh la pagină după 3 secunde
            setTimeout(() => {
                window.location.reload();
            }, 3000);

        } catch (err) {
            setError(err.response.data);
            setModalMessage('A apărut o eroare la ștergerea membrului HR.');
            setIsModalOpen(true);

            // Închide modalitatea după 2 secunde
            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);

            // Dă refresh la pagină după 3 secunde
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

            // Închide modalitatea după 2 secunde
            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);

            // Dă refresh la pagină după 3 secunde
            setTimeout(() => {
                window.location.reload();
            }, 3000);

        } catch (err) {
            setError(err.response.data);
            setModalMessage('A apărut o eroare la ștergerea angajatului.');
            setIsModalOpen(true);

            // Închide modalitatea după 2 secunde
            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);

            // Dă refresh la pagină după 3 secunde
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }

    };


    return (
        <div className="container-dashboard">
            <h1>Gestionare angajați</h1>
            <div className="filter-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Caută după nume..."
                    value={filter.name}
                    onChange={(e) => setFilter({ ...filter, name: e.target.value })}
                    style={{ flexBasis: '100%' }}
                />
                <br />
                <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
                    <select
                        name="functie"
                        value={filter.function}
                        onChange={handleSearch}
                        className="select-style"
                    >
                        <option value="">Toate funcțiile</option>
                        <option value="Developer">Developer</option>
                        <option value="Manager">Manager</option>
                    </select>

                    <select
                        name="departament"
                        value={filter.department}
                        onChange={handleSearch}
                        className="select-style"
                    >
                        <option value="">Toate departamentele</option>
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                    </select>

                    <input
                        type="date"
                        name="dataAngajarii"
                        placeholder="Caută după data angajării..."
                        value={filter.hireDate}
                        onChange={handleSearch}
                        style={{ flex: 1 }}
                    />
                    <button onClick={handleSearch} className="buton">
                        Caută
                    </button>
                </div>
            </div>
            <br />
            <table className="tabel">
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
                    {employees.length > 0 && employees.map((employee) => (
                        <tr key={employee.user}>
                            <td>{employee.user}</td>
                            <td>
                                <Link
                                    to={`/angajat-profil/${employee.user}`}
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
                    {hrMembers.length > 0 && hrMembers.map((hr) => (
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
                    {(!employees.length || !hrMembers.length) && (
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
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
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
                <h2>Adaugă angajat nou</h2>
                <form onSubmit={handleAddEmployee}>
                    <label>Nume:<input type="text" name="name" value={newEmployee.name} onChange={handleInputChange} required /></label>
                    <label>Număr de telefon:<input type="text" name="telephone_number" value={newEmployee.telephone_number} onChange={handleInputChange} required /></label>
                    <label>Adresă de email:<input type="email" name="email" value={newEmployee.email} onChange={handleInputChange} required /></label>
                    <label>Departament:<input type="text" name="department" value={newEmployee.department} onChange={handleInputChange} required /></label>
                    <label>Funcție:<input type="text" name="position" value={newEmployee.position} onChange={handleInputChange} required /></label>
                    <label>Adresă:<input type="text" name="address" value={newEmployee.address} onChange={handleInputChange} required /></label>
                    <label>Data angajării:<input type="date" name="hire_date" value={newEmployee.hire_date} onChange={handleInputChange} required /></label>
                    <button type="submit">Adaugă</button>
                    <button type="button" onClick={closeAddModal}>Închide</button>
                </form>
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
        </div>
    );
};

export default EmployeeManagement;