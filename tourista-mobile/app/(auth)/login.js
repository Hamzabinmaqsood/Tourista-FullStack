// // In app/(auth)/login.js
// import React, { useState } from 'react';
// import { View, Text, TextInput, StyleSheet, Alert, Image, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useAuth } from '../../context/AuthContext';
// import { COLORS } from '../../constants/theme';
// import axios from 'axios';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// const API_URL = 'http://192.168.100.23:8000/api/auth/login/';

// const AnimatedInput = ({ icon, placeholder, value, onChangeText, secureTextEntry = false, isPassword = false, onToggleVisibility, isVisible }) => {
//   const [isFocused, setIsFocused] = useState(false);
//   const labelPosition = useSharedValue(value ? -12 : 16);
//   const labelSize = useSharedValue(value ? 12 : 16);
//   const animatedLabelStyle = useAnimatedStyle(() => ({ top: withTiming(labelPosition.value), fontSize: withTiming(labelSize.value) }));
//   const onFocus = () => { setIsFocused(true); labelPosition.value = -12; labelSize.value = 12; };
//   const onBlur = () => { setIsFocused(false); if (!value) { labelPosition.value = 16; labelSize.value = 16; } };

//   return (
//     <View style={[styles.inputContainer, isFocused && { borderColor: COLORS.primary }]}>
//       <Ionicons name={icon} size={20} color={isFocused ? COLORS.primary : '#ccc'} style={styles.inputIcon} />
//       <Animated.Text style={[styles.label, animatedLabelStyle]}>{placeholder}</Animated.Text>
//       <TextInput style={styles.input} value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry} onFocus={onFocus} onBlur={onBlur} placeholderTextColor="transparent" />
//       {isPassword && (
//         <TouchableOpacity onPress={onToggleVisibility} style={styles.eyeIcon}>
//           <Ionicons name={isVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color="#ccc" />
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// export default function LoginScreen() {
//   const { login, loginAsGuest } = useAuth();
//   const router = useRouter();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);

//   const handleLogin = async () => {
//     setIsLoading(true);
//     try {
//       const response = await axios.post(API_URL, { username: username.trim(), password });
//       await login(response.data.access, response.data.refresh);
//     } catch (error) {
//       Alert.alert('Login Failed', 'Please check your credentials.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <ImageBackground source={require('../../assets/images/login-bg.png')} style={styles.container}>
//       <LinearGradient colors={['rgba(10, 61, 98, 0.5)', 'rgba(10, 61, 98, 0.9)']} style={styles.overlay} />
//       <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.contentContainer}>
//         <Text style={styles.welcomeTitle}>Welcome back, Explorer!</Text>
//         <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
//         <BlurView intensity={30} tint="dark" style={styles.formContainer}>
//           <AnimatedInput icon="person-outline" placeholder="Username" value={username} onChangeText={setUsername} />
//           <AnimatedInput icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} isPassword={true} isVisible={isPasswordVisible} onToggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)} />
//           <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
//             <LinearGradient colors={[COLORS.primary, '#FF8C00']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
//               {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🔒 Login to Tourista</Text>}
//             </LinearGradient>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={loginAsGuest}>
//             <Text style={styles.guestButton}>➡️ Continue as Guest</Text>
//           </TouchableOpacity>
//         </BlurView>
//         <TouchableOpacity onPress={() => router.push('/register')}>
//           <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
//         </TouchableOpacity>
//       </KeyboardAvoidingView>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   overlay: { ...StyleSheet.absoluteFillObject },
//   contentContainer: { flex: 1, justifyContent: 'center', padding: 20 },
//   welcomeTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10, textShadowRadius: 5, textShadowColor: '#000' },
//   logo: { width: 180, height: 60, resizeMode: 'contain', alignSelf: 'center', marginBottom: 30 },
//   formContainer: { borderRadius: 20, padding: 20, overflow: 'hidden' },
//   inputContainer: { flexDirection: 'row', alignItems: 'center', height: 55, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, marginBottom: 15, paddingHorizontal: 10, borderWidth: 1, borderColor: 'transparent' },
//   inputIcon: { marginRight: 10 },
//   label: { position: 'absolute', left: 45, color: '#ccc' },
//   input: { flex: 1, height: '100%', color: '#fff', fontSize: 16 },
//   eyeIcon: { padding: 5 },
//   button: { height: 50, borderRadius: 10, overflow: 'hidden', marginTop: 10 },
//   gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
//   guestButton: { color: '#fff', textAlign: 'center', marginTop: 20, fontSize: 16, opacity: 0.9 },
//   linkText: { color: '#fff', textAlign: 'center', marginTop: 30, fontSize: 16 },
// });


import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.18.99:8000/api/auth/login/';
// 10.44.241.189     10.44.241.189

export default function LoginScreen() {
  const { setAuthState } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(API_URL, { username, password });
      const { access, refresh } = response.data;
      await AsyncStorage.setItem('token', access);
      await AsyncStorage.setItem('refreshToken', refresh);
      setAuthState({ token: access, authenticated: true });
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Log In" onPress={handleLogin} />
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 20 } });