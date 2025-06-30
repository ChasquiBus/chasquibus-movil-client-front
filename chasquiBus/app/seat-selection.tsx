import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import SeatSelection from '../components/SeatSelection';
import { API_URL } from '../constants/api';

function formatDateLong(fecha: string): string {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export default function SeatSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<'lower' | 'upper'>('lower');
  const [asientos, setAsientos] = useState<any[]>([]);
  const [loadingAsientos, setLoadingAsientos] = useState(true);

  // Use the params passed from the bus selection screen
  const tripDetails = {
    origin: params.origin as string || 'Ambato',
    destination: params.destination as string || 'Quito',
    date: typeof params.date === 'string' && params.date.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
      ? formatDateLong(params.date)
      : typeof params.date === 'string'
        ? params.date
        : '08 de diciembre de 2024',
    dayOfWeek: '',
    busName: params.company as string,
    busType: params.type as string,
    departureTime: params.departure as string,
    arrivalTime: params.arrival as string,
    duration: params.duration as string,
    price: `${params.price} $`,
    availableSeats: Number(params.seatsLeft),
  };

  // Obtener configuración real de asientos
  useEffect(() => {
    const fetchAsientos = async () => {
      setLoadingAsientos(true);
      try {
        const busId = params.busId || params.idBus;
        console.log('Bus ID usado para asientos:', busId);
        if (!busId) return;
        
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(`${API_URL}/configuracion-asientos/bus/${busId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Respuesta de configuracion-asientos:', data);
        
        // Verificar si data es un array y tomar el primer elemento
        const configData = Array.isArray(data) ? data[0] : data;
        
        let posiciones = configData?.posiciones;
        if (!posiciones && configData?.posicionesJson) {
          posiciones = JSON.parse(configData.posicionesJson);
        }
        console.log('Posiciones parseadas:', posiciones);
        setAsientos(posiciones || []);
      } catch (e) {
        console.log('Error al cargar asientos:', e);
        setAsientos([]);
      }
      setLoadingAsientos(false);
    };
    fetchAsientos();
  }, [params.busId, params.idBus]);

  // Selección de asientos
  const handleSeatSelect = (seatId: number) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  // Filtrar asientos por piso
  const pisoActual = selectedFloor === 'lower' ? 1 : 2;
  const asientosPiso = asientos.filter(a => a.piso === pisoActual);

  // Adaptar para SeatSelection
  const seatsForComponent = asientosPiso.map(a => ({
    id: String(a.numeroAsiento),
    status: selectedSeats.includes(a.numeroAsiento)
      ? 'selected'
      : a.ocupado === true
        ? 'reserved'
        : 'available',
  })) as { id: string; status: 'selected' | 'reserved' | 'available' }[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
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
                <Pressable onPress={() => router.back()}>
                  <Ionicons name="arrow-back-outline" size={28} color="#0F172A" />
                </Pressable>
                <Text style={styles.headerTitle}>Elige tu asiento</Text>
                <View style={styles.notificationIcon}>
                  <Ionicons name="notifications-outline" size={24} color="#0F172A" />
                </View>
              </View>

              {/* Trip Info Card */}
              <View style={styles.tripInfoCard}>
                <View style={styles.routeContainer}>
                  <View style={styles.locationContainer}>
                    <Ionicons name="home-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.locationText}>{tripDetails.origin}</Text>
                  </View>
                  <View style={styles.swapIconContainer}>
                    <Ionicons name="bus-outline" size={28} color="#7B61FF" style={{ transform: [{ scaleX: -1 }] }} />
                  </View>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.locationText}>{tripDetails.destination}</Text>
                  </View>
                </View>
                
                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>
                    {tripDetails.date} | {tripDetails.dayOfWeek}
                  </Text>
                </View>
              </View>

              {/* Bus Details Card */}
              <View style={styles.busDetailsCard}>
                <Text style={styles.busName}>{tripDetails.busName}</Text>
                <Text style={styles.busType}>{tripDetails.busType}</Text>
                <View style={styles.timeInfo}>
                  <Text style={styles.time}>{tripDetails.departureTime}</Text>
                  <Text style={styles.duration}>{tripDetails.duration}</Text>
                  <Text style={styles.time}>{tripDetails.arrivalTime}</Text>
                </View>
                <Text style={styles.price}>{tripDetails.price}</Text>
                <Text style={styles.availableSeats}>
                  Quedan {tripDetails.availableSeats} asientos
                </Text>
              </View>

              {/* Seat Selection Component */}
              <View style={styles.seatSelectionContainer}>
                {loadingAsientos ? (
                  <Text style={{ textAlign: 'center', color: '#7B61FF', marginTop: 24 }}>Cargando asientos...</Text>
                ) : (
                  <SeatSelection
                    seats={seatsForComponent}
                    onSeatSelect={id => handleSeatSelect(Number(id))}
                    selectedFloor={selectedFloor}
                    onFloorChange={setSelectedFloor}
                  />
                )}
              </View>

              {/* Continue Button */}
              <View style={styles.bottomContainer}>
                <Pressable
                  style={[
                    styles.continueButton,
                    { opacity: selectedSeats.length > 0 ? 1 : 0.5 }
                  ]}
                  disabled={selectedSeats.length === 0}
                  onPress={() => {
                    // Handle continue with selected seats
                    console.log('Selected seats:', selectedSeats);
                  }}
                >
                  <Text style={styles.continueButtonText}>Continuar</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
        <View style={[styles.bottomNav, { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10 }]}>
          <Pressable style={styles.navItem} onPress={() => router.push('/')}> 
            <View style={styles.navIconContainer}> 
              <Ionicons name="home-outline" size={24} color="#FFFFFF" /> 
            </View> 
          </Pressable> 
          <Pressable style={styles.navItem} onPress={() => router.push('/tickets')}> 
            <View style={[styles.navIconContainer, styles.activeNavItem]}> 
              <Ionicons name="ticket-outline" size={24} color="#FFFFFF" /> 
            </View> 
          </Pressable> 
          <Pressable style={styles.navItem} onPress={() => router.push('/profile')}> 
            <View style={styles.navIconContainer}> 
              <Ionicons name="person-outline" size={24} color="#FFFFFF" /> 
            </View> 
          </Pressable> 
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: 16,
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
  tripInfoCard: {
    backgroundColor: '#7B61FF',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  swapIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  dateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  busDetailsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 8,
  },
  busName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  busType: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  duration: {
    fontSize: 14,
    color: '#64748B',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7B61FF',
    marginBottom: 8,
  },
  availableSeats: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  seatSelectionContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 0,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
    shadowOffset: { width: 0, height: -2 },
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