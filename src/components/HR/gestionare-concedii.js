import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';


const initialAngajati = [
    { id: 1, nume: 'Ion Popescu', departament: 'IT' },
    { id: 2, nume: 'Maria Ionescu', departament: 'HR' }

];

const initialConcedii = [
    { id: 1, angajatId: 1, tipConcediu: 'Anual', dataInceput: '2024-01-01', dataSfarsit: '2024-01-15', status: 'În așteptare' },
    { id: 2, angajatId: 2, tipConcediu: 'Medical', dataInceput: '2024-02-01', dataSfarsit: '2024-02-15', status: 'În așteptare' },

];



const GestionareConcedii = () => {
    const tipuriConcediu = ['Anual', 'Medical', 'Fără plată'];
    // State pentru gestionarea concediilor și a angajaților
    const [angajati, setAngajat] = useState(initialAngajati);
    const [concedii, setConcedii] = useState(initialConcedii);
    const [concediuSelectat, setConcediuSelectat] = useState(null);
    const [modalDeschis, setModalDeschis] = useState(false);
    const [modalAdaugaDeschis, setModalAdaugaDeschis] = useState(false);
    const [angajatId, setAngajatId] = useState('');
    const [dataInceput, setDataInceput] = useState('');
    const [dataSfarsit, setDataSfarsit] = useState('');
    const [tipConcediu, setTipConcediu] = useState('');
    const [esteEditare, setEsteEditare] = useState(false);
    const [departament] = useState(['IT', 'HR', 'Finanțe']);
    const [departamentSelectat, setDepartamentSelectat] = useState('');
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [filter, setFilter] = useState({
        departament: '',
        tipConcediu: '',
        nume: '',
        status: ''
    });
    const handleSearch = () => {

    };

    const handleDeschideModalAdauga = () => {
        setModalAdaugaDeschis(true);
        setModalDeschis(false); // Închide orice alt modal deschis
        resetForm();
    };

    // Funcție pentru închiderea modalului de adăugare
    const handleInchideModalAdauga = () => {
        setModalAdaugaDeschis(false);
    };

    // Handler pentru actualizarea filtrelor
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    useEffect(() => {
        Modal.setAppElement('#root');
    }, []);

    const handleInchideModal = () => {
        setModalDeschis(false);
        resetForm();
        const backdrop = document.querySelector('.backdrop');
        if (backdrop) {
            backdrop.style.display = 'none';
        }
    };

    const navigateToProfile = (angajatId) => {
        navigate(`/user-profil/${angajatId}`);
    };

    // schimbare a statusului unui concediu
    const handleAprobaConcediu = (concediuId, statusNou) => {
        setConcedii(concedii.map((concediu) =>
            concediu.id === concediuId ? { ...concediu, status: statusNou } : concediu
        ));
    };


    const sarbatoriLegale = [
        new Date('2024-01-01'), // Anul Nou
        new Date('2024-04-01'), // Paște
        // ... alte sărbători legale
    ];

    // Funcția care verifică dacă o anumită dată este o sărbătoare legală
    const esteSarbatoare = (data) => {
        return sarbatoriLegale.some(
            (sarbatoare) =>
                sarbatoare.getDate() === data.getDate() &&
                sarbatoare.getMonth() === data.getMonth() &&
                sarbatoare.getFullYear() === data.getFullYear()
        );
    };
    const handleNavigateToProfile = (angajatId) => {
        navigate(`/user-profil/${angajatId}`);
    };

    // Funcția de verificare a concediului ar trebui să excludă sărbătorile legale
    const verificaConcediu = (dataInceput, dataSfarsit) => {
        let totalZile = 0;
        for (let d = new Date(dataInceput); d <= new Date(dataSfarsit); d.setDate(d.getDate() + 1)) {
            if (!esteSarbatoare(d)) {
                totalZile++;
            }
        }
        return totalZile;
    };

    const modalAdaugaComponent = modalAdaugaDeschis && (
        <Modal
            isOpen={modalAdaugaDeschis}
            onRequestClose={handleInchideModalAdauga}
            className="modal-content"
        >
            <h2>Formular de adăugare</h2>
            <form onSubmit={(e) => e.preventDefault()}>

                <div className="form-row" style={{ display: 'flex' }}>
                    <div className="form-group">
                        <label htmlFor="departament">Departament:</label>
                        <select
                            className="select-style"
                            id="departament"
                            value={departamentSelectat}
                            onChange={(e) => {
                                setDepartamentSelectat(e.target.value);
                                setAngajatId('');
                            }}
                        >
                            <option value="">Selectează un departament</option>
                            {departament.map((dep) => (
                                <option key={dep} value={dep}>{dep}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ flex: '1' }}>
                        <label htmlFor="angajat">Angajat:</label>
                        <select
                            className="select-style"
                            id="angajat"
                            value={angajatId}
                            onChange={handleFilterChange}
                            disabled={!departamentSelectat}
                        >
                            <option value="">Selectează un angajat</option>
                            {angajati
                                .filter(angajat => angajat.departament === departamentSelectat)
                                .map((angajat) => (
                                    <option key={angajat.id} value={angajat.id}>
                                        {angajat.nume}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className="form-row" style={{ display: 'flex', }}>
                    <div className="form-group">
                        <label htmlFor="status">Status:</label>
                        <select
                            className="select-style"
                            id="status"
                            value={concediuSelectat ? concediuSelectat.status : ''}
                            onChange={(e) => handleSchimbareStatus(concediuSelectat ? concediuSelectat.id : null, e.target.value)}
                            disabled={!concediuSelectat}
                        >
                            <option value="În așteptare">În așteptare</option>
                            <option value="Acceptat">Acceptat</option>
                            <option value="Respins">Respins</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tipConcediu">Tipul de concediu:</label>
                        <select
                            className="select-style"
                            id="tipConcediu"
                            value={filter.tipConcediu}
                            onChange={(e) => setFilter({ ...filter, tipConcediu: e.target.value })}
                        >
                            <option value="">Toate tipurile</option>
                            {tipuriConcediu.map((tip, index) => (
                                <option key={index} value={tip}>{tip}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row" style={{ display: 'flex' }}>
                    <div className="form-group">
                        <label htmlFor="dataInceput">Data de început:</label>
                        <input
                            id="dataInceput"
                            type="date"
                            value={dataInceput}
                            onChange={(e) => setDataInceput(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="dataSfarsit">Data de sfârșit:</label>
                        <input
                            id="dataSfarsit"
                            type="date"
                            value={dataSfarsit}
                            onChange={(e) => setDataSfarsit(e.target.value)}
                        />
                    </div>
                </div>
                <div className="button-container">
                    <button className='buton' type="submit">Adaugă</button>
                    <button className='buton' type="button" onClick={handleInchideModalAdauga}>Închide</button>

                </div>
            </form>
        </Modal>
    );


    const modalEditareComponent = modalDeschis && (
        <Modal
            isOpen={modalDeschis}
            onRequestClose={handleInchideModal}
            contentLabel="Modifică concediu"
            className="modal-content"
        >
            <h2>Modifică concediu</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-row">
                    <div className="form-group" >
                        <label htmlFor="departament">Departament:</label>
                        <select
                            className="select-style"
                            id="departament"
                            value={departamentSelectat}
                            onChange={(e) => {
                                setDepartamentSelectat(e.target.value);
                                setAngajatId('');
                            }}
                        >
                            <option value="">Selectează un departament</option>
                            {departament.map((dep) => (
                                <option key={dep} value={dep}>{dep}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="angajat">Angajat:</label>
                        <select
                            className="select-style"
                            id="angajat"
                            value={angajatId}
                            onChange={handleFilterChange}
                            disabled={!departamentSelectat}
                        >
                            <option value="">Selectează un angajat</option>
                            {angajati
                                .filter(angajat => angajat.departament === departamentSelectat)
                                .map((angajat) => (
                                    <option key={angajat.id} value={angajat.id}>
                                        {angajat.nume}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="dataInceput">Data de început:</label>
                        <input
                            id="dataInceput"
                            type="date"
                            value={dataInceput}
                            onChange={(e) => setDataInceput(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="dataSfarsit">Data de sfârșit:</label>
                        <input
                            id="dataSfarsit"
                            type="date"
                            value={dataSfarsit}
                            onChange={(e) => setDataSfarsit(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group" >
                        <label htmlFor="status">Status:</label>
                        <select
                            className="select-style"
                            id="status"
                            value={concediuSelectat ? concediuSelectat.status : ''}
                            onChange={(e) => handleSchimbareStatus(concediuSelectat ? concediuSelectat.id : null, e.target.value)}
                            disabled={!concediuSelectat}
                        >
                            <option value="În așteptare">În așteptare</option>
                            <option value="Acceptat">Acceptat</option>
                            <option value="Respins">Respins</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tipConcediu">Tipul de concediu:</label>
                        <select
                            className="select-style"
                            id="tipConcediu"
                            value={filter.tipConcediu}
                            onChange={(e) => setFilter({ ...filter, tipConcediu: e.target.value })}
                        >
                            <option value="">Toate tipurile</option>
                            {tipuriConcediu.map((tip, index) => (
                                <option key={index} value={tip}>{tip}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="button-container">
                    <button className='buton' type="submit">Salvează</button>
                    <button className='buton' type="button" onClick={handleInchideModal}>Închide</button>
                </div>
            </form>
        </Modal>

    );


    const localizer = momentLocalizer(moment);


    const MyCalendar = ({ events }) => {
        return (
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
            />
        );
    };

    {
        angajati.map((angajat) => (
            <button key={angajat.id} onClick={() => handleNavigateToProfile(angajat.id)}>
                Vezi profil
            </button>
        ))
    }

    const events = concedii.map(concediu => ({
        title: concediu.nume,
        start: new Date(concediu.dataInceput),
        end: new Date(concediu.dataSfarsit),
        allDay: true
    }));


    // Funcția de resetare a formularului
    const resetForm = () => {
        setDepartamentSelectat('');
        setAngajatId('');
        setDataInceput('');
        setDataSfarsit('');
        setTipConcediu(' ');
    };

    const calculeazaNumarZileConcediu = (dataInceput, dataSfarsit) => {
        return Math.ceil((new Date(dataSfarsit) - new Date(dataInceput)) / (1000 * 60 * 60 * 24)) + 1;
    };

    const getIstoricConcedii = (angajatId, concedii, totalZileConcediu) => {
        // Filtrăm concediile pentru un anumit angajat
        const concediiAngajat = concedii.filter(concediu => concediu.angajatId === angajatId);

        // Calculăm numărul total de zile de concediu utilizate
        const zileUtilizate = concediiAngajat.reduce((total, concediu) => {
            return total + calculeazaNumarZileConcediu(concediu.dataInceput, concediu.dataSfarsit);
        }, 0);

        // Calculăm soldul de zile de concediu
        const soldConcediu = totalZileConcediu - zileUtilizate;

        return { concedii: concediiAngajat, soldConcediu };
    };


    const handleDeschideModalEditare = (concediu) => {
        setModalDeschis(true);
        setModalAdaugaDeschis(false);
        setConcediuSelectat(concediu);
        setDepartamentSelectat(concediu.departament);
        if (concediu) {
            const backdrop = document.querySelector('.backdrop');
            if (backdrop) {
                backdrop.style.display = 'block';
            }
            // Dacă editezi un concediu existent, populează stările cu datele sale
            const angajat = angajati.find(a => a.id === concediu.angajatId);
            setDepartamentSelectat(angajat ? angajat.departament : '');
            setAngajatId(concediu.angajatId);
            setTipConcediu(concediu.tip);
            setDataInceput(concediu.dataInceput);
            setDataSfarsit(concediu.dataSfarsit);
            setConcediuSelectat(concediu);
            setEsteEditare(true);
        } else {
            // Pentru adăugare, resetează formularul și indică faptul că nu este editare
            resetForm();
            setConcediuSelectat(null);
            setEsteEditare(false);
        }
        setModalDeschis(true);

    };

    // Funcția pentru verificarea soldului de concediu
    const verificaSoldConcediu = (angajatId, dataInceput, dataSfarsit) => {
        const angajat = angajati.find(a => a.id === angajatId);
        if (!angajat) return false;

        const durataConcediu = (new Date(dataSfarsit) - new Date(dataInceput)) / (1000 * 3600 * 24) + 1;
        return angajat.soldConcediu >= durataConcediu;
    };


    const handleSalveazaConcediu = (concediu) => {

        if (concediuSelectat) {
            // Modificăm un concediu existent
            const concediiActualizate = concedii.map((c) =>
                c.id === concediuSelectat.id ? { ...concediu } : c
            );
            setConcedii(concediiActualizate);
        } else {
            // Adăugăm un concediu nou
            setConcedii([...concedii, { ...concediu, id: Date.now() }]); // id-ul este doar un placeholder
        }
        handleInchideModal();

        if (verificaSuprapunerea(dataInceput, dataSfarsit, angajatId)) {
            alert('Există deja un concediu în acest interval pentru angajat.');
            return;
        }

        // Verifică dacă angajatul are sold pentru concediu
        if (!verificaSoldConcediu(angajatId, dataInceput, dataSfarsit)) {
            alert('Angajatul nu are suficient sold de concediu pentru intervalul selectat.');
            return;
        }
    };
    const verificaSuprapunerea = (dataInceput, dataSfarsit, departament) => {
        // Presupunând că fiecare angajat are un 'soldConcediu' și un 'departament'
        const angajatiInConcediu = concedii.filter((concediu) => {
            const angajat = angajati.find(a => a.id === concediu.angajatId && a.departament === departament);
            if (!angajat) return false;
            return (
                (new Date(concediu.dataInceput) <= new Date(dataSfarsit)) &&
                (new Date(concediu.dataSfarsit) >= new Date(dataInceput))
            );
        });
        const verificaSoldConcediu = (angajatId, durataConcediu) => {
            const angajat = angajati.find(a => a.id === angajatId);
            if (!angajat) return false;
            return angajat.soldConcediu >= durataConcediu;
        };

        return angajatiInConcediu.length > 0; // Dacă există angajați în concediu în acel interval
    };

    // Filtrarea concediilor înainte de afișare
    const concediiFiltrate = concedii.filter(concediu => {
        const angajat = angajati.find(a => a.id === concediu.angajatId);
        if (!angajat) return false; // Dacă nu există angajatul, nu include concediul

        // Aplică filtrele dacă acestea sunt setate
        const filtreazaDepartament = filter.departament ? angajat.departament === filter.departament : true;
        const filtreazaTipConcediu = filter.tipConcediu ? concediu.tipConcediu === filter.tipConcediu : true;
        const filtreazaNume = filter.nume ? angajat.nume.toLowerCase().includes(filter.nume.toLowerCase()) : true;
        const filtreazaStatus = filter.status ? concediu.status === filter.status : true;

        return filtreazaDepartament && filtreazaTipConcediu && filtreazaNume && filtreazaStatus;
    });

    const handleSchimbareStatus = (concediuId, nouStatus) => {
        if (concediuId === null) return;


        const updatedConcedii = concedii.map((concediu) => {
            if (concediu.id === concediuId) {
                return { ...concediu, status: nouStatus };
            }
            return concediu;
        });

        setConcedii(updatedConcedii);
    };



    <div>
    </div>

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
                        value={filter.departament}
                        onChange={(e) => handleFilterChange({ ...filter, departament: e.target.value })}
                    >
                        <option value="">Toate departamentele</option>
                        {departament.map((dep, index) => (
                            <option key={index} value={dep}>{dep}</option>
                        ))}
                    </select>
                    <select
                        className="select-style"
                        value={filter.tipConcediu}
                        onChange={(e) => handleFilterChange({ ...filter, tipConcediu: e.target.value })}
                    >
                        <option value="">Toate tipurile</option>
                        {tipuriConcediu.map((tip, index) => (
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
                            <th>Acțiuni</th>
                        </tr>
                    </thead>

                    <tbody>
                        {concediiFiltrate.map((concediu) => {
                            const angajat = angajati.find(a => a.id === concediu.angajatId);
                            if (!angajat) return null;
                            return (
                                <tr key={concediu.id}>
                                    <td>{angajat.id}</td>
                                    <td onClick={() => navigateToProfile(angajat.id)} style={{ cursor: 'pointer' }}>
                                        {angajat.nume}
                                    </td>
                                    <td>{angajat.departament}</td>
                                    <td>{concediu.tipConcediu}</td>
                                    <td>{concediu.dataInceput}</td>
                                    <td>{concediu.dataSfarsit}</td>
                                    <td>
                                        <select
                                            className="select-style"
                                            value={concediu.status}
                                            onChange={(e) => handleSchimbareStatus(concediu.id, e.target.value)}
                                        >
                                            <option value="În așteptare">În așteptare</option>
                                            <option value="Acceptat">Acceptat</option>
                                            <option value="Respins">Respins</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button className='buton' onClick={() => handleDeschideModalEditare(concediu)}>Editează</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>

                </table>

                <div class="button-container">
                    <button className='buton' onClick={handleDeschideModalAdauga}>Adaugă concediu</button>
                </div>

                <div className={isModalOpen ? 'hidden' : ''}>
                    <MyCalendar events={events} />
                </div>

                {modalAdaugaComponent && ReactDOM.createPortal(modalAdaugaComponent, document.body)}
                {modalEditareComponent && ReactDOM.createPortal(modalEditareComponent, document.body)}
            </div>
        </div>

    );

};

export default GestionareConcedii;
