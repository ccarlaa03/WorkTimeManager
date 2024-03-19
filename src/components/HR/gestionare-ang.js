import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import instance from '../../axiosConfig';

Modal.setAppElement('#root');

const GestionareAngajati = () => {
    const [employee, setEmployees] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [filter, setFilter] = useState({
        user: '',
        name: '',
        function: '',
        telephone_number: '',
        department: '',
        hireDate: '',
    });
    const [employeeToEdit, setEmployeeToEdit] = useState(null);
    const [modalEditOpen, setModalEditOpen] = useState(false);
    const [modalAddOpen, setModalAddOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState(false);
    const [hrCompanyId, setHrCompany] = useState(null);
    const employeesPerPage = 10;
    const getAccessToken = () => localStorage.getItem('access_token');
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
    };;
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewEmployee({ ...newEmployee, [name]: value });
    };

    useEffect(() => {
        const fetchHrCompany = async () => {
            const accessToken = getAccessToken();
            try {

                const hrResponse = await instance.get('/hr-dashboard/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                if (hrResponse.data && hrResponse.data.company_id) {
                    setHrCompany(hrResponse.data.company_id);
                    console.log('HR Company ID:', hrResponse.data.company_id);
                    return hrResponse.data.company_id;
                } else {
                    console.log('HR Company data:', hrResponse.data);
                    return null;
                }
            } catch (error) {
                console.error('Error fetching HR company data:', error.response ? error.response.data : error);
                return null;
            }
        };
        const fetchEmployees = async (setHrCompany) => {
            const accessToken = getAccessToken();
            try {
                const employeesResponse = await instance.get('/gestionare-ang/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                console.log('All Employees data:', employeesResponse.data);
                const employeesOfSameCompany = employeesResponse.data.filter(
                    (employee) => employee.company === setHrCompany
                );
                setEmployees(employeesOfSameCompany);
                console.log('Filtered Employees for company ID ' + setHrCompany + ':', employeesOfSameCompany);
            } catch (error) {
                console.error('Error fetching employees:', error.response ? error.response.data : error);
            }
        };
        const initializeData = async () => {
            const accessToken = getAccessToken();
            if (!accessToken) {
                console.log("No access token found. User is not logged in.");
                return;
            }
            const setHrCompany = await fetchHrCompany();
            if (setHrCompany) {
                await fetchEmployees(setHrCompany);
            }
        };

        initializeData();

    }, []);


    const creatEmployee = (newEmployee) => {
        setEmployees(prev => [...prev, newEmployee]);
        closeAddModal();
    };
    const removeEmployee = (id) => {
        setEmployees(prevEmployees => prevEmployees.filter(employee => employee.id !== id));
    }
    const saveEmployeeEdit = (editedEmployee) => {
        setEmployees(prev => prev.map(employee => employee.id === editedEmployee.id ? editedEmployee : employee));
        closeEditModal();
    };
    // CREATE
    const createEmployee = async (newEmployee) => {
        newEmployee.company_id = hrCompanyId;
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.log("No access token found. User is not logged in.");
            return;
        }
        try {
            const response = await instance.post('/create_employee/', newEmployee, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            console.log('Angajat adăugat cu succes:', response.data);
        } catch (error) {
            console.error('Eroare la adăugarea unui nou angajat:', error.response ? error.response.data : error.message);
        }
    };


    // UPDATE
    const updateEmployee = async (id, employeeData) => {
        try {
            const response = await axios.put(`http://localhost:8000/employees/update/${id}/`, employeeData, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json',
                },
            });
            setEmployees(prevEmployees => prevEmployees.map(employee => employee.id === id ? response.data : employee));
        } catch (error) {
            console.error('Error updating employee:', error.response.data);
        }
    };

    // DELETE
    const deleteEmployee = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/employees/delete/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                },
            });
            setEmployees(prevEmployees => prevEmployees.filter(employee => employee.id !== id));
        } catch (error) {
            console.error('Error deleting employee:', error.response.data);
        }
    };

    const handlePageChange = (selectedItem) => {
        setCurrentPage(selectedItem.selected);
    };


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
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

    const indexOfLastEmployee = (currentPage + 1) * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;

    const filteredEmployees = employee?.filter(employee => {
        const nameMatch = employee.name?.toLowerCase().includes(filter.name.toLowerCase());
        const functionMatch = employee.function?.toLowerCase().includes(filter.function.toLowerCase());
        const departmentMatch = employee.department?.toLowerCase().includes(filter.department.toLowerCase());
        const hireDateMatch = filter.hireDate ? new Date(employee.hire_date).getTime() === new Date(filter.hireDate).getTime() : true;

        return nameMatch && functionMatch && departmentMatch && hireDateMatch;
    });

    const handleSearch = () => {

    };


    const employeesOnCurrentPage = filteredEmployees.slice(
        currentPage * employeesPerPage,
        (currentPage + 1) * employeesPerPage
    );

    return (
        <div>
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
                    <br></br>
                    <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
                        <select
                            name="functie"
                            value={filter.function}
                            onChange={handleFilterChange}
                            className="select-style"
                        >
                            <option value="">Toate funcțiile</option>
                            <option value="Developer">Developer</option>
                            <option value="Manager">Manager</option>
                        </select>

                        <select
                            name="departament"
                            value={filter.department}
                            onChange={handleFilterChange}
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
                            onChange={handleFilterChange}
                            style={{ flex: 1 }}
                        />
                        <button onClick={handleSearch} className="buton">
                            Caută
                        </button>
                    </div>
                </div>
                <br></br>
                <table className="tabel">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nume</th>
                            <th>Număr de telefon</th>
                            <th>Adresa de email</th>
                            <th>Departament</th>
                            <th>Funcție</th>
                            <th>Prezența</th>
                            <th>Adresă</th>
                            <th>Data angajării</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employee.map((employee) => {
                            console.log('Rendering employee:', employee);
                            return (

                                <tr key={employee.user}>
                                    <td>{employee.user}</td>
                                    <td>
                                        <Link
                                            to={`/profil-employee/${employee.user}`}
                                            style={{ color: 'black', textDecoration: 'none', opacity: 0.7 }}
                                        >
                                            {employee.name}
                                        </Link>
                                    </td>

                                    <td>{employee.telephone_number}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.department}</td>
                                    <td>{employee.position}</td>
                                    <td>{employee.free_days}</td>
                                    <td>{employee.address}</td>
                                    <td>{employee.hire_date}</td>
                                    <td>
                                        <button className='buton' onClick={() => modalEditOpen(employee)}>Editează</button>
                                        <button className='buton' onClick={() => removeEmployee(employee.id)}>Șterge</button>
                                    </td>
                                </tr>
                            );
                        })}

                    </tbody>
                </table>

                <div className="button-container">

                    <Link to="/gestionare-concedii">
                        <button className="buton">Gestionare concedii</button>
                    </Link>

                    <button className="buton" onClick={openAddModal}>Adaugă angajat nou</button>

                    <Link to="/gestionare-prog">
                        <button className="buton">Gestionare program de lucru</button>
                    </Link>

                    <ReactPaginate
                        previousLabel={'Anterior'}
                        nextLabel={'Următorul'}
                        pageCount={Math.ceil(filteredEmployees.length / employeesPerPage)}
                        onPageChange={handlePageChange}
                        containerClassName={'pagination'}
                        activeClassName={'active'}
                    />

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
                    isOpen={modalEditOpen}
                    onRequestClose={openEditModal}
                    contentLabel="Editează angajat"
                    className="modal-content"
                >
                    <h2>Editează Angajat</h2>
                    {employeeToEdit && (
                        <form onSubmit={saveEmployeeEdit}>
                            <label>
                                Nume:
                                <input
                                    type="text"
                                    name="nume"
                                    defaultValue={employeeToEdit.name}
                                    required
                                />
                            </label>
                            <label>
                                Număr de telefon:
                                <input
                                    type="text"
                                    name="telefon"
                                    defaultValue={employeeToEdit.telephone}
                                    required
                                />
                            </label>
                            <label>
                                Adresa de email:
                                <input
                                    type="text"
                                    name="email"
                                    defaultValue={employeeToEdit.email}
                                    required
                                />
                            </label>
                            <label>
                                Departament:
                                <input
                                    type="text"
                                    name="departament"
                                    defaultValue={employeeToEdit.department}
                                    required
                                />
                            </label>
                            <label>
                                Funcție:
                                <input
                                    type="text"
                                    name="functie"
                                    defaultValue={employeeToEdit.position}
                                    required
                                />
                            </label>
                            <label>
                                Data angajării:
                                <input
                                    type="text"
                                    name="data"
                                    defaultValue={employeeToEdit.hire_date}
                                    required
                                />
                            </label>
                            <label>
                                Adresă:
                                <input
                                    type="text"
                                    name="adresa"
                                    defaultValue={employeeToEdit.address}
                                    required
                                />
                            </label>
                            <button type="submit">Salvează modificările</button>
                            <button type="button" onClick={closeEditModal}>Închide</button>
                        </form>
                    )}

                </Modal>
            </div>
        </div>
    );
};

export default GestionareAngajati;
