import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
        // Utilizează axios pentru a face solicitarea
        const response = await axios.get('http://localhost:8000/api/acasa/');
        // Setează datele primite ca stare
        setData(response.data);
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
