import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import FormularAdaugareAngajat from './Formular-adaug';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

const GestionareAngajati = () => {
    const [angajati, setAngajati] = useState([
        { id: 1, nume: 'Ion Popescu', telefon: '071267891', email: 'ion.popescu@yahoo.com', departament: 'IT', functie: 'Developer', prezenta: 'Prezent', adresa: ' str. Mare 10 Baia Mare', data: '12.01.2024' },
        // ... alți angajați
    ]);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(0);

    const [filter, setFilter] = useState({
        nume: '',
        functie: '',
        departament: '',
        dataAngajarii: '',
    });

    const handleSearch = () => {

    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const filteredAngajati = angajati.filter(angajat => {
        return angajat.nume.toLowerCase().includes(filter.nume.toLowerCase()) &&
            angajat.functie.toLowerCase().includes(filter.functie.toLowerCase()) &&
            angajat.departament.toLowerCase().includes(filter.departament.toLowerCase()) &&
            (!filter.dataAngajarii || angajat.data.includes(filter.dataAngajarii));
    });

    const angajatiPerPage = 10;

    // Calcularea indexului de început și a indexului de sfârșit pentru afișarea angajaților pe pagina curentă
    const indexOfLastAngajat = (currentPage + 1) * angajatiPerPage;
    const indexOfFirstAngajat = indexOfLastAngajat - angajatiPerPage;
    const angajatiPaginaCurenta = filteredAngajati.slice(indexOfFirstAngajat, indexOfLastAngajat);

    // Funcția pentru schimbarea paginii curente
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handleSearchChange = (e) => {
        setFilter({ ...filter, nume: e.target.value });
        setCurrentPage(0);
    };

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

    // Funcția pentru sortare
    const sortAngajati = (criteria) => {
        const sortedAngajati = [...angajati];
        sortedAngajati.sort((a, b) => {
            if (a[criteria] < b[criteria]) {
                return -1;
            }
            if (a[criteria] > b[criteria]) {
                return 1;
            }
            return 0;
        });
        setAngajati(sortedAngajati);
    };


    return (
        <div>
            <div className="container-dashboard">
                <h1>Gestionare angajați</h1>
                <div className="filter-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Caută după nume..."
                        value={filter.nume}
                        onChange={(e) => setFilter({ ...filter, nume: e.target.value })}
                        style={{ flexBasis: '100%' }}
                    />
                    <br></br>
                    <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
                        <select
                            name="functie"
                            value={filter.functie}
                            onChange={handleFilterChange}
                            className="select-style"
                        >
                            <option value="">Toate funcțiile</option>
                            <option value="Developer">Developer</option>
                            <option value="Manager">Manager</option>
                        </select>

                        <select
                            name="departament"
                            value={filter.departament}
                            onChange={handleFilterChange}
                            className="select-style"
                        >
                            <option value="">Toate departamentele</option>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                        </select>

                        <input
                            type="date"
                            name="dataAngajarii"
                            placeholder="Caută după data angajării..."
                            value={filter.dataAngajarii}
                            onChange={handleFilterChange}
                            style={{ flex: 1 }}
                        />
                        <button onClick={handleSearch} className="buton">
                            Caută
                        </button>
                    </div>
                </div>
                <br></br>
                <table className="tabel column">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nume</th>
                            <th>Număr de telefon</th>
                            <th>Adresa de email</th>
                            <th>Departament</th>
                            <th>Funcție</th>
                            <th>Prezența</th>
                            <th>Adresă</th>
                            <th>Data angajării</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {angajatiPaginaCurenta.map(angajat => (
                            <tr key={angajat.id}>
                                <td>{angajat.id}</td>
                                <td>
                                    <Link
                                        to={`/profil-angajat/${angajat.id}`}
                                        style={{ color: 'black', textDecoration: 'none', opacity: 0.7 }}
                                    >
                                        {angajat.nume}
                                    </Link>
                                </td>


                                <td>{angajat.telefon}</td>
                                <td>{angajat.email}</td>
                                <td>{angajat.departament}</td>
                                <td>{angajat.functie}</td>
                                <td>{angajat.prezenta}</td>
                                <td>{angajat.adresa}</td>
                                <td>{angajat.data}</td>
                                <td>
                                    <button onClick={() => deschideModalEditare(angajat)}>Editează</button>
                                    <button onClick={() => stergeAngajat(angajat.id)}>Șterge</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div class="button-container">
                    <button className="buton" onClick={openModal}>Adaugă angajat nou</button>

                    <Link to="/gestionare-concedii">
                        <button className="buton">Gestionare concedii</button>
                    </Link>
                    <Link to="/gestionare-prog">
                        <button className="buton">Gestionare program de lucru</button>
                    </Link>


                    <ReactPaginate
                        previousLabel={'Anterior'}
                        nextLabel={'Următorul'}
                        pageCount={Math.ceil(filteredAngajati.length / angajatiPerPage)}
                        onPageChange={handlePageChange}
                        containerClassName={'pagination'}
                        activeClassName={'active'}
                    />
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
                                Număr de telefon:
                                <input
                                    type="text"
                                    name="telefon"
                                    defaultValue={angajatEditat.telefon}
                                    required
                                />
                            </label>
                            <label>
                                Adresa de email:
                                <input
                                    type="text"
                                    name="email"
                                    defaultValue={angajatEditat.email}
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
                            <label>
                                Data angajării:
                                <input
                                    type="text"
                                    name="data"
                                    defaultValue={angajatEditat.data}
                                    required
                                />
                            </label>
                            <label>
                                Adresă:
                                <input
                                    type="text"
                                    name="adresa"
                                    defaultValue={angajatEditat.adresa}
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
