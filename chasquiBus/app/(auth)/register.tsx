import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [esDiscapacitado, setEsDiscapacitado] = useState(false);
  const [porcentajeDiscapacidad, setPorcentajeDiscapacidad] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [fechaNacimientoDisplay, setFechaNacimientoDisplay] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.4:3005/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          nombre: name,
          apellido,
          cedula,
          telefono,
          activo: true,
          rol: 4,
          esDiscapacitado,
          porcentajeDiscapacidad: esDiscapacitado ? Number(porcentajeDiscapacidad) : 0,
          fechaNacimiento,
        }),
      });
      if (response.status === 201) {
        setSuccess('¡Registro exitoso!');
        setName('');
        setApellido('');
        setCedula('');
        setTelefono('');
        setEmail('');
        setPassword('');
        setFechaNacimiento('');
        setFechaNacimientoDisplay('');
        setEsDiscapacitado(false);
        setPorcentajeDiscapacidad('');
        setAcceptedTerms(false);
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500);
      } else if (response.status === 409) {
        setError('El correo o cédula ya está registrado.');
      } else {
        setError('Error al registrar. Verifica los datos.');
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
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              <Text style={styles.title}>Crear una cuenta</Text>
              <Text style={styles.subtitle}>¡ChasquiBus tu mejor elección!</Text>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Apellido</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Pérez"
                    value={apellido}
                    onChangeText={setApellido}
                    autoCapitalize="words"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Cédula</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1234567890"
                    value={cedula}
                    onChangeText={setCedula}
                    keyboardType="numeric"
                    maxLength={10}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+593987654321"
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                    placeholderTextColor="#999"
                  />
                </View>

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
                  <Text style={styles.label}>Contraseña</Text>
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

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Fecha de Nacimiento</Text>
                  <TouchableOpacity
                    style={[styles.input, { justifyContent: 'center' }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={{ color: fechaNacimiento ? '#0F172A' : '#999' }}>
                      {fechaNacimientoDisplay ? fechaNacimientoDisplay : 'Selecciona la fecha'}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={fechaNacimiento ? new Date(fechaNacimiento) : new Date()}
                      mode="date"
                      display="default"
                      maximumDate={new Date()}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          const year = selectedDate.getFullYear();
                          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          const day = String(selectedDate.getDate()).padStart(2, '0');
                          setFechaNacimiento(`${year}-${month}-${day}`);
                          setFechaNacimientoDisplay(`${day}/${month}/${year}`);
                        }
                      }}
                    />
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>¿Es discapacitado?</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => setEsDiscapacitado(true)}
                    >
                      <View style={[styles.radioOuter, esDiscapacitado && styles.radioOuterSelected]}>
                        {esDiscapacitado && <View style={styles.radioInner} />}
                      </View>
                      <Text style={{ marginLeft: 6 }}>Sí</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => setEsDiscapacitado(false)}
                    >
                      <View style={[styles.radioOuter, !esDiscapacitado && styles.radioOuterSelected]}>
                        {!esDiscapacitado && <View style={styles.radioInner} />}
                      </View>
                      <Text style={{ marginLeft: 6 }}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {esDiscapacitado && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Porcentaje de Discapacidad</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0-100"
                      value={porcentajeDiscapacidad}
                      onChangeText={setPorcentajeDiscapacidad}
                      keyboardType="numeric"
                      maxLength={3}
                      placeholderTextColor="#999"
                    />
                  </View>
                )}

                <View style={styles.termsContainer}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                  >
                    <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                      {acceptedTerms && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      Al continuar, aceptas nuestros{' '}
                      <Text style={styles.termsLink}>términos de servicio</Text>
                    </Text>
                  </TouchableOpacity>
                </View>

                {error ? (
                  <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>
                ) : null}
                {success ? (
                  <Text style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>{success}</Text>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.signUpButton,
                    (!name || !email || !password || !acceptedTerms) && styles.signUpButtonDisabled
                  ]}
                  onPress={handleSignUp}
                  disabled={!name || !email || !password || !acceptedTerms}
                >
                  <Text style={styles.signUpButtonText}>Registrarse</Text>
                </TouchableOpacity>

               

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
                  <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                    <Text style={styles.loginLink}>Inicia sesión aquí</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
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
  scrollView: {
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
  formContainer: {
    width: '100%',
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
  termsContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  termsLink: {
    color: '#7B61FF',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    backgroundColor: '#7B61FF',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpButtonDisabled: {
    opacity: 0.5,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 14,
    color: '#7B61FF',
    fontWeight: '600',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7B61FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  radioOuterSelected: {
    borderColor: '#7B61FF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7B61FF',
  },
}); 