import React, { useState } from 'react';
import Modal from 'react-modal';

const initialAngajati = [
    { id: 1, nume: 'Ion Popescu', departament: 'IT' },
    { id: 2, nume: 'Maria Ionescu', departament: 'HR' },
    // ... other employee objects
];

const initialConcedii = [
    { id: 1, angajatId: 1, dataInceput: '2024-01-01', dataSfarsit: '2024-01-15' },
    { id: 2, angajatId: 2, dataInceput: '2024-02-01', dataSfarsit: '2024-02-15' },
    // ... other leave records
];


const GestionareConcedii = () => {
    const [angajati, setAngajati] = useState(initialAngajati);
    const [concedii, setConcedii] = useState(initialConcedii);
    const [concediuSelectat, setConcediuSelectat] = useState(null);
    const [modalDeschis, setModalDeschis] = useState(false);
    const [departamentSelectat, setDepartamentSelectat] = useState('');
    const [angajatId, setAngajatId] = useState('');
    const [dataInceput, setDataInceput] = useState('');
    const [dataSfarsit, setDataSfarsit] = useState('');
    const [esteEditare, setEsteEditare] = useState(false);
    const [modalDetaliiDeschis, setModalDetaliiDeschis] = useState(false);
    const [detaliiConcediu, setDetaliiConcediu] = useState(null);

    // Funcția de resetare a formularului
    const resetForm = () => {
        setDepartamentSelectat('');
        setAngajatId('');
        setDataInceput('');
        setDataSfarsit('');
    };
    const handleDeschideDetaliiConcediu = (concediuId) => {
        const concediu = concedii.find(c => c.id === concediuId);
        if (concediu) {
            setDetaliiConcediu(concediu);
            setModalDetaliiDeschis(true);
        }
    };

    const handleInchideDetalii = () => {
        setModalDetaliiDeschis(false);
    };
    const handleDeschideModal = (concediu) => {
        if (concediu) {
            // Dacă editezi un concediu existent, populează stările cu datele sale
            const angajat = angajati.find(a => a.id === concediu.angajatId);
            setDepartamentSelectat(angajat ? angajat.departament : '');
            setAngajatId(concediu.angajatId);
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


    const handleInchideModal = () => {
        setConcediuSelectat(null);
        setModalDeschis(false);
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
    };

    return (
        <div>
            <div className="container-dashboard">
                <h1>Gestionare concedii</h1>
                <table className="tabel column">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nume</th>
                            <th>Departament</th>
                            <th>Data Început</th>
                            <th>Data Sfârșit</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {concedii.map((concediu) => {
                            const angajat = angajati.find(a => a.id === concediu.angajatId);
                            return (
                                <tr key={concediu.id}>
                                    <td>{angajat.id}</td>
                                    <td>{angajat.nume}</td>
                                    <td>{angajat.departament}</td>
                                    <td>{concediu.dataInceput}</td>
                                    <td>{concediu.dataSfarsit}</td>
                                    <td>
                                        <button className='buton' onClick={() => handleDeschideModal(concediu)}>Editează</button>
                                        <button className='buton' onClick={() => handleDeschideDetaliiConcediu(concediu.id)}>Detalii</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="form-group" style={{ textAlign: "center" }}>
                    <button className='buton' onClick={() => handleDeschideModal(null)}>Adaugă concediu</button>
                </div>
                <Modal
                    isOpen={modalDeschis}
                    onRequestClose={() => {
                        handleInchideModal();
                        resetForm();
                    }}
                    contentLabel="Concediu"
                    className="modal-content"
                >
                    <h2>{concediuSelectat ? 'Modifică Concediu' : 'Adaugă Concediu'}</h2>
                    <form onSubmit={(e) => e.preventDefault()}>
                        {/* Select pentru departament */}
                        <label htmlFor="departament">Departament:</label>
                        <select
                            id="departament"
                            value={departamentSelectat}
                            onChange={(e) => {
                                setDepartamentSelectat(e.target.value);
                                setAngajatId(''); // Resetează selecția angajatului când se schimbă departamentul
                            }}
                        >
                            <option value="">Selectează un departament</option>
                            {/* ...opțiuni pentru departamente */}
                        </select>

                        {/* Select pentru angajat bazat pe departamentul selectat */}
                        <label htmlFor="angajat">Angajat:</label>
                        <select
                            id="angajat"
                            value={angajatId}
                            onChange={(e) => setAngajatId(e.target.value)}
                            disabled={!departamentSelectat} // Disable dacă nu este selectat niciun departament
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

                        <label htmlFor="dataInceput">Data de început:</label>
                        <input
                            id="dataInceput"
                            type="date"
                            value={dataInceput}
                            onChange={(e) => setDataInceput(e.target.value)}
                        />

                        <label htmlFor="dataSfarsit">Data de sfârșit:</label>
                        <input
                            id="dataSfarsit"
                            type="date"
                            value={dataSfarsit}
                            onChange={(e) => setDataSfarsit(e.target.value)}
                        />

                        <button type="submit" onClick={() => handleSalveazaConcediu({
                            angajatId,
                            dataInceput,
                            dataSfarsit,
                        })}>
                            Salvează concediu
                        </button>
                        <button type="button" onClick={handleInchideModal}>Închide</button>
                    </form>
                </Modal>
                <Modal
                    isOpen={modalDetaliiDeschis}
                    onRequestClose={handleInchideDetalii}
                    contentLabel="Detalii Concediu"
                    className="modal-content"
                >
                    <h2>Detalii Concediu pentru {detaliiConcediu?.angajatNume}</h2>
                    {detaliiConcediu && (
                        <>
                            <p>Angajat: {angajati.find(a => a.id === detaliiConcediu.angajatId)?.nume}</p>
                            <p>Data Început: {detaliiConcediu.dataInceput}</p>
                            <p>Data Sfârșit: {detaliiConcediu.dataSfarsit}</p>
                            {/* ... alte detalii despre concediu ... */}
                        </>
                    )}
                    <button onClick={handleInchideDetalii}>Închide</button>
                </Modal>


            </div>
        </div>
    );
};

export default GestionareConcedii;
