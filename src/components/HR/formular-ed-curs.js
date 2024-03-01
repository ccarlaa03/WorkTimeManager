import React, { useState, useEffect } from 'react';

const FormularEditareCurs = ({ curs, onEditareCurs, onClose }) => {
    const [titlu, setTitlu] = useState('');
    const [descriere, setDescriere] = useState('');
    const [data, setData] = useState('');
    const [durata, setDurata] = useState('');
    

    useEffect(() => {
        if (curs) {
            setTitlu(curs.titlu);
            setDescriere(curs.descriere);
            setData(curs.data.toISOString().split('T')[0]); 
            setDurata(curs.durata);
        }
    }, [curs]);


    const handleSubmit = (e) => {
        e.preventDefault();
        onEditareCurs({
            ...curs,
            titlu,
            descriere,
            data: new Date(data),
            durata
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>

            <h2>Editare curs</h2>
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
};

export default FormularEditareCurs;
