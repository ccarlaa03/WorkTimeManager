import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const DataContext = createContext();

export const useData = () => useContext(DataContext);


export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/acasa');

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
