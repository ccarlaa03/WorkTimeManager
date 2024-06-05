import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import instance from '../../axiosConfig';
import { AuthContext } from '../../AuthContext';

Modal.setAppElement('#root');

const GestionareAngajati = () => {
    const { user } = useContext(AuthContext);
    const [employee, setEmployees] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({ name: '', function: '', department: '' });
    const [employeeToEdit, setEmployeeToEdit] = useState(null);
    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [modalAddOpen, setModalAddOpen] = useState(false);
    const [hrCompanyId, setHrCompany] = useState(null);
    const getAccessToken = () => localStorage.getItem('access_token');
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        position: '',
        department: '',
        hire_date: '',
        email: '',
        address: '',
        telephone_number: '',
        birth_date: '',
    });
    const employeesPerPage = 6;
    const [totalPages, setTotalPages] = useState(0);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await createEmployee(newEmployee);
        setNewEmployee({
            name: '',
            position: '',
            department: '',
            hire_date: '',
            email: '',
            address: '',
            telephone_number: '',
        });
        closeAddModal();
    };

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee(prevFormData => {
            const updatedFormData = {
                ...prevFormData,
                [name]: value
            };

            if (name === 'name' || name === 'hire_date') {
                generateEmailAndPassword(updatedFormData);
            }

            return updatedFormData;
        });
    };

    const fetchHrCompany = async () => {
        const accessToken = getAccessToken();
        try {
            const hrResponse = await instance.get('/hr-dashboard/', {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (hrResponse.data && hrResponse.data.company_id) {
                setHrCompany(hrResponse.data.company_id);
                console.log('HR Company ID:', hrResponse.data.company_id);
            } else {
                console.log('HR Company data:', hrResponse.data);
            }
        } catch (error) {
            console.error('Error fetching HR company data:', error.response ? error.response.data : error);
        }
    };

    const fetchEmployees = async () => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error("No access token provided.");
            return;
        }

        if (!hrCompanyId) {
            console.error("No HR Company ID found.");
            return;
        }

        const params = new URLSearchParams({
            page: currentPage + 1, // Pagination starts at 1 in backend
            per_page: employeesPerPage,
            name: filter.name,
            function: filter.function,
            department: filter.department
        }).toString();

        const url = `http://localhost:8000/hr/${hrCompanyId}/employees/?${params}`;
        console.log(`Fetching employees from: ${url}`);

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data && response.data.results) {
                setEmployees(response.data.results);
                setTotalPages(Math.ceil(response.data.count / employeesPerPage));
            } else {
                setEmployees([]);
                console.error('No employees data or data not in expected format:', response.data);
            }
        } catch (err) {
            setError(err.response ? err.response.data : 'Error fetching employees');
            console.error('Failed to fetch employees:', err);
        }
    };

    useEffect(() => {
        fetchHrCompany();
    }, []);

    useEffect(() => {
        if (hrCompanyId) {
            fetchEmployees();
        }
    }, [currentPage, filter, hrCompanyId]);

    const handleEmployeeEditChange = (e) => {
        const { name, value } = e.target;
        setEmployeeToEdit((prevEmployee) => ({
            ...prevEmployee,
            [name]: value,
        }));
    };

    const generateEmailAndPassword = (formData) => {
        const { name, birth_date } = formData;
        if (name && birth_date) {
            const [firstName] = name.split(' ');
            if (firstName) {
                const formattedDate = new Date(birth_date).toISOString().split('T')[0];
                const email = `${firstName.toLowerCase()}@gmail.com`;
                const password = `${firstName.toLowerCase()}${formattedDate.replace(/-/g, '')}`;
                setNewEmployee(prevFormData => ({
                    ...prevFormData,
                    email,
                    password
                }));
            }
        }
    };

    
    // CREATE
    const createEmployee = async (newEmployee) => {
        newEmployee.company = hrCompanyId;
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.log("No access token found. User is not logged in.");
            return;
        }
        try {
            const response = await axios.post('http://localhost:8000/create_employee/', newEmployee, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            console.log('Angajat adăugat cu succes:', response.data);
            fetchEmployees(); // Refresh employees list after adding
        } catch (error) {
            console.error('Eroare la adăugarea unui nou angajat:', error.response ? error.response.data : error.message);
        }
    };
    // UPDATE
    const updateEmployee = async (event) => {
        event.preventDefault();
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error("No access token found. User is not logged in.");
            return;
        }

        const updatedEmployeeData = {
            name: employeeToEdit.name,
            telephone_number: employeeToEdit.telephone_number,
            email: employeeToEdit.email,
            department: employeeToEdit.department,
            position: employeeToEdit.position,
            hire_date: employeeToEdit.hire_date,
            address: employeeToEdit.address,
            user: employeeToEdit.user,
        };

        console.log("Updating employee with ID:", updatedEmployeeData.user);
        console.log("Data sent to the server:", updatedEmployeeData);

        try {
            const response = await axios.put(`http://localhost:8000/update_employee/${employeeToEdit.user}/`, updatedEmployeeData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log("Response status:", response.status);
            console.log("Data received from the server:", response.data);

            if (response.status === 200) {
                console.log('Update successful', response.data);

                setEmployees(prevEmployees => prevEmployees.map(employee =>
                    employee.user === updatedEmployeeData.user ? { ...employee, ...response.data } : employee
                ));

                closeEditModal();
            }
        } catch (error) {
            console.error('Error updating employee:', error.response ? error.response.data : error);
        }
    };

    // DELETE
    const deleteEmployee = async (userId) => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error("No access token found. User is not logged in.");
            return;
        }
        try {
            const response = await axios.delete(`http://localhost:8000/delete_employee/${userId}/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (response.status === 204) {
                setEmployees(prevEmployees => prevEmployees.filter(employee => employee.user !== userId));
            }
        } catch (error) {
            console.error('Error deleting employee:', error.response ? error.response.data : error.message);
        }
    };

    const openAddModal = () => setModalAddOpen(true);
    const closeAddModal = () => setModalAddOpen(false);

    const openEditModal = (employee) => {
        setEmployeeToEdit(employee);
        setModalEditOpen(true);
    };

    const closeEditModal = () => {
        setModalEditOpen(false);
        setEmployeeToEdit(null);
    };

    const handleFilterChange = ({ target: { name, value } }) => {
        setFilter(prevFilter => ({
            ...prevFilter,
            [name]: value
        }));
    };

    const handleSearch = async () => {
        setCurrentPage(0);
        await fetchEmployees();
    };

    return (
        <div>
            <div className="container-dashboard">
                <h1>Gestionare angajați</h1>
                <div className="filter-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Caută după nume..."
                        value={filter.name}
                        onChange={handleFilterChange}
                        style={{ flexBasis: 'auto' }}
                    />

                    <div style={{ display: 'flex', width: '83%', gap: '10px', alignItems: 'center' }}>
                        <select
                            name="function"
                            value={filter.function}
                            onChange={handleFilterChange}
                        >
                            <option value="">Selectează funcția</option>
                            <option value="Programator">Programator</option>
                            <option value="Analist">Analist</option>
                            <option value="Tester">Tester</option>
                            <option value="Inginer">Inginer software</option>
                            <option value="Administrator">Admininstrator rețea</option>
                        </select>
                        <select
                            name="department"
                            value={filter.department}
                            onChange={handleFilterChange}
                        >
                            <option value="">Selectează departamentul</option>
                            <option value="IT">IT</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                        <button onClick={handleSearch}>CAUTĂ</button>
                    </div>
                </div>
                <div className='card-curs'>
                    <table className="tabel">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nume</th>
                                <th>Număr de telefon</th>
                                <th>Adresa de email</th>
                                <th>Departament</th>
                                <th>Funcție</th>
                                <th>Ore lucrate</th>
                                <th>Adresă</th>
                                <th>Data angajării</th>
                                <th>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employee.map(employee => (
                                <tr key={employee.user}>
                                    <td>{employee.user}</td>
                                    <td>{employee.name}</td>
                                    <td>{employee.telephone_number}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.department}</td>
                                    <td>{employee.position}</td>
                                    <td>{employee.working_hours}</td>
                                    <td>{employee.address}</td>
                                    <td>{new Date(employee.hire_date).toLocaleDateString()}</td>
                                    <td>
                                        <button className='buton' onClick={() => openEditModal(employee)}>Editează</button>
                                        <button className='buton' onClick={() => deleteEmployee(employee.user)}>Șterge</button>
                                    </td>
                                </tr>
                            ))}
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
                    <Link to="/gestionare-concedii">
                        <button className="buton">Gestionare concedii</button>
                    </Link>

                    <button className="buton" onClick={openAddModal}>Adaugă angajat nou</button>

                    <Link to="/gestionare-prog">
                        <button className="buton">Gestionare program de lucru</button>
                    </Link>
                </div>
                <Modal
                    isOpen={modalAddOpen}
                    onRequestClose={closeAddModal}
                    contentLabel="Adaugă angajat nou"
                    className="modal-content"
                >
                    <h2>Adaugă angajat nou</h2>
                    <form onSubmit={handleSubmit}>
                        <label>Nume:<input type="text" name="name" value={newEmployee.name} onChange={handleInputChange} required /></label>
                        <label>Data de naștere:<input type="date" name="birth_date" value={newEmployee.birth_date} onChange={handleInputChange} required /></label>
                        <label>Număr de telefon:<input type="text" name="telephone_number" value={newEmployee.telephone_number} onChange={handleInputChange} required /></label>
                        <label>Departament:<input type="text" name="department" value={newEmployee.department} onChange={handleInputChange} required /></label>
                        <label>Funcție:<input type="text" name="position" value={newEmployee.position} onChange={handleInputChange} required /></label>
                        <label>Adresă:<input type="text" name="address" value={newEmployee.address} onChange={handleInputChange} required /></label>
                        <label>Data angajării:<input type="date" name="hire_date" value={newEmployee.hire_date} onChange={handleInputChange} required /></label>
                        <button type="submit">Adaugă</button>
                        <button type="button" onClick={closeAddModal}>Închide</button>
                    </form>
                </Modal>
                <Modal
                    isOpen={modalEditOpen}
                    onRequestClose={closeEditModal}
                    contentLabel="Editează angajat"
                    className="modal-content"
                >
                    <h2>Editează Angajat</h2>
                    <form onSubmit={updateEmployee}>
                        <label>
                            Nume:
                            <input
                                type="text"
                                name="name"
                                defaultValue={employeeToEdit ? employeeToEdit.name : ''}
                                onChange={handleEmployeeEditChange}
                                required
                            />
                        </label>
                        <label>
                            Număr de telefon:
                            <input
                                type="text"
                                name="telephone_number"
                                defaultValue={employeeToEdit ? employeeToEdit.telephone_number : ''}
                                onChange={handleEmployeeEditChange}
                                required
                            />
                        </label>
                        <label>
                            Adresa de email:
                            <input
                                type="email"
                                name="email"
                                defaultValue={employeeToEdit ? employeeToEdit.email : ''}
                                onChange={handleEmployeeEditChange}
                                required
                            />
                        </label>
                        <label>
                            Departament:
                            <input
                                type="text"
                                name="department"
                                defaultValue={employeeToEdit ? employeeToEdit.department : ''}
                                onChange={handleEmployeeEditChange}
                                required
                            />
                        </label>
                        <label>
                            Funcție:
                            <input
                                type="text"
                                name="position"
                                defaultValue={employeeToEdit ? employeeToEdit.position : ''}
                                onChange={handleEmployeeEditChange}
                                required
                            />
                        </label>
                        <label>
                            Data angajării:
                            <input
                                type="text"
                                name="hire_date"
                                defaultValue={employeeToEdit ? employeeToEdit.hire_date : ''}
                                onChange={handleEmployeeEditChange}
                                required
                            />
                        </label>
                        <label>
                            Adresă:
                            <input
                                type="text"
                                name="address"
                                defaultValue={employeeToEdit ? employeeToEdit.address : ''}
                                onChange={handleEmployeeEditChange}
                                required
                            />
                        </label>
                        <button type="submit">Salvează modificările</button>
                        <button type="button" onClick={closeEditModal}>Închide</button>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default GestionareAngajati;
