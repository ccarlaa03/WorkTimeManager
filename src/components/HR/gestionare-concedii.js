import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import instance from '../../axiosConfig';
import Cookies from 'js-cookie';
import ReactPaginate from 'react-paginate';
import DatePicker from 'react-datepicker';

Modal.setAppElement('#root');

const GestionareConcedii = () => {
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [AddModalOpen, setAddModalOpen] = useState(false);
    const [EditModalOpen, setEditModalOpen] = useState(false);
    const [selectedLeaveType, setSelectedLeaveType] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [leaveType, setLeaveType] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [reason, setReason] = useState('');
    const [modalError, setModalError] = useState('');
    const [hrCompanyId, setHrCompany] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({
        name: '',
        function: '',
        department: '',
        leaveType: '',
        startDate: '',
        endDate: ''
    });
    const [selectedDateRange, setSelectedDateRange] = useState([new Date(), new Date()]);
    const leavesPerPage = 6;
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();
    const getAccessToken = () => {
        const token = localStorage.getItem('access_token');
        console.log('AccessToken:', token);
        return token;
    };

    axios.defaults.xsrfCookieName = 'csrftoken';
    axios.defaults.xsrfHeaderName = 'X-CSRFToken';
    const csrfToken = Cookies.get('csrftoken');

    const LEAVE_TYPES = [
        { value: 'AN', label: 'Concediu anual' },
        { value: 'SI', label: 'Concediu medical' },
        { value: 'UP', label: 'Concediu fără plată' },
        { value: 'MA', label: 'Concediu de maternitate' },
        { value: 'PA', label: 'Concediu de paternitate' },
        { value: 'ST', label: 'Concediu de studii' },
    ];

    const statusMap = {
        'AC': 'Acceptat',
        'RE': 'Refuzat',
        'PE': 'În așteptare'
    };

    axios.interceptors.request.use(function (config) {
        const csrftoken = Cookies.get('csrftoken');
        config.headers['X-CSRFToken'] = csrftoken;
        return config;
    });

   // Funcția pentru preluarea concediilor
const fetchLeaves = async (accessToken, hrCompanyId, page = 0) => {
    if (!accessToken || !hrCompanyId) {
        console.error("Nu s-a găsit niciun token de acces sau ID Companie HR.");
        return;
    }

    const params = new URLSearchParams({
        company_id: hrCompanyId,
        leave_type: filter.leaveType,
        start_date: filter.startDate,
        end_date: filter.endDate,
        department: filter.department,
        page: page + 1  // API-urile RESTful încep de obicei de la 1
    }).toString();

    const url = `http://localhost:8000/gestionare-concedii/?${params}`;
    console.log(`Preluare concedii de la: ${url}`);

    try {
        const LeavesResponse = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        console.log('Concedii pentru randare:', leaves);

        console.log('Date concedii:', LeavesResponse.data);
        setLeaves(LeavesResponse.data.results.leaves || []);
        console.log('Date departamente:', LeavesResponse.data.departments);
        setDepartments(LeavesResponse.data.departments || []);

        setTotalPages(Math.ceil(LeavesResponse.data.count / leavesPerPage));
    } catch (error) {
        console.error('Eroare la preluarea concediilor:', error.response ? error.response.data : error);
    }
};


    useEffect(() => {
        const initializeData = async () => {
            const accessToken = getAccessToken();
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

                    await fetchLeaves(accessToken, hrCompanyId);
                } else {
                    console.log('HR Company data:', hrResponse.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error.response ? error.response.data : error);
            }
        };

        initializeData();
    }, []);

    const fetchDepartments = async () => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error("Nu a fost găsit niciun token de acces. Utilizatorul nu este autentificat.");
            return;
        }
        try {
            const response = await axios.get('http://localhost:8000/departments/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            console.log('Departamentele primite:', response.data.departments);
            setDepartments(response.data.departments || []);
        } catch (error) {
            console.error('Eroare la preluarea departamentelor:', error);
            setDepartments([]);
        }
    };



    useEffect(() => {
        fetchDepartments();
    }, []);


    // Funcția pentru obținerea angajaților dintr-un departament
    const fetchEmployees = async () => {
        if (!selectedDepartment) {
            console.error("Nu a fost selectat niciun departament.");
            return;
        }

        const url = `http://localhost:8000/hr/${hrCompanyId}/employees/?page_size=100`;
        console.log(`Obținerea angajaților din URL-ul: ${url}`);

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data && response.data.results) {
                setFilteredEmployees(response.data.results);
            } else {
                setFilteredEmployees([]);
            }
        } catch (error) {
            console.error('Eroare la obținerea angajaților:', error);
        }
    };

    // Folosește efectul pentru a obține angajații când se schimbă departamentul
    useEffect(() => {
        fetchEmployees();
    }, [selectedDepartment]);

    // Funcția pentru adăugarea unui concediu
    const handleAddLeave = async (e) => {
        e.preventDefault();
        console.log("Submit a fost declanșat");

        if (selectedEmployeeIds.length === 0) {
            console.error("Niciun angajat selectat.");
            return;
        }

        const leaveData = {
            users: selectedEmployeeIds,
            leave_type: selectedLeaveType,
            start_date: startDate ? moment(startDate).format('YYYY-MM-DD') : '',
            end_date: endDate ? moment(endDate).format('YYYY-MM-DD') : '',
            reason: reason,
        };

        console.log("Data trimisă la server:", leaveData);

        try {
            const accessToken = getAccessToken();
            const csrfToken = Cookies.get('csrftoken');
            const response = await axios.post('http://localhost:8000/leaves/', leaveData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });

            console.log('Concediul a fost adăugat cu succes:', response.data);
            setFilteredEmployees([]); // Resetează lista de angajați selectați
            setSelectedDepartment(''); // Resetează departamentul selectat
            setSelectedEmployeeIds([]); // Resetează angajații selectați
            setStartDate(null); // Resetează data de început
            setEndDate(null); // Resetează data de sfârșit
            setSelectedLeaveType(''); // Resetează tipul de concediu
            setReason(''); // Resetează motivul concediului
            CloseAddModal();
        } catch (error) {
            console.error('Eroare la crearea concediului:', error.response ? error.response.data : error);
            alert('Eroare: ' + (error.response ? error.response.data : error.message));
        }
    };



    // Funcția pentru gestionarea schimbării selecției angajaților
    const handleEmployeeSelectionChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
        setSelectedEmployeeIds(selectedOptions);
    };

    // Funcția pentru actualizarea unui concediu
    const handleUpdateLeave = async (e) => {
        e.preventDefault();

        if (!selectedLeave) {
            console.error('Niciun concediu selectat pentru editare.');
            return;
        }

        const accessToken = getAccessToken();

        if (!accessToken) {
            console.error("Nu s-a găsit niciun token de acces. Utilizatorul nu este autentificat.");
            return;
        }

        const updatedLeaveData = {
            ...selectedLeave,
            start_date: moment(selectedLeave.start_date).format('YYYY-MM-DD'),
            end_date: moment(selectedLeave.end_date).format('YYYY-MM-DD'),
            leave_type: selectedLeave.leave_type,
            status: selectedLeave.status,
        };

        try {
            const response = await axios.put(`http://localhost:8000/leaves/${selectedLeave.id}/`, updatedLeaveData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                console.log('Actualizarea concediului a fost reușită', response.data);
                setLeaves(prevLeaves => prevLeaves.map(leave => leave.id === selectedLeave.id ? response.data : leave));

                CloseEditModal();
            }
        } catch (error) {
            console.error('Eroare la actualizarea concediului:', error.response ? error.response.data : error);
        }
    };

    // Funcția pentru ștergerea unui concediu
    const handleDeleteLeave = async (leaveId) => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            console.error("Nu a fost găsit niciun token de acces. Utilizatorul nu este autentificat.");
            return;
        }
        try {
            console.log(`Trimitere cerere DELETE pentru leaveId: ${leaveId}`);
            const response = await axios.delete(`http://localhost:8000/leave_delete/${leaveId}/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('Răspuns de la server:', response);

            setLeaves(prevLeaves => prevLeaves.filter(leave => leave.id !== leaveId));
        } catch (error) {
            console.error('Eroare la ștergerea concediului:', error);
        }
    };

    // Funcția pentru deschiderea modalului de adăugare
    const OpenAddModal = () => {
        setAddModalOpen(true);
        resetForm();
    };

    // Funcția pentru închiderea modalului de editare
    const CloseEditModal = () => {
        setEditModalOpen(false);
        resetForm();
    };

    // Funcția pentru aprobarea concediului
    const handleApproveLeave = (leaveId, newStatus) => {
        setLeaves(leaves.map((leave) =>
            leave.id === leaveId ? { ...leave, status: newStatus } : leave
        ));
    };

    // Listele sărbătorilor publice
    const publicHolidays = [
        new Date('2024-01-01'),
        new Date('2024-04-01'),
    ];

    // Funcția pentru verificarea dacă o zi este sărbătoare publică
    const isPublicHoliday = (date) => {
        return publicHolidays.some(
            (holiday) =>
                holiday.getDate() === date.getDate() &&
                holiday.getMonth() === date.getMonth() &&
                holiday.getFullYear() === date.getFullYear()
        );
    };

    // Funcția pentru verificarea zilelor de concediu
    const checkLeave = (startDate, endDate) => {
        let totalDays = 0;
        for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
            if (!isPublicHoliday(d)) {
                totalDays++;
            }
        }
        return totalDays;
    };
    // Funcția pentru verificarea balanței de concediu a angajatului
    const checkLeaveBalance = (employeeId, leaveDuration) => {
        const employee = employees.find(emp => emp.id === employeeId);
        if (!employee) return false;
        return employee.leaveBalance >= leaveDuration;
    };

    // Funcția pentru verificarea suprapunerilor concediilor
    const checkOverlap = (startDate, endDate, department) => {
        const employeesOnLeave = leaves.filter((leave) => {
            const employee = employees.find(emp => emp.id === leave.employeeId && emp.department === department);
            if (!employee) return false;
            return (
                (new Date(leave.startDate) <= new Date(endDate)) &&
                (new Date(leave.endDate) >= new Date(startDate))
            );
        });
        return employeesOnLeave.length > 0;
    };

    // Funcția pentru resetarea formularului
    const resetForm = () => {
        setSelectedDepartment('');
        setEmployeeId('');
        setStartDate('');
        setEndDate('');
        setLeaveType('');
    };

    // Funcția pentru calcularea zilelor de concediu
    const calculateLeaveDays = (startDate, endDate) => {
        return Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    };

    // Funcția pentru deschiderea modalului de editare
    const OpenEditModal = (leave) => {
        setSelectedLeave(leave);
        setEditModalOpen(true);
    };

    // Funcția pentru obținerea etichetei tipului de concediu
    const getLeaveTypeLabel = (leaveTypeValue) => {
        const type = LEAVE_TYPES.find(type => type.value === leaveTypeValue);
        return type ? type.label : 'Nu este specificat tipul de concediu.';
    };

    // Funcția pentru salvarea concediului
    const handleSaveLeave = () => {
        if (selectedLeave) {
            const updatedLeaves = leaves.map((leave) => {
                if (leave.id === selectedLeave.id) {
                    return { ...leave };
                }
                return leave;
            });
            setLeaves(updatedLeaves);
        } else {
            setLeaves([...leaves, { ...selectedLeave, id: Date.now() }]);
        }

        if (checkOverlap(startDate, endDate, selectedDepartment)) {
            alert('Există deja un concediu în acest interval pentru un angajat.');
            return;
        }
        if (!checkLeaveBalance(employeeId, calculateLeaveDays(startDate, endDate))) {
            alert('Angajatul nu are suficientă balanță de concediu pentru intervalul selectat.');
            return;
        }
    };

    // Funcția pentru închiderea modalului de adăugare
    const CloseAddModal = () => {
        setAddModalOpen(false);
        resetForm();
    };

    // Funcția pentru schimbarea statusului concediului
    const leaveStatus = (leaveId, newStatus) => {
        if (leaveId === null) return;

        const updatedLeaves = leaves.map((leave) => {
            if (leave.id === leaveId) {
                return { ...leave, status: newStatus };
            }
            return leave;
        });

        setLeaves(updatedLeaves);
    };

    // Funcția pentru căutarea concediilor
    const handleSearch = async () => {
        setCurrentPage(0);
        await fetchLeaves(getAccessToken(), hrCompanyId);
    };

    // Funcția pentru gestionarea schimbării filtrelor
    const handleFilterChange = ({ target: { name, value } }) => {
        setFilter(prevFilter => ({
            ...prevFilter,
            [name]: value
        }));
    };

    // Funcția pentru schimbarea paginii
    const handlePageChange = async ({ selected }) => {
        setCurrentPage(selected);
        await fetchLeaves(getAccessToken(), hrCompanyId, selected);
    };


    // Funcția pentru gestionarea schimbării intervalului de date
    const handleDateRangeChange = (dates) => {
        const [start, end] = dates;
        setSelectedDateRange([start, end]);
    };

    return (
        <div>
            <div className="container-dashboard">
                <h1>Gestionare concedii</h1>
                <div className="filter-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', width: '83%', gap: '10px', alignItems: 'center' }}>
                        <select
                            name="leaveType"
                            value={filter.leaveType}
                            onChange={handleFilterChange}
                        >
                            <option value="">Selectează tipul de concediu</option>
                            {LEAVE_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            name="startDate"
                            value={filter.startDate}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="date"
                            name="endDate"
                            value={filter.endDate}
                            onChange={handleFilterChange}
                        />
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
                <div className="table-container">
                    <div className='card-curs'>
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nume</th>
                                    <th>Departament</th>
                                    <th>Tipul de concediu</th>
                                    <th>Data început</th>
                                    <th>Data sfârșit</th>
                                    <th>Status</th>
                                    <th>Acțiuni</th>
                                </tr>
                            </thead>

                            <tbody>

                                {leaves.length > 0 ? leaves.map(leave => (
                                    <tr key={leave.id}>
                                        <td>{leave.id}</td>
                                        <td>
                                            <Link
                                                to={`/angajat-profil/${leave.user}`}
                                                style={{ color: 'black', textDecoration: 'none', opacity: 0.7 }}
                                            >
                                                {leave.employee_name}
                                            </Link>
                                        </td>
                                        <td>{leave.employee_department}</td>
                                        <td>{getLeaveTypeLabel(leave.leave_type)}</td>
                                        <td>{moment(leave.start_date).format('YYYY-MM-DD')}</td>
                                        <td>{moment(leave.end_date).format('YYYY-MM-DD')}</td>
                                        <td>{statusMap[leave.status]}</td>
                                        <td>
                                            <button className='buton' onClick={() => OpenEditModal(leave)}>Editare</button>
                                            <button className='buton' onClick={() => handleDeleteLeave(leave.id)}>Șterge</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="9">Nu există concedii.</td>
                                    </tr>
                                )}
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

                        <div className="button-container">
                            <button className='buton' onClick={OpenAddModal}>Adaugă concediu</button>
                        </div>
                    </div>
                </div>


                <Modal
                    isOpen={AddModalOpen}
                    onRequestClose={CloseAddModal}
                    title="Înregistrează un concediu"
                    buttonText="Adaugă"
                    handleSubmit={handleAddLeave}
                    className="modal-content"
                >
                    <h2>Înregistrează un concediu</h2>
                    <form onSubmit={handleAddLeave}>
                        <div className="form-group">
                            <label>Departament</label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                <option value="">Selectează departamentul</option>
                                <option value="IT">IT</option>
                                <option value="Marketing">Marketing</option>
                            </select>

                        </div>

                        <div className="form-group">
                            <label htmlFor="employee">Angajat:</label>
                            <select
                                multiple
                                value={selectedEmployeeIds}
                                onChange={handleEmployeeSelectionChange}
                                disabled={!selectedDepartment}
                            >
                                {filteredEmployees.filter(emp => emp.department === selectedDepartment).map((employee) => (
                                    <option key={employee.user} value={employee.user}>
                                        {employee.name} - {employee.department} ({employee.user})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Intervalul de timp:</label>
                            <DatePicker
                                selectsRange
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(dates) => {
                                    const [start, end] = dates;
                                    setStartDate(start);
                                    setEndDate(end);
                                }}
                                className="select-style"
                                dateFormat="yyyy-MM-dd"
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="leaveType">Tip concediu:</label>
                            <select
                                className="select-style"
                                id="leaveType"
                                value={selectedLeaveType}
                                onChange={(e) => setSelectedLeaveType(e.target.value)}
                            >
                                <option value="">Selectează tipul de concediu</option>
                                {LEAVE_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>



                        {modalError && <p className="error">{modalError}</p>}

                        <div className="button-container">
                            <button type="submit" className="buton">Adaugă</button>
                            <button type="button" className="buton" onClick={CloseAddModal}>
                                Închide
                            </button>
                        </div>
                    </form>
                </Modal>


                <Modal
                    isOpen={EditModalOpen}
                    onRequestClose={CloseEditModal}
                    contentLabel="Edit Leave"
                    className="modal-content"
                >
                    <h2>Editare</h2>
                    <form onSubmit={handleUpdateLeave}>

                        <div className="form-row">

                            <div className="form-group">
                                <label htmlFor="employeeName">Nume angajat:</label>
                                <input
                                    type="text"
                                    id="employeeName"
                                    className="select-style"
                                    value={selectedLeave?.employee_name || ''}
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="department">Departament:</label>
                                <input
                                    type="text"
                                    id="department"
                                    className="select-style"
                                    value={selectedLeave?.employee_department || ''}
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="startDate">Data de început:</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    className="select-style"
                                    value={selectedLeave?.start_date || ''}
                                    onChange={(e) => setSelectedLeave({ ...selectedLeave, start_date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="endDate">Data de sfârșit:</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    className="select-style"
                                    value={selectedLeave?.end_date || ''}
                                    onChange={(e) => setSelectedLeave({ ...selectedLeave, end_date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="leaveType">Tipul de concediu:</label>
                                <select
                                    className="select-style"
                                    value={selectedLeave?.leave_type || ''}
                                    onChange={(e) => setSelectedLeave({ ...selectedLeave, leave_type: e.target.value })}
                                >
                                    <option value="">Toate tipurile</option>
                                    {LEAVE_TYPES.map((tip, index) => (
                                        <option key={index} value={tip.value}>{tip.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Status:</label>
                                <select
                                    className="select-style"
                                    id="status"
                                    value={selectedLeave?.status || ''}
                                    onChange={(e) => setSelectedLeave({ ...selectedLeave, status: e.target.value })}
                                >
                                    <option value="PE">În așteptare</option>
                                    <option value="AC">Aprobat</option>
                                    <option value="RE">Respins</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="is_approved">Aprobare:</label>
                                <select
                                    className="select-style"
                                    id="is_approved"
                                    value={selectedLeave?.is_approved ? 'Da' : 'Nu'}
                                    onChange={(e) => setSelectedLeave({ ...selectedLeave, is_approved: e.target.value === 'Da' })}
                                >
                                    <option value="Da">Da</option>
                                    <option value="Nu">Nu</option>
                                </select>

                            </div>

                        </div>
                        <div className="button-container">
                            <button className="buton" type="submit">Salvează</button>
                            <button className="buton" onClick={CloseEditModal}>Închide</button>
                        </div>
                    </form>
                </Modal>


            </div>
        </div>
    );
};

export default GestionareConcedii;
