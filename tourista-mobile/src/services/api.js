// // In src/services/api.js
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_BASE_URL = 'http://192.168.100.23:8000';

// //192.168.100.23  
// const api = axios.create({ baseURL: API_BASE_URL });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const refreshToken = await AsyncStorage.getItem('refreshToken');
//         if (refreshToken) {
//           const { data } = await axios.post(`${API_BASE_URL}/api/auth/login/refresh/`, { refresh: refreshToken });
//           await AsyncStorage.setItem('token', data.access);
//           api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
//           originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
//           return api(originalRequest);
//         }
//       } catch (refreshError) {
//         // This is where a global logout event should be emitted.
//         // For now, the user will be effectively logged out on the next app launch.
//         console.log("Refresh token failed, user needs to log in again.");
//       }
//     }
//     return Promise.reject(error);
//   }
// );
// export default api;


import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.18.99:8000';
// 192.168.18.99     192.168.43.189
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        // If no refresh token, logout is required. Let the app handle it.
        await AsyncStorage.removeItem('token');
        return Promise.reject(error);
      }
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/login/refresh/`, { refresh: refreshToken });
      await AsyncStorage.setItem('token', data.access);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
      originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
      return api(originalRequest);
    } catch (refreshError) {
      await AsyncStorage.multiRemove(['token', 'refreshToken']);
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
});

export default api;