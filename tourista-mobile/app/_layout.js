// // In app/layout.js
// import React, { useEffect, useState } from 'react';
// import AuthProvider, { useAuth } from '../context/AuthContext';
// import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { View, ActivityIndicator } from 'react-native';

// SplashScreen.preventAutoHideAsync();

// function InitialLayout() {
//   const { authState, login } = useAuth();
//   const [isReady, setIsReady] = useState(false);
//   const segments = useSegments();
//   const router = useRouter();

//   useEffect(() => {
//     const checkToken = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         const refreshToken = await AsyncStorage.getItem('refreshToken');
//         if (token && refreshToken) {
//           await login(token, refreshToken);
//         }
//       } catch (e) { /* User remains logged out */ } 
//       finally {
//         setIsReady(true);
//         SplashScreen.hideAsync();
//       }
//     };
//     checkToken();
//   }, []);

//   useEffect(() => {
//     if (!isReady) return;
//     const inAppGroup = segments[0] === '(app)';

//     if (authState.authenticated && !inAppGroup) {
//       router.replace('/home');
//     } else if (!authState.authenticated && inAppGroup) {
//       router.replace('/login');
//     }
//   }, [authState.authenticated, isReady, segments]);

//   if (!isReady) {
//     return null; // Render nothing until auth state is determined
//   }
//   return <Slot />;
// }

// export default function RootLayout() {
//   return (
//     <AuthProvider>
//       <InitialLayout />
//     </AuthProvider>
//   );
// }


// In app/_layout.js
import React, { useEffect, useState } from 'react';
// THIS IS THE FIX: Correctly import the default AuthProvider and named useAuth hook
import AuthProvider, { useAuth } from '../context/AuthContext';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { authState, login } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (token && refreshToken) {
          // Use the login function to initialize the app state and headers
          await login(token, refreshToken);
        }
      } catch (e) {
        // User remains logged out
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const inAppGroup = segments[0] === '(app)';

    if (authState.authenticated && !inAppGroup) {
      router.replace('/home');
    } else if (!authState.authenticated && inAppGroup) {
      router.replace('/login');
    }
  }, [authState.authenticated, isReady, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}