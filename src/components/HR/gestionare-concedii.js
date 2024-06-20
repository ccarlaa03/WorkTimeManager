import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Link } from 'react-router-dom';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import instance from '../../axiosConfig';
import Cookies from 'js-cookie';
import ReactPaginate from 'react-paginate';

Modal.setAppElement('#root');

const localizer = momentLocalizer(moment);

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

    const leavesPerPage = 6;
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();
    const getAccessToken = () => localStorage.getItem('access_token');
    axios.defaults.xsrfCookieName = 'csrftoken';
    axios.defaults.xsrfHeaderName = 'X-CSRFToken';
    const csrfToken = Cookies.get('csrftoken');

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

    axios.interceptors.request.use(function (config) {
        const csrftoken = Cookies.get('csrftoken');
        config.headers['X-CSRFToken'] = csrftoken;
        return config;
    });

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

    const fetchLeaves = async (accessToken, hrCompanyId) => {
        if (!accessToken || !hrCompanyId) {
            console.error("No access token or HR Company ID found.");
            return;
        }

        const params = new URLSearchParams({
            company_id: hrCompanyId,
            leave_type: filter.leaveType,
            start_date: filter.startDate,
            end_date: filter.endDate,
            department: filter.department
        }).toString();

        const url = `http://localhost:8000/gestionare-concedii/?${params}`;
        console.log(`Fetching leaves from: ${url}`);

        try {
            const LeavesResponse = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            console.log('Leaves to render:', leaves);

            console.log('Leaves data:', LeavesResponse.data);
            setLeaves(LeavesResponse.data.results.leaves || []);
            console.log('Departments data:', LeavesResponse.data.departments);
            setDepartments(LeavesResponse.data.departments || []);

            setTotalPages(Math.ceil(LeavesResponse.data.count / leavesPerPage));
        } catch (error) {
            console.error('Error fetching leaves:', error.response ? error.response.data : error);
        }
    }

    useEffect(() => {
        if (hrCompanyId) {
            fetchLeaves();
        }
    }, [hrCompanyId, currentPage, filter]);


    //CREATE
    const handleAddLeave = async (e) => {
        e.preventDefault();
        console.log("Submit was triggered");

        if (selectedEmployeeIds.length === 0) {
            console.error("No employees selected.");
            return;
        }

        const leaveData = {
            users: selectedEmployeeIds,
            leave_type: selectedLeaveType,
            start_date: moment(startDate).format('YYYY-MM-DD'),
            end_date: moment(endDate).format('YYYY-MM-DD'),
            reason: reason,
        };

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

            console.log('Leave added successfully:', response.data);
            setLeaves(prevLeaves => [...prevLeaves, response.data]);
            CloseAddModal();
        } catch (error) {
            console.error('Error creating leave:', error.response ? error.response.data : error);
            alert('Error: ' + (error.response ? error.response.data : error.message));
        }
    };

    const handleEmployeeSelectionChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
        setSelectedEmployeeIds(selectedOptions);
    };

    // UPDATE
    const handleUpdateLeave = async (e) => {
        e.preventDefault();

        if (!selectedLeave) {
            console.error('No leave selected for editing.');
            return;
        }

        const accessToken = getAccessToken();

        if (!accessToken) {
            console.error("No access token found. User is not logged in.");
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
                console.log('Leave update successful', response.data);
                setLeaves(prevLeaves => prevLeaves.map(leave => leave.id === selectedLeave.id ? response.data : leave));

                CloseEditModal();
            }
        } catch (error) {
            console.error('Error updating leave:', error.response ? error.response.data : error);
        }
    };

    //DELETE
    const handleDeleteLeave = async (leaveId) => {
        try {
            const accessToken = getAccessToken();
            await axios.delete(`/leave_delete/${leaveId}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            setLeaves(prevLeaves => prevLeaves.filter(leave => leave.id !== leaveId));
        } catch (error) {
            console.error('Error deleting leave:', error);
        }
    };
    const OpenAddModal = () => {
        setAddModalOpen(true);
        resetForm();
    };

    const CloseEditModal = () => {
        setEditModalOpen(false);
        resetForm();
    };

    const handleApproveLeave = (leaveId, newStatus) => {
        setLeaves(leaves.map((leave) =>
            leave.id === leaveId ? { ...leave, status: newStatus } : leave
        ));
    };

    const publicHolidays = [
        new Date('2024-01-01'),
        new Date('2024-04-01'),
    ];

    const isPublicHoliday = (date) => {
        return publicHolidays.some(
            (holiday) =>
                holiday.getDate() === date.getDate() &&
                holiday.getMonth() === date.getMonth() &&
                holiday.getFullYear() === date.getFullYear()
        );
    };

    const checkLeave = (startDate, endDate) => {
        let totalDays = 0;
        for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
            if (!isPublicHoliday(d)) {
                totalDays++;
            }
        }
        return totalDays;
    };

    const checkLeaveBalance = (employeeId, leaveDuration) => {
        const employee = employees.find(emp => emp.id === employeeId);
        if (!employee) return false;
        return employee.leaveBalance >= leaveDuration;
    };

    const checkOverlap = (startDate, endDate, department) => {
        const employeesOnLeave = leaves.filter((leave) => {
            const employee = employees.find(emp => emp.id === leave.employeeId && emp.department === department);
            if (!employee) return false;
            return (
                (new Date(leave.startDate) <= new Date(endDate)) &&
                (new Date(leave.endDate) >= new Date(startDate))
            );
        });
    };

    const resetForm = () => {
        setSelectedDepartment('');
        setEmployeeId('');
        setStartDate('');
        setEndDate('');
        setLeaveType('');
    };

    const calculateLeaveDays = (startDate, endDate) => {
        return Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    };

    const OpenEditModal = (leave) => {
        setSelectedLeave(leave);
        setEditModalOpen(true);
    };

    const getLeaveTypeLabel = (leaveTypeValue) => {
        const type = LEAVE_TYPES.find(type => type.value === leaveTypeValue);
        return type ? type.label : 'Nu este specificat tipul de concediu.';
    };

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
            alert('There is already a leave in this interval for an employee.');
            return;
        }
        if (!checkLeaveBalance(employeeId, calculateLeaveDays(startDate, endDate))) {
            alert('The employee does not have enough leave balance for the selected interval.');
            return;
        }
    };

    const CloseAddModal = () => {
        setAddModalOpen(false);
        resetForm();
    };

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

    const handleSearch = async () => {
        setCurrentPage(0);
        await fetchLeaves(getAccessToken(), hrCompanyId);
    };

    const handleFilterChange = ({ target: { name, value } }) => {
        setFilter(prevFilter => ({
            ...prevFilter,
            [name]: value
        }));
    };

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
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
                    className="modal-content"
                    handleSubmit={handleAddLeave}
                >
                    <h2>Înregistrează un concediu</h2>
                    <form onSubmit={handleAddLeave}>
                        <div className="form-group">
                            <label htmlFor="employee">Angajat:</label>
                            <select
                                multiple
                                value={selectedEmployeeIds}
                                onChange={handleEmployeeSelectionChange}
                                className="select-style"
                            >
                                {filteredEmployees.map((employee) => (
                                    <option key={employee.user} value={employee.user}>
                                        {employee.name} - {employee.department} ({employee.user})
                                    </option>
                                ))}
                            </select>
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

                        <div className="form-group">
                            <label htmlFor="startDate">Data început:</label>
                            <input
                                id="startDate"
                                type="date"
                                className="select-style"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="endDate">Data sfârșit:</label>
                            <input
                                id="endDate"
                                type="date"
                                className="select-style"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="status">Stare:</label>
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

                        {modalError && <p className="error">{modalError}</p>}

                        <div className="button-container">
                            <button className="buton" type="submit">Adaugă</button>
                            <button className="buton" type="button" onClick={CloseAddModal}>Închide</button>
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
