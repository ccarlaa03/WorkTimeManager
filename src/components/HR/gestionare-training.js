import React, { useState } from 'react';
import Modal from 'react-modal';
import FormularAdaugareCurs from './formular-curs';
import Calendar from './Calendar';
import FormularEditareCurs from './formular-ed-curs';
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
    const [cursSelectat, setCursSelectat] = useState(null);

    // Funcție pentru deschiderea modalului de adăugare curs nou
    const deschideModalAdaugareCurs = () => {
        setModalAdaugareCursDeschis(true);
    };
    const editareCurs = (cursEditat) => {
        setCursuri(cursuriActuale => cursuriActuale.map(curs => curs.id === cursEditat.id ? cursEditat : curs));
        setModalEditareDeschis(false); // Închide modalul după editare
    };
    // Funcție pentru închiderea modalului de adăugare curs nou
    const inchideModalAdaugareCurs = () => {
        setModalAdaugareCursDeschis(false);
    };
    const deschideModalPentruEditare = (curs) => {
        setCursSelectat(curs);
        setModalEditareDeschis(true);
    };

    const deschideModalPentruAdaugare = () => {
        setCursSelectat(null); // Resetare curs selectat pentru adăugare
        setModalAdaugareCursDeschis(true);
    };
    // Funcție pentru adăugarea unui nou curs
    const adaugaCurs = (cursNou) => {
        setCursuri(cursuriActuale => [...cursuriActuale, { ...cursNou, id: cursuriActuale.length + 1 }]);
        inchideModalAdaugareCurs(); // Închide modalul după adăugare
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
                        <button onClick={() => { setCursSelectat(curs); setModalEditareDeschis(true); }}>Editează</button>
                        <button onClick={() => stergeCurs(curs.id)}>Șterge</button>
                    </div>
                ))}

            </div>

            <Modal className="modal-content" isOpen={modalEditareDeschis} onRequestClose={() => setModalEditareDeschis(false)}>
                {cursSelectat && (
                    <FormularEditareCurs
                        curs={cursSelectat}
                        onEditareCurs={editareCurs}
                        onClose={() => setModalEditareDeschis(false)}

                    />
                )}
            </Modal>
            <Modal
                isOpen={modalAdaugareCursDeschis}
                onRequestClose={inchideModalAdaugareCurs}
                contentLabel="Adaugă curs nou"
                className="modal-content"
            >
                <FormularAdaugareCurs
                    onAdaugaCurs={adaugaCurs}
                    onClose={inchideModalAdaugareCurs}
                />
            </Modal>
            <div className="form-group" style={{ textAlign: "center" }}>
                <button onClick={deschideModalAdaugareCurs} className="buton-adauga">Adaugă Curs Nou</button>
            </div>
            <Rapoarte cursuri={cursuri} />

            {/*<Calendar evenimente={cursuri.map(({ data, titlu }) => ({ data, titlu }))} />*/}

        </div>
    );
};

export default GestionareTrainingHR;
