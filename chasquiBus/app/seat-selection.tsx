import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

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
      const isSelected = prev.includes(seatId);
      let newSelection;
      
      if (isSelected) {
        newSelection = prev.filter(id => id !== seatId);
        setNotificationMessage(`Asiento ${seatId} removido`);
      } else {
        newSelection = [...prev, seatId];
        setNotificationMessage(`Asiento ${seatId} seleccionado`);
      }
      
      // Mostrar notificación
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 1500);
      
      return newSelection;
    });
  };

  // Calcular precio total
  const pricePerSeat = parseFloat(tripDetails.price.replace('$', '').trim()) || 0;
  const totalPrice = selectedSeats.length * pricePerSeat;

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
    fila: a.fila,
    columna: a.columna,
  })) as { id: string; status: 'selected' | 'reserved' | 'available'; fila: number; columna: number }[];

  useEffect(() => {
    return () => {
      setSelectedSeats([]);
    };
  }, []);

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
          
          {/* Notificación de selección */}
          {showNotification && (
            <View style={styles.notificationContainer}>
              <View style={styles.notificationBox}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.notificationText}>{notificationMessage}</Text>
              </View>
            </View>
          )}
          
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
                <Text style={styles.price}>
                  {selectedSeats.length > 0
                    ? `${totalPrice.toFixed(2)} $`
                    : `0.00 $`
                  }
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
                {/* Información de selección */}
                {selectedSeats.length > 0 && (
                  <View style={styles.selectionInfo}>
                    <View style={styles.selectionHeader}>
                      <Text style={styles.selectionText}>
                        {selectedSeats.length} asiento{selectedSeats.length > 1 ? 's' : ''} seleccionado{selectedSeats.length > 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.totalPrice}>
                        Total: ${totalPrice.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.selectedSeatsContainer}>
                      <Text style={styles.selectedSeatsLabel}>Asientos:</Text>
                      <View style={styles.selectedSeatsList}>
                        {selectedSeats.map((seatId, index) => (
                          <View key={seatId} style={styles.selectedSeatItem}>
                            <Text style={styles.selectedSeatNumber}>{seatId}</Text>
                            {index < selectedSeats.length - 1 && <Text style={styles.seatSeparator}>, </Text>}
                          </View>
                        ))}
                      </View>
                    </View>
                    <View style={styles.priceBreakdown}>
                      <Text style={styles.priceBreakdownText}>
                        ${pricePerSeat.toFixed(2)} × {selectedSeats.length} asiento{selectedSeats.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                )}
                <Pressable
                  style={[
                    styles.continueButton,
                    { opacity: selectedSeats.length > 0 ? 1 : 0.5 }
                  ]}
                  disabled={selectedSeats.length === 0}
                  onPress={() => {
                    router.push({
                      pathname: '/boarding-points',
                      params: {
                        seats: selectedSeats.join(','),
                        total: totalPrice.toFixed(2),
                        busId: params.busId || params.idBus,
                        asientosData: JSON.stringify(asientos),
                      }
                    });
                  }}
                >
                  <Text style={styles.continueButtonText}>
                    {selectedSeats.length > 0 
                      ? `Continuar con ${selectedSeats.length} asiento${selectedSeats.length > 1 ? 's' : ''}`
                      : 'Selecciona un asiento'
                    }
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
        <View style={[styles.bottomNav, { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10 }]}>
          <Pressable style={styles.navItem} onPress={() => router.replace('/(tabs)')}> 
            <Ionicons name="home-outline" size={24} color="#FFFFFF" /> 
            <Text style={{ color: '#fff', fontSize: 12, marginTop: 2 }}>Inicio</Text>
          </Pressable> 
          <Pressable style={styles.navItem} onPress={() => router.push('/tickets')}> 
            <Ionicons name="ticket-outline" size={24} color="#FFFFFF" /> 
            <Text style={{ color: '#fff', fontSize: 12, marginTop: 2 }}>Tickets</Text>
          </Pressable> 
          <Pressable style={styles.navItem} onPress={() => router.push('/profile')}> 
            <Ionicons name="person-outline" size={24} color="#FFFFFF" /> 
            <Text style={{ color: '#fff', fontSize: 12, marginTop: 2 }}>Perfil</Text>
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
  selectionInfo: {
    marginBottom: 12,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  selectedSeatsContainer: {
    marginTop: 8,
  },
  selectedSeatsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  selectedSeatsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  selectedSeatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedSeatNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7B61FF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  seatSeparator: {
    marginHorizontal: 4,
    color: '#64748B',
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
    backgroundColor: '#7B61FF',
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
  notificationContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  notificationBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  notificationText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  priceBreakdown: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  priceBreakdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
}); 