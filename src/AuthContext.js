import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userType, setUserType] = useState('vizitator');

  const loginAsEmployee = () => setUserType('angajat');
  const loginAsHR = () => setUserType('hr');
  const logout = () => setUserType('vizitator');

  return (
    <AuthContext.Provider value={{ userType, loginAsEmployee, loginAsHR, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

