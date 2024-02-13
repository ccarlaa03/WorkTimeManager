import React from 'react';
import { useParams } from 'react-router-dom';

const DetaliiAngajat = () => {
    const { angajatId } = useParams(); // Obține id-ul angajatului din URL

    // Caută angajatul cu id-ul corespunzător în lista de angajați (poate fi o altă metodă de stocare a datelor)
    const angajat = angajati.find(a => a.id === parseInt(angajatId));

    if (!angajat) {
        return <div>Angajatul nu a fost găsit.</div>;
    }

    return (
        <div>
            <h2>Detalii Angajat</h2>
            <p>Nume: {angajat.nume}</p>
            <p>Telefon: {angajat.telefon}</p>
            <p>Email: {angajat.email}</p>
            <p>Departament: {angajat.departament}</p>
            <p>Funcție: {angajat.functie}</p>
            <p>Adresă: {angajat.adresa}</p>
            <p>Data angajării: {angajat.data}</p>
        </div>
    );
};

export default DetaliiAngajat;
