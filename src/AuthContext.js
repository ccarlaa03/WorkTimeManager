import React, { createContext, useState, useContext, useEffect } from 'react';

// Creăm un context pentru autentificare
export const AuthContext = createContext();

// Funcție pentru utilizarea contextului de autentificare
export const useAuth = () => {
  return useContext(AuthContext);
};

// Furnizorul de autentificare care va înconjura componentele copil
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false, // Starea autentificării
    user: null,             // Informațiile utilizatorului
    token: null,            // Tokenul de acces
  });

  // Funcție apelată când utilizatorul se autentifică
  const login = (user, token) => {
    setAuthState({
      isAuthenticated: true, // Utilizatorul este autentificat
      user: user,            // Setăm informațiile utilizatorului
      token: token,          // Setăm tokenul de acces
    });
    // Stocăm tokenul de acces și rolul utilizatorului în local storage
    localStorage.setItem('access_token', token);
    localStorage.setItem('role', user.role);
  };

  // Funcție apelată când utilizatorul se deconectează
  const logout = () => {
    setAuthState({
      isAuthenticated: false, // Utilizatorul nu este autentificat
      user: null,             // Resetăm informațiile utilizatorului
      token: null             // Resetăm tokenul de acces
    });
    // Eliminăm tokenul de acces și rolul utilizatorului din local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
  };

  // useEffect pentru sincronizarea stării de autentificare cu local storage la încărcare
  useEffect(() => {
    const token = localStorage.getItem('access_token'); // Obținem tokenul din local storage
    const role = localStorage.getItem('role');          // Obținem rolul din local storage
    if (token) {
      setAuthState({ isAuthenticated: true, userRole: role }); // Setăm starea de autentificare
    }
  }, []);

  return (
    // Furnizăm starea și funcțiile de autentificare copiilor componentelor
    <AuthContext.Provider value={{ ...authState, login, logout, user: authState.user }}>
      {children}
    </AuthContext.Provider>
  );
};
