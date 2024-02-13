import React, { useState } from 'react';
import Modal from 'react-modal';
import Rapoarte from './rapoarte';

Modal.setAppElement('#root'); // Adaugă această linie dacă nu este deja inclusă în altă parte în codul tău

const GestionareTrainingHR = () => {
    const [cursuri, setCursuri] = useState([
        // Exemple de cursuri
        { id: 1, titlu: 'Leadership Training', data: new Date(2024, 3, 22), durata: '10', descriere: 'Training pentru dezvoltarea abilităților de leadership.' },
        { id: 2, titlu: 'Excel Avansat', data: new Date(2024, 4, 5), durata: '8', descriere: 'Curs avansat de Excel pentru analiza datelor.' },
        { id: 3, titlu: 'Managementul performanțelor', data: new Date(2024, 2, 5), durata: '5', descriere: 'Dezvoltarea continuă a performanțelor.' },
        // ... alte cursuri
    ]);

    const [modalAdaugareCursDeschis, setModalAdaugareCursDeschis] = useState(false);
    const [modalEditareDeschis, setModalEditareDeschis] = useState(false);
    const [cursEditat, setCursEditat] = useState(null);

    const deschideModalAdaugareCurs = () => setModalAdaugareCursDeschis(true);
    const inchideModalAdaugareCurs = () => setModalAdaugareCursDeschis(false);

    const [cursSelectat, setCursSelectat] = useState(null);
    const [titlu, setTitlu] = useState('');
    const [descriere, setDescriere] = useState('');
    const [data, setData] = useState('');
    const [durata, setDurata] = useState('');

    const onClose = () => {
        setModalAdaugareCursDeschis(false);
        setModalEditareDeschis(false);
    };

    const resetForm = () => {
        setTitlu('');
        setDescriere('');
        setData('');
        setDurata('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalAdaugareCursDeschis) {
            // Logica pentru adăugarea unui curs nou
            // Presupunând că formularul de adăugare are câmpuri `titlu`, `descriere`, etc.
            const nouCurs = {
                id: Date.now(), // Generați un ID unic pentru cursul nou
                titlu: e.target.titlu.value,
                descriere: e.target.descriere.value,
                data: e.target.data.value,
                durata: e.target.durata.value
            };
            setCursuri(cursuriActuale => [...cursuriActuale, nouCurs]);
        } else if (modalEditareDeschis && cursSelectat) {
            // Logica pentru editarea unui curs existent
            const cursEditat = {
                ...cursSelectat,
                titlu: e.target.titlu.value,
                descriere: e.target.descriere.value,
                data: e.target.data.value,
                durata: e.target.durata.value
            };
            setCursuri(cursuriActuale => cursuriActuale.map(curs => curs.id === cursEditat.id ? cursEditat : curs));
        }
        onClose(); // Închide modalul după trimitere
    };
    const deschideModalEditare = (curs) => {
        setCursEditat(curs);
        setModalEditareDeschis(true);
    };
    const inchideModalEditare = () => {
        setCursEditat(null);
        setModalEditareDeschis(false);
    };


    // Funcție pentru ștergerea unui curs
    const stergeCurs = (idCurs) => {
        setCursuri(cursuriActuale => cursuriActuale.filter(curs => curs.id !== idCurs));
    };

    return (
        <div className="container-dashboard">
            <h1>Training</h1>

            <div className="lista-cursuri">
                {cursuri.map(curs => (
                    <div key={curs.id} className="card-curs">
                        <h3>{curs.titlu}</h3>
                        <p>{curs.descriere}</p>
                        <p>Data: {curs.data.toLocaleDateString()}</p>
                        <p>Durata: {curs.durata}</p>
                        <div class="button-container">
                            <button onClick={() => { setCursSelectat(curs); setModalEditareDeschis(true); }}>Editează</button>
                            <button onClick={() => stergeCurs(curs.id)}>Șterge</button>
                        </div>
                    </div>
                ))}

            </div>

            <Modal
                isOpen={modalEditareDeschis}
                onRequestClose={() => setModalEditareDeschis(false)}
                className="modal-content"
            >
                <h2>Editare curs</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            Titlu curs:
                            <input
                                type="text"
                                value={titlu}
                                onChange={(e) => setTitlu(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Descriere:
                            <textarea
                                value={descriere}
                                onChange={(e) => setDescriere(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Data:
                            <input
                                type="date"
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                                required
                            />
                        </label>

                        <label>
                            Durata (zile):
                            <input
                                type="number"
                                value={durata}
                                onChange={(e) => setDurata(e.target.value)}
                                required
                            />
                        </label>

                    </div>
                    <button type="submit">Salvează modificările</button>
                    <button type="button" onClick={onClose}>Închide</button>
                </form>
                );

            </Modal>
            <Modal
                isOpen={modalAdaugareCursDeschis}
                onRequestClose={() => setModalAdaugareCursDeschis(false)}
                className="modal-content"
            >
                <h2>Adaugă Curs Nou</h2>
                <form onSubmit={handleSubmit}>
                    <label>Nume:<input type="text" name="nume" required /></label>
                    <label>Număr de telefon:<input type="text" name="telefon" required /></label>
                    <label>Adresă de email:<input type="email" name="email" required /></label>
                    <label>Departament:<input type="text" name="departament" required /></label>
                    <label>Funcție:<input type="text" name="functie" required /></label>
                    <label>Data angajării:<input type="date" name="data" required /></label>
                    <button type="submit">Adaugă</button>
                    <button type="button" onClick={onClose}>Închide</button>
                </form>
            </Modal>
            <div class="button-container">
                <button onClick={deschideModalAdaugareCurs} className="buton">Adaugă curs nou</button>
            </div>
            <Rapoarte cursuri={cursuri} />


        </div>
    );
};

export default GestionareTrainingHR;
