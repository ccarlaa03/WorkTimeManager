import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import instance from '../../axiosConfig';
import Cookies from 'js-cookie';

Modal.setAppElement('#root');

const localizer = momentLocalizer(moment);

const GestionareConcedii = () => {
    const [renderData, setRenderData] = useState([]);

    const [employees, setEmployees] = useState([]);
    const [department, setDepartment] = useState([]);
    const [leaveType, setLeaveType] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [AddModalOpen, setAddModalOpen] = useState(false);
    const [EditModalOpen, setEditModalOpen] = useState(false);
    const [selectedLeaveType, setSelectedLeaveType] = useState('');

    const [employeeId, setEmployeeId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [reason, setReason] = useState('');
    const [modalError, setModalError] = useState('');
    const [events, setEvents] = useState([]);
    const [hrCompanyId, setHrCompany] = useState(null);
    const navigate = useNavigate();
    const getAccessToken = () => localStorage.getItem('access_token');
    axios.defaults.xsrfCookieName = 'csrftoken';
    axios.defaults.xsrfHeaderName = 'X-CSRFToken';
    const csrfToken = Cookies.get('csrftoken');
    const [leaveForm, setLeaveForm] = useState({
        employeeId: '',
        startDate: '',
        endDate: '',
        leaveType: '',
        reason: '',
    });

    const LEAVE_TYPES = [
        { value: 'AN', label: 'Annual Leave' },
        { value: 'SI', label: 'Sick Leave' },
        { value: 'UP', label: 'Unpaid Leave' },
        { value: 'MA', label: 'Maternity Leave' },
        { value: 'PA', label: 'Paternity Leave' },
        { value: 'ST', label: 'Study Leave' },
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

                    const employeeResponse = await axios.get('/gestionare-ang/', {
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    });
                    console.log('All Employees:', employeeResponse.data);
                    const filteredEmployees = employeeResponse.data.filter(employee => employee.company === hrCompanyId);
                    setFilteredEmployees(filteredEmployees);

                    const LeavesResponse = await instance.get(`/gestionare-concedii/?company_id=${hrCompanyId}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    });
                    console.log('Leaves data:', LeavesResponse.data);
                    setLeaves(LeavesResponse.data);
                } else {
                    console.log('HR Company data:', hrResponse.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error.response ? error.response.data : error);
            }
        };

        initializeData();
    }, []);

    //CREATE
    const handleAddLeave = async (e) => {
        e.preventDefault();
        const leaveData = {
            user: selectedEmployee,
            leave_type: selectedLeaveType,
            start_date: startDate,
            end_date: endDate,
            reason: reason,
            // Set `is_leave` and `is_approved` as needed
        };
        try {
            const accessToken = getAccessToken();
            const response = await axios.post('/leaves/', leaveData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setLeaves(prevLeaves => [...prevLeaves, response.data]);
        } catch (error) {
            console.error('Error creating leave:', error);
        }
    };

    //UPDATE

    const handleUpdateLeave = async (leaveId, leaveData) => {
        try {
            const accessToken = getAccessToken();
            const response = await axios.put(`/leaves/${leaveId}/`, leaveData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            // Update leaves state accordingly
            setLeaves(prevLeaves => prevLeaves.map(leave => leave.id === leaveId ? response.data : leave));
        } catch (error) {
            console.error('Error updating leave:', error);
        }
    };


    //DELETE
    const handleDeleteLeave = async (leaveId) => {
        try {
            const accessToken = getAccessToken();
            await axios.delete(`/leave_delete/${leaveId}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            // Update your state to remove the leave
            setLeaves(prevLeaves => prevLeaves.filter(leave => leave.id !== leaveId));
        } catch (error) {
            console.error('Error deleting leave:', error);
        }
    };
    const OpenAddModal = () => {
        setAddModalOpen(true);
        resetForm();
    };

    // Handler for updating filters
    const handleFilterChange = (newFilter) => {
        // Update filter state
    };

    const CloseEditModal = () => {
        setEditModalOpen(false);
        resetForm();
    };


    const navigateToProfile = (employeeId) => {
        navigate(`/user-profile/${employeeId}`);
    };


    const holidays = [
        new Date('2024-01-01'), // New Year
        new Date('2024-04-01'), // Easter
        // ... other holidays
    ];

    // Function to check if a date is a holiday
    const isHoliday = (date) => {
        // Check if the date is in the holidays array
    };



    const handleApproveLeave = (leaveId, newStatus) => {
        setLeaves(leaves.map((leave) =>
            leave.id === leaveId ? { ...leave, status: newStatus } : leave
        ));
    };

    const publicHolidays = [
        new Date('2024-01-01'), // New Year
        new Date('2024-04-01'), // Easter
        // ... other public holidays
    ];

    // Function to check if a specific date is a public holiday
    const isPublicHoliday = (date) => {
        return publicHolidays.some(
            (holiday) =>
                holiday.getDate() === date.getDate() &&
                holiday.getMonth() === date.getMonth() &&
                holiday.getFullYear() === date.getFullYear()
        );
    };

    // Function to check leave excluding public holidays
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
    // Function to check if there's overlapping leave for an employee
    const checkOverlap = (startDate, endDate, department) => {
        // Assuming each employee has a 'leaveBalance' and a 'department'
        const employeesOnLeave = leaves.filter((leave) => {
            const employee = employees.find(emp => emp.id === leave.employeeId && emp.department === department);
            if (!employee) return false;
            return (
                (new Date(leave.startDate) <= new Date(endDate)) &&
                (new Date(leave.endDate) >= new Date(startDate))
            );
        });

    }
    // Function to reset the form
    const resetForm = () => {
        setSelectedDepartment('');
        setEmployeeId('');
        setStartDate('');
        setEndDate('');
        setLeaveType('');
    };

    // Function to calculate the number of leave days
    const calculateLeaveDays = (startDate, endDate) => {
        return Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    };

    // Function to get leave history for an employee
    const getLeaveHistory = (employeeId, leaves, totalLeaveDays) => {
        // Filter leaves for a specific employee
        const employeeLeaves = leaves.filter(leave => leave.employeeId === employeeId);

        // Calculate the total number of leave days taken
        const usedLeaveDays = employeeLeaves.reduce((total, leave) => {
            return total + calculateLeaveDays(leave.startDate, leave.endDate);
        }, 0);

        // Calculate the leave balance
        const leaveBalance = totalLeaveDays - usedLeaveDays;

        return { leaves: employeeLeaves, leaveBalance };
    };

    // Function to handle opening edit modal
    const OpenEditModal = (leave) => {
        setEditModalOpen(true);
        setSelectedLeave(leave);
        setSelectedDepartment(leave.department);
        if (leave) {
            const backdrop = document.querySelector('.backdrop');
            if (backdrop) {
                backdrop.style.display = 'block';
            }
            // If editing an existing leave, populate states with its data
            const employee = employees.find(employee => employee.user === leave.employeeId);
            setSelectedDepartment(employee ? employee.department : '');
            setEmployeeId(leave.employeeId);
            setLeaveType(leave.leaveType);
            setStartDate(leave.startDate);
            setEndDate(leave.endDate);
            setSelectedLeave(leave);
            setIsEditing(true);
        } else {
            // For adding, reset the form and indicate it's not editing
            resetForm();
            setSelectedLeave(null);
            setIsEditing(false);
        }
        setEditModalOpen(true);
    };

    // Function to save leave
    const handleSaveLeave = () => {
        if (selectedLeave) {
            // Modify an existing leave
            const updatedLeaves = leaves.map((leave) => {
                if (leave.id === selectedLeave.id) {
                    return { ...leave };
                }
                return leave;
            });
            setLeaves(updatedLeaves);
        } else {
            // Add a new leave
            setLeaves([...leaves, { ...selectedLeave, id: Date.now() }]); // id is just a placeholder
        }

        if (checkOverlap(startDate, endDate, selectedDepartment)) {
            alert('There is already a leave in this interval for an employee.');
            return;
        }

        // Check if the employee has leave balance
        if (!checkLeaveBalance(employeeId, calculateLeaveDays(startDate, endDate))) {
            alert('The employee does not have enough leave balance for the selected interval.');
            return;
        }
    };
  

    const CloseAddModal = () => {
        setAddModalOpen(false);
        resetForm();
    };
    // Filtering leaves before display
    const filteredLeaves = leaves.filter(leave => {
        const employee = employees.find(employee => employee.user === leave.employeeId);
        if (!employee) return false; // If employee doesn't exist, don't include the leave

        // Apply filters if they are set
        const filterByDepartment = selectedDepartment ? employee.department === selectedDepartment : true;
        const filterByLeaveType = leaveType ? leave.leaveType === leaveType : true;
        const filterByName = selectedEmployee ? employee.name.toLowerCase().includes(selectedEmployee.toLowerCase()) : true;


        return filterByDepartment && filterByLeaveType && filterByName;
    });

    // Function to handle changing leave status
    const handleChangeLeaveStatus = (leaveId, newStatus) => {
        if (leaveId === null) return;

        const updatedLeaves = leaves.map((leave) => {
            if (leave.id === leaveId) {
                return { ...leave, status: newStatus };
            }
            return leave;
        });

        setLeaves(updatedLeaves);
    };
    const handleSearch = () => {
        // logica pentru căutare
    };
    const filter = {};
    return (
        <div>
            <div className="container-dashboard">
                <h1>Gestionare concedii</h1>
                <div className="filter-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Caută după nume"
                        value={filter.nume}
                        onChange={(e) => handleFilterChange({ ...filter, nume: e.target.value })}
                    />
                    <button onClick={handleSearch} className="buton">
                        Caută
                    </button>
                    <select
                        className="select-style"
                        value={filter.department}
                        onChange={(e) => handleFilterChange({ ...filter, department: e.target.value })}
                    >
                        <option value="">Toate departamentele</option>
                        {department.map((dep, index) => (
                            <option key={index} value={dep}>{dep}</option>
                        ))}
                    </select>
                    <select
                        className="select-style"
                        value={filter.leaveType}
                        onChange={(e) => handleFilterChange({ ...filter, leaveType: e.target.value })}
                    >
                        <option value="">Toate tipurile</option>
                        {leaveType.map((tip, index) => (
                            <option key={index} value={tip}>{tip}</option>
                        ))}
                    </select>
                    <select
                        id="status-filter"
                        className="select-style"
                        value={filter.status}
                        onChange={(e) => handleFilterChange({ ...filter, status: e.target.value })}
                    >
                        <option value="">Toate stările</option>
                        <option value="În așteptare">În așteptare</option>
                        <option value="Acceptat">Acceptat</option>
                        <option value="Respins">Respins</option>
                    </select>

                </div>
                <br></br>
                <table className="tabel column">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nume</th>
                            <th>Departament</th>
                            <th>Tipul de concediu</th>
                            <th>Data început</th>
                            <th>Data sfârșit</th>
                            <th>Status</th>
                            <th>Aprobare</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length > 0 ? (
                            leaves.map((leave) => (
                                <tr key={leave.id}>
                                    <td>{leave.user}</td>
                                    <td onClick={() => navigate(`/user-profile/${leave.user}`)} style={{ cursor: 'pointer' }}>
                                        {leave.employee_name}
                                    </td>
                                    <td>{leave.employee_department}</td>
                                    <td>{leave.leave_type}</td>
                                    <td>{moment(leave.start_date).format('YYYY-MM-DD')}</td>
                                    <td>{moment(leave.end_date).format('YYYY-MM-DD')}</td>
                                    <td>{statusMap[leave.status]}</td>
                                    <td>{leave.is_approved ? 'Da' : 'Nu'}</td>
                                    <td>
                                        <button className='button' onClick={() => OpenEditModal(leave)}>Editare</button>
                                        <button className='button' onClick={() => handleDeleteLeave(leave.id)}>Șterge</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">No data available</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <Modal
                    isOpen={AddModalOpen}
                    onRequestClose={CloseAddModal}
                    className="modal-content"
                >
                    <h2>Add Leave Form</h2>
                    <form onSubmit={handleAddLeave}>
                        <div className="form-group">
                            <label htmlFor="employee">Employee:</label>
                            <select
                                id="employee"
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                            >
                                <option value="">Select an employee</option>
                                {employees.map((employee) => (
                                    <option key={employee.user} value={employee.user}>{employee.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="leaveType">Leave Type:</label>
                            <select
                                className="select-style"
                                id="leaveType"
                                value={selectedLeaveType}
                                onChange={(e) => setSelectedLeaveType(e.target.value)}
                            >
                                <option value="">Select a Leave Type</option>
                                {LEAVE_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>

                        </div>
                        <div className="form-group">
                            <label htmlFor="startDate">Start Date:</label>
                            <input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate">End Date:</label>
                            <input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reason">Reason:</label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        {modalError && <p className="error">{modalError}</p>}
                        <div className="button-container">
                            <button className="button" type="submit">Adaugă</button>
                            <button className="button" type="button" onClick={CloseAddModal}>Închide</button>
                        </div>
                    </form>
                </Modal>

                <Modal
                    isOpen={EditModalOpen}
                    onRequestClose={CloseEditModal}
                    contentLabel="Edit Leave"
                    className="modal-content"
                >
                    <h2>Edit Leave</h2>
                    <form onSubmit={handleSaveLeave}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="department">Department:</label>
                                <select
                                    className="select-style"
                                    id="department"
                                    value={selectedDepartment}
                                    onChange={(e) => {
                                        setSelectedDepartment(e.target.value);
                                        setEmployeeId('');
                                    }}
                                >
                                    <option value="">Select a department</option>
                                    {department.map((dep) => (
                                        <option key={dep} value={dep}>{dep}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="employee">Employee:</label>
                                <select
                                    className="select-style"
                                    id="employee"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    disabled={!selectedDepartment}
                                >
                                    <option value="">Select an employee</option>
                                    {employees
                                        .filter(emp => emp.department === selectedDepartment)
                                        .map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="startDate">Start Date:</label>
                                <input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endDate">End Date:</label>
                                <input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="status">Status:</label>
                                <select
                                    className="select-style"
                                    id="status"
                                    value={selectedLeave ? selectedLeave.status : ''}
                                    onChange={(e) => handleChangeLeaveStatus(selectedLeave ? selectedLeave.id : null, e.target.value)}
                                    disabled={!selectedLeave}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="leaveType">Leave Type:</label>
                                <select
                                    className="select-style"
                                    id="leaveType"
                                    value={selectedLeaveType}
                                    onChange={(e) => setSelectedLeaveType(e.target.value)}
                                >
                                    <option value="">Select a Leave Type</option>
                                    {LEAVE_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>



                            </div>
                        </div>

                        <div className="button-container">
                            <button className="button" type="submit">Save</button>
                            <button className="button" type="button" onClick={CloseEditModal}>Close</button>
                        </div>
                    </form>
                </Modal>

                <div class="button-container">
                    <button className='buton' onClick={OpenAddModal}>Adaugă concediu</button>
                </div>


                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                />


            </div>
        </div>

    );

};

export default GestionareConcedii;
