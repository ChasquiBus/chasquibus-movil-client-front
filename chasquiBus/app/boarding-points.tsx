import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';

const boardingPoints = [
  'Terminal Terrestre',
  'Parque Industrial',
  'Mall de los Andes',
  'Redondel Huachi Chico',
  'Plaza Urbina'
];

const destinationPoints = [
  'Terminal Quitumbe',
  'Terminal Carcelén',
  'Parada Sur',
  'Centro Histórico',
  'La Mariscal'
];

export default function BoardingPointsScreen() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showBoardingPoints, setShowBoardingPoints] = useState(false);
  const [showDestinationPoints, setShowDestinationPoints] = useState(false);
  const [selectedBoarding, setSelectedBoarding] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  const handleLogout = () => {
    setShowMenu(false);
    router.replace('/(auth)/login');
  };

  const handleViewReservations = () => {
    setShowMenu(false);
    router.push('/tickets');
  };

  const handleContinue = () => {
    if (selectedBoarding && selectedDestination) {
      // Navigate to next screen with selected points
      router.push('/passenger-info');
    }
  };

  const renderPointSelector = (points: string[], isBoarding: boolean) => {
    const visible = isBoarding ? showBoardingPoints : showDestinationPoints;
    const setVisible = isBoarding ? setShowBoardingPoints : setShowDestinationPoints;
    const selected = isBoarding ? selectedBoarding : selectedDestination;
    const setSelected = isBoarding ? setSelectedBoarding : setSelectedDestination;

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.pointsContainer}>
            <ThemedText style={styles.pointsTitle}>
              {isBoarding ? 'Punto de Embarque' : 'Punto de Destino'}
            </ThemedText>
            {points.map((point, index) => (
              <Pressable
                key={index}
                style={[
                  styles.pointItem,
                  selected === point && styles.selectedPoint
                ]}
                onPress={() => {
                  setSelected(point);
                  setVisible(false);
                }}
              >
                <ThemedText style={[
                  styles.pointText,
                  selected === point && styles.selectedPointText
                ]}>
                  {point}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    );
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
            <ThemedText style={styles.headerTitle}>Puntos de Embarque</ThemedText>
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
              <View style={styles.cityContainer}>
                <ThemedText style={styles.cityText}>Ambato</ThemedText>
                <View style={styles.switchIcon}>
                  <Ionicons name="swap-horizontal" size={24} color="#FFFFFF" />
                </View>
                <ThemedText style={styles.cityText}>Quito</ThemedText>
              </View>
              <View style={styles.dateContainer}>
                <ThemedText style={styles.dateText}>
                  08 de diciembre de 2024 | Domingo
                </ThemedText>
              </View>
            </View>

            <View style={styles.busInfoCard}>
              <View style={styles.busDetails}>
                <ThemedText style={styles.busName}>El Dorado</ThemedText>
                <ThemedText style={styles.busType}>A/C Sleeper (2+2)</ThemedText>
                <ThemedText style={styles.busTime}>9:00 AM — 9:45 AM</ThemedText>
                <ThemedText style={styles.seatsLeft}>Quedan 15 asientos</ThemedText>
              </View>
              <View style={styles.priceContainer}>
                <ThemedText style={styles.price}>4 $</ThemedText>
                <ThemedText style={styles.duration}>45 Min</ThemedText>
              </View>
            </View>

            <View style={styles.selectionContainer}>
              <Pressable
                style={styles.selector}
                onPress={() => setShowBoardingPoints(true)}
              >
                <View style={styles.selectorIcon}>
                  <Ionicons name="location-outline" size={24} color="#7B61FF" />
                </View>
                <View style={styles.selectorContent}>
                  <ThemedText style={styles.selectorLabel}>
                    Selecciona el punto de embarque
                  </ThemedText>
                  {selectedBoarding && (
                    <ThemedText style={styles.selectedText}>
                      {selectedBoarding}
                    </ThemedText>
                  )}
                </View>
                <Ionicons name="chevron-down" size={24} color="#64748B" />
              </Pressable>

              <Pressable
                style={styles.selector}
                onPress={() => setShowDestinationPoints(true)}
              >
                <View style={styles.selectorIcon}>
                  <Ionicons name="location-outline" size={24} color="#7B61FF" />
                </View>
                <View style={styles.selectorContent}>
                  <ThemedText style={styles.selectorLabel}>
                    Selecciona el punto de destino
                  </ThemedText>
                  {selectedDestination && (
                    <ThemedText style={styles.selectedText}>
                      {selectedDestination}
                    </ThemedText>
                  )}
                </View>
                <Ionicons name="chevron-down" size={24} color="#64748B" />
              </Pressable>

              {renderPointSelector(boardingPoints, true)}
              {renderPointSelector(destinationPoints, false)}

              <View style={styles.fareContainer}>
                <ThemedText style={styles.fareLabel}>Tarifa total</ThemedText>
                <ThemedText style={styles.fareAmount}>8 $</ThemedText>
              </View>

              <Pressable
                style={[
                  styles.continueButton,
                  (!selectedBoarding || !selectedDestination) && styles.continueButtonDisabled
                ]}
                onPress={handleContinue}
                disabled={!selectedBoarding || !selectedDestination}
              >
                <Text style={styles.continueButtonText}>
                  Continuar
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
  cityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  switchIcon: {
    marginHorizontal: 12,
  },
  dateContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  busInfoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  busDetails: {
    flex: 1,
  },
  busName: {
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '600',
  },
  busType: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  busTime: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  seatsLeft: {
    fontSize: 14,
    color: '#22C55E',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    color: '#7B61FF',
    fontWeight: '600',
  },
  duration: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  selectionContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  selector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectorContent: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  selectedText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  pointsTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  pointItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  selectedPoint: {
    backgroundColor: '#7B61FF',
  },
  pointText: {
    fontSize: 16,
    color: '#0F172A',
  },
  selectedPointText: {
    color: '#FFFFFF',
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  fareLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  fareAmount: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '600',
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
  continueButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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