import React, { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext();
export const useAuth = () => {
  
  return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  // Call this function when the user logs in
  const login = (user, token) => {
    setAuthState({
      isAuthenticated: true,
      user: user,
      token: token,
    });
    localStorage.setItem('access_token', token);
    localStorage.setItem('role', user.role);
    // Set any other necessary items in local storage
  };

  // Call this function when the user logs out
  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    // Clear any other necessary items from local storage
  };

  // useEffect to sync auth state with local storage on load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    if (token) {
      setAuthState({ isAuthenticated: true, userRole: role });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
