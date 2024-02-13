import React, { useState } from 'react';
import imagine from '../../photos/imagine-profil.jpg';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ProfilAngajatHR = () => {

    const angajat = {
        nume: "Ion Popescu",
        functie: "Developer",
        departament: "IT",
        email: "ion.popescu@example.com",
        telefon: "071267891",
        adresa: "Str. Mare 10, Baia Mare",
        dataAngajarii: "12.01.2024",
        emailPersonal: "ion.personal@example.com",
        dataNasterii: "01.01.1980",
        managerDirect: "Maria Ionescu",
        prezente: [
            { data: "01.01.2024", status: "Prezent" },
            { data: "02.01.2024", status: "Absent" },
            // ...alte înregistrări de prezență
        ],
        evaluariPerformanta: [
            { luna: 4, scor: 8.5, feedback: "Excelent" },
            { luna: 3, scor: 8.2, feedback: "Foarte bine" },
        ],
        proiecte: [
            { nume: "Proiectul X - Q1 2024", perioada: "Q1 2024", rol: "Lead Developer", descriere: "Descriere proiect X" },
            { nume: "Proiectul Y - Q4 2023", perioada: "Q4 2023", rol: "Developer", descriere: "Descriere proiect Y" }
        ],
        salariu: "5000 EUR",
        bonusuri: "1000 EUR",
        beneficii: ["Asigurare medicală", "Abonament sala"],
        istoricSalarii: [
            { data: "01.01.2023", valoare: "4500 EUR" },
            { data: "01.01.2022", valoare: "4000 EUR" }
        ],
        concediuRamas: "20 zile",
        istoricConcedii: [
            { tip: "Concediu odihnă", perioada: "15.08.2023 - 30.08.2023" }
        ],
        cursuri: [
            { nume: "Curs programare avansată", data: "2022" }
        ],

    };
    const [programDeLucru, setProgramDeLucru] = useState({
        oreNormale: '09:00 - 17:00',
        oreSuplimentare: '10',
        istoric: [
            { luna: 'Ianuarie', oreSuplimentare: '5' },
            { luna: 'Februarie', oreSuplimentare: '8' },
            // ...alte înregistrări
        ],
    });
    const [lunaSelectataConcedii, setLunaSelectataConcedii] = useState('');
    const [lunaSelectataEvaluari, setLunaSelectataEvaluari] = useState('');
    const [anSelectatEvaluari, setAnSelectatEvaluari] = useState(new Date().getFullYear());
    const [modalEditProfilIsOpen, setModalEditProfilIsOpen] = useState(false);
    const [lunaSelectataIstoricProgram, setLunaSelectataIstoricProgram] = useState('');
    const [anSelectatIstoricProgram, setAnSelectatIstoricProgram] = useState(new Date().getFullYear());
    const [anSelectatConcedii, setAnSelectatConcedii] = useState(new Date().getFullYear());
    const [lunaSelectataProgram, setLunaSelectataProgram] = useState('');
    const luni = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];


    const handleLunaConcediiChange = (event) => {
        setLunaSelectataConcedii(event.target.value);
    };

    const handleLunaIstoricProgramChange = (event) => {
        setLunaSelectataIstoricProgram(event.target.value);
    };

    const handleAnIstoricProgramChange = (event) => {
        setAnSelectatIstoricProgram(event.target.value);
    };

    const [programLucru, setProgramLucru] = useState({
        luni: { start: '09:00', end: '17:00' },
        marti: { start: '09:00', end: '17:00' },
        // ...restul zilelor
    });

    const [concedii, setConcedii] = useState([
        { tip: 'Concediu odihnă', perioada: '15.08.2023 - 30.08.2023', status: 'Aprobat' },
        // ...alte concedii
    ]);
    const handleLunaEvaluariChange = (event) => {
        setLunaSelectataEvaluari(event.target.value);
    };

    const handleAnEvaluariChange = (event) => {
        setAnSelectatEvaluari(event.target.value);
    };

    const handleEditProfil = (event) => {
        event.preventDefault();
        // Aici ai implementa logica de preluare a datelor din formular și actualizare
        // Asumăm că avem un obiect formData cu datele actualizate
        const formData = new FormData(event.target);
        const updatedData = {};
        formData.forEach((value, key) => {
            updatedData[key] = value;
        });
        // Logica de actualizare a datelor angajatului
        console.log(updatedData);
        // Închidem modalul după submit
        setModalEditProfilIsOpen(false);
    };


    const [istoricConcedii, setIstoricConcedii] = useState([
        // Presupunem că avem datele în acest format
        { luna: 'Ianuarie', an: 2024, detalii: 'Concediu odihnă', zile: 5 },
        { luna: 'Martie', an: 2024, detalii: 'Concediu medical', zile: 3 },
        // ...alte concedii
    ]);

    // Funcție pentru a actualiza anul selectat
    const handleAnConcediiChange = (event) => {
        setAnSelectatConcedii(event.target.value);
    };
    const handleLunaProgramChange = (event) => {
        setLunaSelectataProgram(event.target.value);
    };


    return (
        <div className="container-dashboard">
            <h1 className="h1">Profil angajat: {angajat.nume}</h1>
            <div className="image-container">
                <img src={imagine} alt="Fotografie de profil" className="imagine-profil" />
            </div>
            <div className="container-dashboard">
                <div className="container-profil">
                    <div className="section">
                        <h2>Informații personale </h2>
                        <p>Nume complet: {angajat.nume}</p>
                        <p>Adresă de domiciliu: {angajat.adresa}</p>
                        <p>Număr de telefon: {angajat.telefon}</p>
                        <p>Adresă de email personală: {angajat.email}</p>
                        <p>Data nașterii: {angajat.dataNasterii}</p>
                    </div>


                    <div className="section">
                        <h2>Informații profesionale</h2>
                        <p>Data angajării: {angajat.dataAngajarii}</p>
                        <p>Descriere job: {angajat.descriereJob}</p>
                        <p>Departament: {angajat.departament}</p>
                        <p>Manager direct: {angajat.managerDirect}</p>
                    </div>

                    <div className="button-container">
                        <button className="buton" onClick={() => setModalEditProfilIsOpen(true)}>Editează</button>
                    </div>


                </div>
                <div className="container-profil">
                    <div className="section">
                        <h2>Program de lucru</h2>

                        <p>Orar: {programDeLucru.programLucru}</p>
                        <p>Ore suplimentare luna curentă: {programDeLucru.oreSuplimentare}</p>

                        <h2>Istoric program de lucru</h2>
                        <label htmlFor="lunaIstoricProgram">Luna:</label>
                        <select id="lunaIstoricProgram" value={lunaSelectataIstoricProgram} onChange={handleLunaIstoricProgramChange}>
                            <option value="">Toate lunile</option>
                            {luni.map((luna, index) => (
                                <option key={index} value={luna}>{luna}</option>
                            ))}
                        </select>

                        <label htmlFor="anIstoricProgram">Anul:</label>
                        <select id="anIstoricProgram" value={anSelectatIstoricProgram} onChange={handleAnIstoricProgramChange}>
                            {[...Array(5)].map((_, index) => (
                                <option key={index} value={new Date().getFullYear() - index}>
                                    {new Date().getFullYear() - index}
                                </option>
                            ))}
                        </select>

                        <ul>
                            {programDeLucru.istoric
                                .filter(intrare =>
                                    (lunaSelectataIstoricProgram === '' || intrare.luna === lunaSelectataIstoricProgram) &&
                                    (anSelectatIstoricProgram === intrare.an)
                                )
                                .map((intrare, index) => (
                                    <li key={index}>
                                        {intrare.luna} {intrare.an}: {intrare.oreSuplimentare} ore
                                    </li>
                                ))}
                        </ul>
                    </div>



                    <div className="section">
                        <h2>Concedii</h2>

                        <table>
                            <thead>
                                <tr>
                                    <th>Tip concediu</th>
                                    <th>Perioada</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {concedii.map((concediu, index) => (
                                    <tr key={index}>
                                        <td>{concediu.tip}</td>
                                        <td>{concediu.perioada}</td>
                                        <td>{concediu.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <h2>Istoric concedii</h2>
                        <label htmlFor="lunaConcedii">Luna:</label>
                        <select id="lunaConcedii" value={lunaSelectataConcedii} onChange={handleLunaConcediiChange}>
                            <option value="">Toate lunile</option>
                            {luni.map((luna, index) => (
                                <option key={index} value={luna}>{luna}</option>
                            ))}
                        </select>

                        <label htmlFor="anConcedii">Anul:</label>
                        <select id="anConcedii" value={anSelectatConcedii} onChange={handleAnConcediiChange}>
                            {[...Array(5)].map((_, index) => (
                                <option key={index} value={new Date().getFullYear() - index}>
                                    {new Date().getFullYear() - index}
                                </option>
                            ))}
                        </select>

                        <ul>
                            {istoricConcedii
                                .filter(concediu =>
                                    (lunaSelectataConcedii === '' || concediu.luna === lunaSelectataConcedii) &&
                                    (anSelectatConcedii === concediu.an)
                                )
                                .map((concediu, index) => (
                                    <li key={index}>
                                        {concediu.luna} {concediu.an}: {concediu.detalii} - {concediu.zile} zile
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>

                <div className="container-profil">
                    <div className="section">
                        <h2>Evaluări</h2>
                        <label htmlFor="lunaEvaluari">Luna:</label>
                        <select id="lunaEvaluari" value={lunaSelectataEvaluari} onChange={handleLunaEvaluariChange}>
                            <option value="">Toate lunile</option>
                            {luni.map((luna, index) => (
                                <option key={index} value={luna}>{luna}</option>
                            ))}
                        </select>

                        <label htmlFor="anEvaluari">Anul:</label>
                        <select id="anEvaluari" value={anSelectatEvaluari} onChange={handleAnEvaluariChange}>
                            {[...Array(5)].map((_, index) => (
                                <option key={index} value={new Date().getFullYear() - index}>
                                    {new Date().getFullYear() - index}
                                </option>
                            ))}
                        </select>

                        <ul>
                            {angajat.evaluariPerformanta
                                .filter(evaluare =>
                                    (lunaSelectataEvaluari === '' || evaluare.luna === lunaSelectataEvaluari) &&
                                    (anSelectatEvaluari === evaluare.an)
                                )
                                .map((evaluare, index) => (
                                    <li key={index}>
                                        Luna: {evaluare.luna}, Scor: {evaluare.scor}/10, Feedback: {evaluare.feedback}
                                    </li>
                                ))}
                        </ul>
                    </div>
                    <div className="section">
                        <h2>Prezență</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {angajat.prezente.map((prezenta, index) => (
                                    <tr key={index}>
                                        <td>{prezenta.data}</td>
                                        <td>{prezenta.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                </div>
            </div>

            <Modal
                isOpen={modalEditProfilIsOpen}
                onRequestClose={() => setModalEditProfilIsOpen(false)}
                className="modal-content"
            >
                <h2>Editează profil</h2>
                <form onSubmit={handleEditProfil}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="numeComplet">Nume complet:</label>
                            <input id="numeComplet" type="text" placeholder="Nume complet" defaultValue={angajat.nume} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="adresaDomiciliu">Adresă de domiciliu:</label>
                            <input id="adresaDomiciliu" type="text" placeholder="Adresă de domiciliu" defaultValue={angajat.adresa} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telefon">Număr de telefon:</label>
                            <input id="telefon" type="tel" placeholder="Număr de telefon" defaultValue={angajat.telefon} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="emailPersonal">Adresă de email personală:</label>
                            <input id="emailPersonal" type="email" placeholder="Adresă de email" defaultValue={angajat.email} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dataNasterii">Data nașterii:</label>
                            <input id="dataNasterii" type="date" defaultValue={angajat.dataNasterii} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dataAngajarii">Data angajării:</label>
                            <input id="dataAngajarii" type="date" defaultValue={angajat.dataAngajarii} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="descriereJob">Descriere job:</label>
                            <textarea id="descriereJob" placeholder="Descriere job" defaultValue={angajat.descriereJob} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="departament">Departament:</label>
                            <input id="departament" type="text" placeholder="Departament" defaultValue={angajat.departament} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="managerDirect">Manager direct:</label>
                        <input id="managerDirect" type="text" placeholder="Manager direct" defaultValue={angajat.managerDirect} />
                    </div>
                    <div className="form-buttons">
                        <button type="submit" className="buton">Salvează modificările</button>
                        <button type="button" className="buton" onClick={() => setModalEditProfilIsOpen(false)}>Închide</button>
                    </div>
                </form>
            </Modal>

        </div >
    );
};

export default ProfilAngajatHR;
