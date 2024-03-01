import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/';

const ExampleComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Facem cererea către serverul Django
        const response = await fetch(API_URL + 'endpoint/');
        if (!response.ok) {
          // Verificăm dacă răspunsul de la server este OK
          throw new Error('Serverul a returnat un cod de eroare ' + response.status);
        }
        const data = await response.json();
        // Actualizăm starea componentei cu datele primite de la serverul Django
        setData(data);
      } catch (error) {
        // În caz de eroare, actualizăm starea componentei cu eroarea corespunzătoare
        setError(error);
      } finally {
        // După finalizarea cererii, marcăm încărcarea ca fiind terminată
        setLoading(false);
      }
    };

    // Apelăm funcția de fetch data când componenta este montată
    fetchData();
  }, []); // Această funcție se execută o singură dată, la montarea componentei

  return (
    <div>
      {loading && <p>Se încarcă...</p>}
      {error && <p>Eroare: {error.message}</p>}
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Încărcare...</p>}
    </div>
  );
};

export default ExampleComponent;
