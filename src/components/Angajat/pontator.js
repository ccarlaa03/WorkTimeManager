import React, { useState } from 'react';

const Pontator = ({ angajatId }) => {
    const [status, setStatus] = useState(null);

    const handlePontareIntrare = () => {
        // Logica pentru pontare intrare
        const timestamp = new Date(); // Ora curentă a pontării
        console.log(`Angajatul ${angajatId} a pontat intrarea la: ${timestamp}`);
        // Aici trimiteți informațiile către backend
        setStatus('intrare');
    };

    const handlePontareIesire = () => {
        // Logica pentru pontare ieșire
        const timestamp = new Date(); // Ora curentă a pontării
        console.log(`Angajatul ${angajatId} a pontat ieșirea la: ${timestamp}`);
        // Aici trimiteți informațiile către backend
        setStatus('iesire');
    };

    return (
        <div>
            {status === 'intrare' ? (
                <div>
                    <p>Ești pontat la intrare.</p>
                    <button onClick={handlePontareIesire}>Pontare ieșire</button>
                </div>
            ) : status === 'iesire' ? (
                <p>Ai pontat ieșirea pentru astăzi.</p>
            ) : (
                <button onClick={handlePontareIntrare}>Pontare intrare</button>
            )}
        </div>
    );
};

export default Pontator;
