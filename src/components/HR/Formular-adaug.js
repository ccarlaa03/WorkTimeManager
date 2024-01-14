import React from 'react';

const FormularAdaugareAngajat = ({ onAdaugaAngajat, onClose }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const { nume, telefon, email, departament, functie, data } = e.target.elements;
        onAdaugaAngajat({
            id: Date.now(), // Sugerat ca ID unic
            nume: nume.value,
            telefon: telefon.value,
            email: email.value,
            departament: departament.value,
            functie: functie.value,
            data: data.value
        });
    };

    return (
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
    );
};

export default FormularAdaugareAngajat;