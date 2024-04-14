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
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [department, setDepartment] = useState([]);
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
    const [events, setEvents] = useState([]);
    const [hrCompanyId, setHrCompany] = useState(null);
    const [filteredLeaves, setFilteredLeaves] = useState(leaves);
    const navigate = useNavigate();
    const getAccessToken = () => localStorage.getItem('access_token');
    axios.defaults.xsrfCookieName = 'csrftoken';
    axios.defaults.xsrfHeaderName = 'X-CSRFToken';
    const csrfToken = Cookies.get('csrftoken');
    const [displayedLeaves, setDisplayedLeaves] = useState(leaves);

    const [filter, setFilter] = useState({
        nume: '',
        department: '',
        leaveType: '',
        status: '',
    });
    const departments = ["IT", "Marketing", "HR", "Contabilitate"];

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
        console.log("Submit was triggered");

        if (selectedEmployeeIds.length === 0) {
            console.error("No employees selected.");
            return;
        }

        // Presupunem că `selectedEmployeeIds` este un array de string-uri cu ID-uri de angajați
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


    const navigateToProfile = (employeeId) => {
        navigate(`/user-profile/${employeeId}`);
    };


    const holidays = [
        new Date('2024-01-01'),
        new Date('2024-04-01'),

    ];


    const isHoliday = (date) => {

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

    }

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


    const getLeaveHistory = (employeeId, leaves, totalLeaveDays) => {

        const employeeLeaves = leaves.filter(leave => leave.employeeId === employeeId);


        const usedLeaveDays = employeeLeaves.reduce((total, leave) => {
            return total + calculateLeaveDays(leave.startDate, leave.endDate);
        }, 0);

        const leaveBalance = totalLeaveDays - usedLeaveDays;

        return { leaves: employeeLeaves, leaveBalance };
    };


    const OpenEditModal = (leave) => {
        setSelectedLeave(leave);
        setEditModalOpen(true);
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

    const handleFilterChange = (updatedFilters) => {
        setFilter(updatedFilters);
    };


    const handleSearch = () => {
        const filteredResults = leaves.filter(leave => {
          // Find the corresponding employee for the leave entry
          const employee = employees.find(emp => emp.user_id === leave.user_id); // Ensure the user_id fields match your database and JSON structure
          if (!employee) return false; // Skip the leave if the employee isn't found
      
          // Filter conditions
          const matchesName = filter.nume ? employee.name.toLowerCase().includes(filter.nume.toLowerCase()) : true;
          const matchesDepartment = filter.department ? employee.department === filter.department : true;
          const matchesLeaveType = filter.leaveType ? leave.leave_type === filter.leaveType : true;
          const matchesStatus = filter.status ? leave.status === filter.status : true;
      
          // Return true if all conditions are met
          return matchesName && matchesDepartment && matchesLeaveType && matchesStatus;
        });
      
        // Update the state with the filtered results
        setFilteredLeaves(filteredResults);
      };
      

    return (
        <div>
            <div className="container-dashboard">
                <h1>Gestionare concedii</h1>
                <div className="filter-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Caută după nume"
                        value={filter.name}
                        onChange={(e) => handleFilterChange({ ...filter, name: e.target.value })}
                    />
                    <button onClick={handleSearch}>Caută</button>
                    <select
                        className="select-style"
                        value={filter.department}
                        onChange={(e) => handleFilterChange({ ...filter, department: e.target.value })}
                    >
                        <option value="">Toate departamentele</option>
                        {departments.map((department) => (
                            <option key={department} value={department}>{department}</option>
                        ))}
                    </select>

                    <select
                        className="select-style"
                        value={filter.leaveType}
                        onChange={(e) => handleFilterChange({ ...filter, leaveType: e.target.value })}
                    >
                        <option value="">Toate tipurile</option>
                        {LEAVE_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
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
                                    <td onClick={() => navigate(`/angajat-profil/${leave.user}`)} style={{ cursor: 'pointer' }}>
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
                                <td colSpan="9">Nu există concedii.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

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
                                    value={filter.leaveType}
                                    onChange={(e) => handleFilterChange({ ...filter, leaveType: e.target.value })}
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
