import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';

export default function PassengerInfoScreen() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [passengers, setPassengers] = useState([
    { id: 1, cedula: '', nombre: '', edad: '', genero: '' },
    { id: 2, cedula: '', nombre: '', edad: '', genero: '' }
  ]);
  const [checkingToken, setCheckingToken] = React.useState(true);

  React.useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        router.replace('/(auth)/login');
      } else {
        setCheckingToken(false);
      }
    };
    checkToken();
  }, []);

  if (checkingToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={{ marginTop: 16, color: '#7B61FF', fontWeight: 'bold' }}>Validando sesión...</Text>
      </View>
    );
  }

  const handleLogout = () => {
    setShowMenu(false);
    router.replace('/(auth)/login');
  };

  const handleViewReservations = () => {
    setShowMenu(false);
    router.push('/tickets');
  };

  const handleContinue = () => {
    // Handle reservation continuation
    console.log('Continuing with reservation', passengers);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: '#E6F0FF' }
        }}
      />
      <View style={styles.container}>
        <StatusBar style="dark" />
        <LinearGradient
          colors={['#E6F0FF', '#FFFFFF']}
          locations={[0, 0.2]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
            </Pressable>
            <ThemedText style={styles.headerTitle}>Información del viajero</ThemedText>
            <View style={styles.notificationIcon}>
              <Ionicons name="notifications-outline" size={24} color="#0F172A" />
            </View>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.userInfo}>
              <Pressable onPress={() => setShowMenu(!showMenu)}>
                <Image
                  source={require('../assets/images/avatar.png')}
                  style={styles.avatar}
                />
              </Pressable>
              <View>
                <ThemedText style={styles.greeting}>Hola Saduni Silva!</ThemedText>
                <ThemedText style={styles.subtitle}>Elige tu asiento</ThemedText>
              </View>
            </View>

            {/* Menu desplegable */}
            <Modal
              visible={showMenu}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowMenu(false)}
            >
              <Pressable 
                style={styles.modalOverlay}
                onPress={() => setShowMenu(false)}
              >
                <View style={[styles.menuContainer, {
                  top: 120,
                  left: 16,
                }]}>
                  <Pressable 
                    style={styles.menuItem}
                    onPress={handleViewReservations}
                  >
                    <Ionicons name="ticket-outline" size={20} color="#0F172A" />
                    <Text style={styles.menuItemText}>Mis Reservas</Text>
                  </Pressable>
                  
                  <View style={styles.menuDivider} />
                  
                  <Pressable 
                    style={styles.menuItem}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={[styles.menuItemText, styles.logoutText]}>
                      Cerrar Sesión
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>

            <View style={styles.tripCard}>
              <ThemedText style={styles.busName}>El Dorado</ThemedText>
              <View style={styles.tripDetails}>
                <ThemedText style={styles.tripType}>A/C Sleeper (2+2)</ThemedText>
                <ThemedText style={styles.tripTime}>9:00 AM — 9:45 AM</ThemedText>
              </View>
              <View style={styles.busIconContainer}>
                <Ionicons name="bus-outline" size={32} color="#FFFFFF" style={{ transform: [{ scaleX: -1 }] }} />
              </View>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.scanSection}>
                <View style={styles.scanHeader}>
                  <ThemedText style={styles.scanText}>Scanear cédula</ThemedText>
                  <View style={styles.scannerIcon}>
                    <MaterialIcons name="qr-code-scanner" size={24} color="#7B61FF" />
                  </View>
                </View>
                <TextInput
                  style={styles.scanInput}
                  placeholder="Ingresar número de cédula"
                  placeholderTextColor="#64748B"
                />
              </View>

              {passengers.map((passenger, index) => (
                <View key={passenger.id} style={styles.passengerForm}>
                  <ThemedText style={styles.passengerTitle}>Pasajero {index + 1}</ThemedText>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Cédula"
                    placeholderTextColor="#64748B"
                    value={passenger.cedula}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Nombre completo"
                    placeholderTextColor="#64748B"
                    value={passenger.nombre}
                  />

                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.ageInput]}
                      placeholder="Edad"
                      placeholderTextColor="#64748B"
                      value={passenger.edad}
                    />
                    
                    <View style={styles.genderContainer}>
                      <Pressable
                        style={[
                          styles.genderButton,
                          passenger.genero === 'Hombre' && styles.genderButtonActive
                        ]}
                      >
                        <ThemedText style={[
                          styles.genderButtonText,
                          passenger.genero === 'Hombre' && styles.genderButtonTextActive
                        ]}>Hombre</ThemedText>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.genderButton,
                          passenger.genero === 'Mujer' && styles.genderButtonActive
                        ]}
                      >
                        <ThemedText style={[
                          styles.genderButtonText,
                          passenger.genero === 'Mujer' && styles.genderButtonTextActive
                        ]}>Mujer</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}

              {/* Continue Button */}
              <Pressable
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <Text style={styles.continueButtonText}>
                  Continuar para reservar
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Bottom Navigation Bar */}
          <View style={styles.bottomNav}>
            <Pressable 
              style={[styles.navItem]} 
              onPress={() => router.push('/')}
            >
              <View style={styles.navIconContainer}>
                <Ionicons name="home-outline" size={24} color="#FFFFFF" />
              </View>
            </Pressable>
            <Pressable 
              style={[styles.navItem]} 
              onPress={() => router.push('/tickets')}
            >
              <View style={[styles.navIconContainer, styles.activeNavItem]}>
                <Ionicons name="ticket-outline" size={24} color="#FFFFFF" />
              </View>
            </Pressable>
            <Pressable 
              style={[styles.navItem]} 
              onPress={() => router.push('/profile')}
            >
              <View style={styles.navIconContainer}>
                <Ionicons name="person-outline" size={24} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#7B61FF',
    marginTop: 4,
  },
  tripCard: {
    backgroundColor: '#7B61FF',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  busName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tripDetails: {
    marginTop: 8,
  },
  tripType: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tripTime: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  busIconContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -16 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  scanSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  scannerIcon: {
    backgroundColor: '#F0EEFF',
    padding: 8,
    borderRadius: 8,
  },
  scanInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passengerForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passengerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  ageInput: {
    flex: 1,
  },
  genderContainer: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  genderButtonActive: {
    backgroundColor: '#7B61FF',
    borderColor: '#7B61FF',
  },
  genderButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  logoutText: {
    color: '#EF4444',
  },
  continueButton: {
    backgroundColor: '#7B61FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    marginTop: 20,
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#5B41FF',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNavItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ scale: 1.1 }],
  },
}); 