import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import instance from '../../axiosConfig';
import axios from 'axios';

Modal.setAppElement('#root');

const EmployeeTraining = () => {
    // State-ul și funcțiile necesare pentru gestionarea angajaților și cursurilor
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    useEffect(() => {
        // Funcție pentru a prelua lista de angajați disponibili
        const fetchEmployees = async () => {
            try {
                const response = await axios.get('/gestionare-ang/', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                });
                setAvailableEmployees(response.data);
            } catch (error) {
                console.error('Error fetching employees:', error.response ? error.response.data : error);
            }
        };

        fetchEmployees();
    }, []);

    // Funcție pentru a adăuga un angajat la curs
    const addEmployeeToTraining = async (employeeId) => {
        try {
            const response = await instance.post(`/trainings/${selectedTraining.id}/add-participant/`, { employee_id: employeeId }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
            });
            if (response.status === 200) {
                // Actualizează lista de angajați ai cursului
                setSelectedTraining({ ...selectedTraining, employees: response.data });
            }
        } catch (error) {
            console.error('Error adding employee to training:', error.response ? error.response.data : error);
        }
    };

    // Funcție pentru a elimina un angajat din curs
    const removeEmployeeFromTraining = async (employeeId) => {
        try {
            const response = await instance.delete(`/trainings/remove-employee/${selectedTraining.id}/${employeeId}/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
            });
            if (response.status === 204) {
                // Actualizează lista de angajați ai cursului
                setSelectedTraining({ ...selectedTraining, employees: selectedTraining.employees.filter(emp => emp.id !== employeeId) });
            }
        } catch (error) {
            console.error('Error removing employee from training:', error.response ? error.response.data : error);
        }
    };

    return (
        <div className="container-dashboard">

            <div>
                <h3>Angajați disponibili:</h3>
                <ul>
                    {availableEmployees.map(employee => (
                        <li key={employee.id}>
                            {employee.name}
                            <button onClick={() => addEmployeeToTraining(employee.id)}>Adaugă</button>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Afiseaza lista de angajati asociati cursului selectat */}
            {selectedTraining && (
                <div>
                    <h3>Angajați la cursul {selectedTraining.title}:</h3>
                    <ul>
                        {selectedTraining.employees.map(employee => (
                            <li key={employee.id}>
                                {employee.name}
                                <button onClick={() => removeEmployeeFromTraining(employee.id)}>Elimină</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default EmployeeTraining;
