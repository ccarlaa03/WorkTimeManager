import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);

  const login = (role) => {
    setUserRole(role); // Setează rolul utilizatorului
  };

  const logout = () => {
    setUserRole(null); // Resetează rolul utilizatorului la delogare
  };

  return (
    <AuthContext.Provider value={{ userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
