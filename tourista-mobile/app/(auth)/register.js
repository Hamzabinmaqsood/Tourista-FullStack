// In app/(auth)/register.js (FINAL, COMPLETE, AND WORKING VERSION)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ImageBackground, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Picker } from '@react-native-picker/picker';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, interpolate, interpolateColor } from 'react-native-reanimated';

// Advanced Animated Floating Label Input Component
const AnimatedInput = ({ icon, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default' }) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    focusAnim.value = withTiming(value || isFocused ? 1 : 0, { duration: 200 });
  }, [value, isFocused]);

  const animatedLabelStyle = useAnimatedStyle(() => ({
    top: interpolate(focusAnim.value, [0, 1], [18, -10]),
    fontSize: interpolate(focusAnim.value, [0, 1], [16, 12]),
    color: interpolateColor(focusAnim.value, [0, 1], ['#aaa', COLORS.primary]),
  }));

  return (
    <View style={[styles.inputContainer, isFocused && { borderColor: COLORS.primary }]}>
      <Ionicons name={icon} size={20} color={isFocused ? COLORS.primary : '#ccc'} style={styles.inputIcon} />
      <Animated.Text style={[styles.label, animatedLabelStyle]} pointerEvents="none">{placeholder}</Animated.Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
      />
    </View>
  );
};

// Animated Progress Bar Indicator
const ProgressIndicator = ({ step }) => (
  <View style={styles.progressContainer}>
    <Text style={styles.progressText}>Step {step} of 3</Text>
    <View style={styles.progressBarBackground}>
      <Animated.View style={[styles.progressBar, { width: withTiming(`${(step / 3) * 100}%`, { duration: 300 }) }]} />
    </View>
  </View>
);

export default function RegisterScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '', email: '', travelStyle: 'RELAXATION',
    budget: '', password: '', password2: '',
  });

  const arrowTranslateX = useSharedValue(0);
  const animatedArrowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: arrowTranslateX.value }] }));

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.username || !formData.email) {
        Alert.alert('Invalid Info', 'Please enter your username and email.'); return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.'); return;
      }
    }
    arrowTranslateX.value = withSequence(withTiming(5, { duration: 150 }), withTiming(0, { duration: 150 }));
    setStep(s => s + 1);
  };

  const handleRegister = async () => {
    if (formData.password !== formData.password2 || formData.password.length < 8) {
      Alert.alert('Invalid Password', 'Passwords must match and be at least 8 characters long.'); return;
    }
    setIsLoading(true);
    try {
      await api.post('/api/auth/register/', {
        username: formData.username, email: formData.email,
        password: formData.password, password2: formData.password2,
      });

      const loginResponse = await api.post('/api/auth/login/', { username: formData.username, password: formData.password });
      const tempApi = api;
      tempApi.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.access}`;
      await tempApi.patch('/api/auth/profile/', {
        profile: { travel_style: formData.travelStyle, budget: formData.budget || null }
      });
      
      Alert.alert('Welcome to Tourista!', 'Your account is ready. Please log in.', [{ text: 'OK', onPress: () => router.replace('/login') }]);
    } catch (error) {
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'An unknown error occurred.';
      Alert.alert('Registration Failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../../assets/images/login-bg.png')} style={styles.container}>
      <LinearGradient colors={['rgba(10, 61, 98, 0.7)', 'rgba(10, 61, 98, 0.95)']} style={styles.overlay} />
      <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.contentContainer}>
        <Text style={styles.title}>Plan Your Perfect Journey</Text>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />
        <ProgressIndicator step={step} />

        <BlurView intensity={20} tint="dark" style={styles.formContainer}>
          {step === 1 && (
            <>
              <Text style={styles.separator}>Start with a Social Account</Text>
              <View style={styles.socialContainer}>
                <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#DB4437'}]}><Ionicons name="logo-google" size={24} color="#fff" /></TouchableOpacity>
                <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#4267B2'}]}><Ionicons name="logo-facebook" size={24} color="#fff" /></TouchableOpacity>
                <TouchableOpacity style={[styles.socialButton, {backgroundColor: '#000000'}]}><Ionicons name="logo-apple" size={24} color="#fff" /></TouchableOpacity>
              </View>
              <Text style={styles.separator}>— Or Sign Up with Email —</Text>
              <AnimatedInput icon="person-outline" placeholder="Username" value={formData.username} onChangeText={v => handleInputChange('username', v)} />
              <AnimatedInput icon="mail-outline" placeholder="Email Address" value={formData.email} onChangeText={v => handleInputChange('email', v)} keyboardType="email-address" />
            </>
          )}
          {step === 2 && (
            <>
              <Text style={styles.pickerLabel}>What's your travel style?</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={formData.travelStyle} onValueChange={v => handleInputChange('travelStyle', v)} itemStyle={{ color: '#fff' }} dropdownIconColor="#fff">
                  <Picker.Item label="Relaxation" value="RELAXATION" />
                  <Picker.Item label="Adventure" value="ADVENTURE" />
                  <Picker.Item label="Cultural" value="CULTURAL" />
                  <Picker.Item label="Family" value="FAMILY" />
                  <Picker.Item label="Budget" value="BUDGET" />
                </Picker>
              </View>
              <AnimatedInput icon="wallet-outline" placeholder="Daily Budget (Optional, in Rs)" value={formData.budget} onChangeText={v => handleInputChange('budget', v)} keyboardType="numeric" />
            </>
          )}
          {step === 3 && (
            <>
              <AnimatedInput icon="lock-closed-outline" placeholder="Password (min. 8 characters)" value={formData.password} onChangeText={v => handleInputChange('password', v)} secureTextEntry />
              <AnimatedInput icon="lock-closed-outline" placeholder="Confirm Password" value={formData.password2} onChangeText={v => handleInputChange('password2', v)} secureTextEntry />
            </>
          )}
        </BlurView>
        
        <TouchableOpacity style={styles.button} onPress={step < 3 ? handleNextStep : handleRegister} disabled={isLoading}>
          <LinearGradient colors={[COLORS.primary, '#FF8C00']} style={styles.gradient}>
            {isLoading ? <ActivityIndicator color="#fff" /> : (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.buttonText}>{step < 3 ? 'Next Step' : '🚀 Create My Account'}</Text>
                {step < 3 && <Animated.View style={animatedArrowStyle}><Ionicons name="arrow-forward" size={18} color="#fff" style={{marginLeft: 5}}/></Animated.View>}
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 1, padding: 5 },
  contentContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  progressContainer: { marginBottom: 30 },
  progressText: { color: '#ccc', textAlign: 'center', marginBottom: 5 },
  progressBarBackground: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: COLORS.primary },
  formContainer: { borderRadius: 20, overflow: 'hidden', padding: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 55, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: 'transparent' },
  inputIcon: { marginHorizontal: 15 },
  label: { position: 'absolute', left: 50, backgroundColor: 'transparent', paddingHorizontal: 4 },
  input: { flex: 1, color: '#fff', fontSize: 16, height: '100%', paddingHorizontal: 5 },
  button: { borderRadius: 10, overflow: 'hidden', marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  gradient: { paddingVertical: 15, paddingHorizontal: 20, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  separator: { color: '#ccc', textAlign: 'center', marginVertical: 15 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center' },
  socialButton: { borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10, elevation: 5 },
  pickerLabel: { color: '#fff', fontSize: 16, marginBottom: 10, paddingLeft: 5 },
  pickerContainer: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10, borderWidth: 1, borderColor: 'transparent', marginBottom: 15, overflow: 'hidden' },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
});