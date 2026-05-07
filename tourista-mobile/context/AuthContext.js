// // In context/AuthContext.js
// import React, { createContext, useContext, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../src/services/api';
// import { jwtDecode } from 'jwt-decode';

// // 1. Create the context
// const AuthContext = createContext(null);

// // 2. Create the Provider component. This will be the default export.
// export default function AuthProvider({ children }) {
//   const [authState, setAuthState] = useState({
//     token: null,
//     authenticated: false,
//     isGuest: false,
//     userId: null,
//   });

//   const login = async (token, refreshToken) => {
//     try {
//       const decodedToken = jwtDecode(token);
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       await AsyncStorage.setItem('token', token);
//       await AsyncStorage.setItem('refreshToken', refreshToken);
//       setAuthState({ token, authenticated: true, isGuest: false, userId: decodedToken.user_id });
//     } catch (e) {
//       console.error("Failed to process token on login", e);
//     }
//   };

//   const loginAsGuest = () => {
//     delete api.defaults.headers.common['Authorization'];
//     setAuthState({ token: null, authenticated: true, isGuest: true, userId: null });
//   };

//   const logout = async () => {
//     delete api.defaults.headers.common['Authorization'];
//     await AsyncStorage.removeItem('token');
//     await AsyncStorage.removeItem('refreshToken');
//     setAuthState({ token: null, authenticated: false, isGuest: false, userId: null });
//   };

//   return (
//     <AuthContext.Provider value={{ authState, login, logout, loginAsGuest }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // 3. Create and export the custom hook for easy access.
// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// In context/AuthContext.js
// In context/AuthContext.js (FINAL, DEFINITIVE, CORRECTED VERSION)
import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    token: null,
    authenticated: false,
    isGuest: false,
    userId: null,
  });

  const login = async (token, refreshToken) => {
    try {
      const decodedToken = jwtDecode(token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Use Promise.all to do these in parallel for speed
      await Promise.all([
        AsyncStorage.setItem('token', token),
        AsyncStorage.setItem('refreshToken', refreshToken)
      ]);
      setAuthState({ token, authenticated: true, isGuest: false, userId: decodedToken.user_id });
      // THIS IS THE FIX: Explicitly return a resolved promise on success.
      return Promise.resolve();
    } catch (e) {
      console.error("Failed to process token on login", e);
      // THIS IS THE FIX: Explicitly return a rejected promise on failure.
      return Promise.reject(e);
    }
  };

  const loginAsGuest = () => {
    delete api.defaults.headers.common['Authorization'];
    setAuthState({ token: null, authenticated: true, isGuest: true, userId: null });
  };

  const logout = async () => {
    delete api.defaults.headers.common['Authorization'];
    await AsyncStorage.multiRemove(['token', 'refreshToken']);
    setAuthState({ token: null, authenticated: false, isGuest: false, userId: null });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};