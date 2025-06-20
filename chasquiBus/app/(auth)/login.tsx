import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.4:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        data = {};
      }
    
      // Éxito si status 2xx y hay access_token
      if (response.ok && data.access_token) {
        await AsyncStorage.setItem('access_token', data.access_token);
        setError('');
        setShowSuccessModal(true);
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
        setTimeout(() => {
          Animated.timing(successAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowSuccessModal(false);
            router.replace('/(tabs)');
          });
        }, 1200);
      } else if (response.status === 401) {
        setError('Correo o contraseña incorrectos.');
      } else if (data.message) {
        setError(data.message);
      } else {
        setError('Error al iniciar sesión. Intenta nuevamente.');
      }
    } catch (e) {
      setError('Error de red. Intenta nuevamente.');
    }
    setLoading(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerStyle: {
            backgroundColor: '#E6F0FF',
          },
          headerShadowVisible: false,
          headerTintColor: '#0F172A',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingLeft: 16 }}
              accessibilityLabel="Volver"
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#E6F0FF', '#FFFFFF']}
          locations={[0, 0.2]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Inicio Sesión</Text>

            <Text style={styles.subtitle}>
              ¡Planifica tu viaje con facilidad y{'\n'}viaja más tranquilo!
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="hello@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>Contraseña</Text>
                <Link href="/(auth)/forgot-password" style={styles.forgotText}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </View>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>Mantenerme registrado</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
              <Text style={styles.loginButtonText}>{loading ? 'Cargando...' : 'Iniciar Sesión'}</Text>
            </TouchableOpacity>

            {error ? (
              <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>
            ) : null}

            <Link href="/(auth)/register" style={styles.createAccountText}>
              Crear una cuenta
            </Link>
          </View>
        </LinearGradient>
      </SafeAreaView>
      {/* Modal de éxito */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <Animated.View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.35)',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: successAnim,
        }}>
          <View style={styles.successModalBox}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
            </View>
            <Text style={styles.successTitle}>¡Bienvenido!</Text>
            <Text style={styles.successSubtitle}>Inicio de sesión exitoso</Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7B61FF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#7B61FF',
    borderRadius: 30,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotText: {
    color: '#7B61FF',
    fontSize: 14,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7B61FF',
    borderRadius: 30,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  eyeIcon: {
    padding: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#7B61FF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7B61FF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#0F172A',
  },
  loginButton: {
    backgroundColor: '#7B61FF',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountText: {
    color: '#7B61FF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  successModalBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 260,
  },
  successIconCircle: {
    backgroundColor: '#E6F9ED',
    borderRadius: 50,
    padding: 12,
    marginBottom: 18,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
});
