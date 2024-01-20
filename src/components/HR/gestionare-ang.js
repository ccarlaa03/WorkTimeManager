import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import FormularAdaugareAngajat from './Formular-adaug';

Modal.setAppElement('#root');

const GestionareAngajati = () => {
    const [angajati, setAngajati] = useState([
        { id: 1, nume: 'Ion Popescu', telefon: '071267891', email: 'ion.popescu@yahoo.com', departament: 'IT', functie: 'Developer', data: '12.01.2024' },
        // ... alți angajați
    ]);
    const [angajatEditat, setAngajatEditat] = useState(null);
    const [modalEditareIsOpen, setModalEditareIsOpen] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const deschideModalEditare = (angajat) => {
        setAngajatEditat(angajat);
        setModalEditareIsOpen(true);
    };

    const inchideModalEditare = () => {
        setModalEditareIsOpen(false);
        setAngajatEditat(null);
    };

    const salveazaEditare = (e) => {
        e.preventDefault();
        const { nume, departament, functie } = e.target.elements;
        const angajatiActualizati = angajati.map(a => a.id === angajatEditat.id
            ? { ...a, nume: nume.value, departament: departament.value, functie: functie.value }
            : a
        );
        setAngajati(angajatiActualizati);
        inchideModalEditare();
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const adaugaAngajat = (angajatNou) => {
        setAngajati([...angajati, angajatNou]);
        closeModal();
    };

    const stergeAngajat = (id) => {
        setAngajati(angajati.filter(angajat => angajat.id !== id));
    };

    return (
        <div>
            <div className="container-dashboard">
                <h1 className="h1">Gestionare angajați</h1>
                <table className="tabel column">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nume</th>
                            <th>Număr de telefon</th>
                            <th>Adresa de email</th>
                            <th>Departament</th>
                            <th>Funcție</th>
                            <th>Data angajării</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {angajati.map(angajat => (
                            <tr key={angajat.id}>
                                <td>{angajat.id}</td>
                                <td>{angajat.nume}</td>
                                <td>{angajat.telefon}</td>
                                <td>{angajat.email}</td>
                                <td>{angajat.departament}</td>
                                <td>{angajat.functie}</td>
                                <td>{angajat.data}</td>
                                <td>
                                    <button onClick={() => deschideModalEditare(angajat)}>Editează</button>
                                    <button onClick={() => stergeAngajat(angajat.id)}>Șterge</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="form-group" style={{ textAlign: "center" }}>
                    <button className="buton" onClick={openModal}>Adaugă angajat nou</button>
                    <div style={{ marginTop: "10px" }}>
                        <Link to="/gestionare-concedii">
                            <button className="buton">Gestionare concedii</button>
                        </Link>
                        <Link to="/gestionare-prog">
                            <button className="buton">Gestionare program de lucru</button>
                        </Link>
                    </div>
                </div>
                <Modal
                    isOpen={modalEditareIsOpen}
                    onRequestClose={inchideModalEditare}
                    contentLabel="Editează angajat"
                    className="modal-content"
                >
                    <h2>Editează Angajat</h2>
                    {angajatEditat && (
                        <form onSubmit={salveazaEditare}>
                            <label>
                                Nume:
                                <input
                                    type="text"
                                    name="nume"
                                    defaultValue={angajatEditat.nume}
                                    required
                                />
                            </label>
                            <label>
                                Departament:
                                <input
                                    type="text"
                                    name="departament"
                                    defaultValue={angajatEditat.departament}
                                    required
                                />
                            </label>
                            <label>
                                Funcție:
                                <input
                                    type="text"
                                    name="functie"
                                    defaultValue={angajatEditat.functie}
                                    required
                                />
                            </label>
                            <button type="submit">Salvează modificările</button>
                            <button type="button" onClick={inchideModalEditare}>Închide</button>
                        </form>
                    )}
                </Modal>
                <Modal isOpen={modalIsOpen} className="modal-content" onRequestClose={closeModal} contentLabel="Adaugă angajat">
                    <h2>Adaugă angajat nou</h2>
                    <FormularAdaugareAngajat onAdaugaAngajat={adaugaAngajat} onClose={closeModal} />
                </Modal>
            </div>
        </div>
    );
};

export default GestionareAngajati;


