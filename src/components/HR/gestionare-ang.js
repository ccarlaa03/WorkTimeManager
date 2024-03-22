import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import instance from '../../axiosConfig';
import { AuthContext } from '../../AuthContext';
import { useAuth } from '../../AuthContext';

Modal.setAppElement('#root');

const GestionareAngajati = () => {
    const { user } = useContext(AuthContext);
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
    const [hrCompanyId, setHrCompany] = useState(null);
    const employeesPerPage = 10;
    const getAccessToken = () => localStorage.getItem('access_token');
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({

    });

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

    const handleEmployeeEditChange = (e) => {
        const { name, value } = e.target;
        setEmployeeToEdit((prevEmployee) => ({
            ...prevEmployee,
            [name]: value,
        }));
    };

    /// CREATE
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
                )
                );


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

                setEmployees(prevEmployees => prevEmployees.filter(employee => employee.user_id !== userId));
            }
        } catch (error) {
            console.error('Error deleting employee:', error.response ? error.response.data : error.message);
        }
    };


    const handlePageChange = (selectedItem) => {
        setCurrentPage(selectedItem.selected);
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


    const handleSearch = () => {
        const { name, position, department, hireDate } = filter;
    
        // Filtrăm angajații în funcție de criteriile specificate în filtru
        const filtered = employee.filter(employee => {
            const nameMatch = !name || (employee && employee.name && employee.name.toLowerCase().includes(name.toLowerCase()));
            const positionMatch = !position || (employee && employee.position && employee.position.toLowerCase().includes(position.toLowerCase()));
            const departmentMatch = !department || (employee && employee.department && employee.department.toLowerCase().includes(department.toLowerCase()));
            const hireDateMatch = !hireDate || (employee && employee.hire_date && new Date(employee.hire_date).getTime() === new Date(hireDate).getTime());
        
            return nameMatch && positionMatch && departmentMatch && hireDateMatch;
        });
        
    
        // Actualizăm lista filtrată de angajați pentru a reflecta rezultatul căutării
        setFilteredEmployees(filtered);
    
        // Dacă dorești să revii la prima pagină după căutare, poți reseta pagina curentă
        setCurrentPage(0);
    };
    

    const employeesOnCurrentPage = filteredEmployees ? filteredEmployees.slice(
        currentPage * employeesPerPage,
        (currentPage + 1) * employeesPerPage
    ) : [];
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };


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
                                        <button className='buton' onClick={() => openEditModal(employee)}>Editează</button>

                                        <button className='button' onClick={() => deleteEmployee(employee.user)}>Șterge</button>

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
