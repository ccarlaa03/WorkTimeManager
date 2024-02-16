import React, { createContext, useContext, useState, useEffect } from 'react';

// Crează un Context
const DataContext = createContext();

// Crează un Hook personalizat pentru a accesa contextul
export const useData = () => useContext(DataContext);

// Crează un Provider pentru context
export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/your-endpoint/');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ data }}>
      {children}
    </DataContext.Provider>
  );
};
