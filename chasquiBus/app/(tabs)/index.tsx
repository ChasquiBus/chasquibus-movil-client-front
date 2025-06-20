import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'http://192.168.1.4:3001';

// Interfaces for TypeScript type safety
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  cedula: string;
}

interface UserInfo {
  id: number;
  usuario: Usuario;
}

interface Boleto {
  id: number;
  nombre: string;
  cedula: string;
  hojaTrabajoId: number;
}

interface Ciudad {
  id: number;
  ciudad: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('Hoy');
  const [showMenu, setShowMenu] = useState(false);

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<Boleto[]>([]);
  const [cities, setCities] = useState<Ciudad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isFromModalVisible, setFromModalVisible] = useState(false);
  const [isToModalVisible, setToModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError('');

        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          router.replace('/(auth)/login');
          return;
        }

        const profileResponse = await fetch(`${API_URL}/clientes/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (profileResponse.status === 401) {
          await AsyncStorage.removeItem('access_token');
          router.replace('/(auth)/login');
          return;
        }

        if (!profileResponse.ok) {
          throw new Error('No se pudo cargar el perfil del usuario.');
        }

        const profileData: UserInfo = await profileResponse.json();
        setUserInfo(profileData);

        if (profileData.usuario && profileData.usuario.cedula) {
          const boletosResponse = await fetch(`${API_URL}/boletos/cedula/${profileData.usuario.cedula}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (boletosResponse.ok) {
            const boletosData: Boleto[] = await boletosResponse.json();
            setUpcomingTrips(boletosData);
          }
        }

        const citiesResponse = await fetch(`${API_URL}/ciudades`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (citiesResponse.ok) {
          const citiesData: Ciudad[] = await citiesResponse.json();
          setCities(citiesData);
        }

      } catch (e: any) {
        setError(e.message || 'Ocurrió un error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleSearch = () => {
    if (!fromLocation || !toLocation) {
      alert('Por favor, ingresa el punto de salida y el destino.');
      return;
    }
    router.push({
      pathname: '/buses',
      params: { from: fromLocation, to: toLocation, date: selectedDate },
    });
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleLogout = async () => {
    setShowMenu(false);
    await AsyncStorage.removeItem('access_token');
    router.replace('/(auth)/login');
  };

  const handleViewReservations = () => {
    setShowMenu(false);
    router.push('/tickets');
  };

  const openFromModal = () => {
    setSearchQuery(''); // Reset search on open
    setFromModalVisible(true);
  };

  const openToModal = () => {
    setSearchQuery(''); // Reset search on open
    setToModalVisible(true);
  };

  const renderCitySelectorModal = (
    visible: boolean,
    onClose: () => void,
    onSelect: (value: string) => void,
    data: Ciudad[]
  ) => (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.cityModalContainer}>
          <TextInput
            style={styles.searchCityInput}
            placeholder="Buscar ciudad..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.cityItem} onPress={() => onSelect(item.ciudad)}>
                <Text style={styles.cityItemText}>{item.ciudad}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.citySeparator} />}
          />
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#E6F0FF', '#FFFFFF']}
          locations={[0, 0.2]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
                <Image
                  source={require('../../assets/images/welcome.jpg')}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <Text style={styles.welcomeText}>
                {userInfo ? `Hola, ${userInfo.usuario.nombre}` : '¿A dónde quieres ir?'}
              </Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

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
              <View style={[styles.menuContainer, { top: 70, left: 16 }]}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleViewReservations}
                >
                  <Ionicons name="ticket-outline" size={20} color="#0F172A" />
                  <Text style={styles.menuItemText}>Mis Reservas</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  <Text style={[styles.menuItemText, styles.logoutText]}>
                    Cerrar Sesión
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>

          {renderCitySelectorModal(
            isFromModalVisible,
            () => setFromModalVisible(false),
            (city) => {
              setFromLocation(city);
              if (city === toLocation) setToLocation(''); // Reset destination if same
              setFromModalVisible(false);
              setSearchQuery('');
            },
            cities.filter(c => c.ciudad !== toLocation && c.ciudad.toLowerCase().includes(searchQuery.toLowerCase()))
          )}
          {renderCitySelectorModal(
            isToModalVisible,
            () => setToModalVisible(false),
            (city) => {
              setToLocation(city);
              setToModalVisible(false);
              setSearchQuery('');
            },
            cities.filter(c => c.ciudad !== fromLocation && c.ciudad.toLowerCase().includes(searchQuery.toLowerCase()))
          )}

          <View style={styles.searchContainer}>
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={[styles.input, loading && styles.inputDisabled]}
                onPress={openFromModal}
                disabled={loading}
              >
                <Text style={fromLocation ? styles.inputText : styles.placeholderText}>
                  {fromLocation || 'Punto de salida'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.swapButton}>
                <Ionicons name="swap-vertical" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={[styles.input, loading && styles.inputDisabled]}
                onPress={openToModal}
                disabled={loading}
              >
                <Text style={toLocation ? styles.inputText : styles.placeholderText}>
                  {toLocation || '¿A dónde vas?'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={[styles.dateButton, selectedDate === 'Hoy' && styles.dateButtonActive]}
                onPress={() => handleDateSelect('Hoy')}
              >
                <Text style={[styles.dateButtonText, selectedDate === 'Hoy' && styles.dateButtonTextActive]}>Hoy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, selectedDate === 'Mañana' && styles.dateButtonActive]}
                onPress={() => handleDateSelect('Mañana')}
              >
                <Text style={[styles.dateButtonText, selectedDate === 'Mañana' && styles.dateButtonTextActive]}>Mañana</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, selectedDate === 'Otro' && styles.dateButtonActive]}
                onPress={() => handleDateSelect('Otro')}
              >
                <Ionicons name="calendar-outline" size={20} color={selectedDate === 'Otro' ? '#FFFFFF' : '#7B61FF'} />
                <Text style={[styles.dateButtonText, selectedDate === 'Otro' && styles.dateButtonTextActive]}>Otro</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Buscar autobuses</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tripsContainer}>
            <Text style={styles.tripsTitle}>Próximo viaje</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#7B61FF" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : upcomingTrips.length > 0 ? (
              upcomingTrips.slice(0, 3).map((trip) => (
                <Pressable
                  key={trip.id}
                  style={styles.tripCard}
                >
                  <View style={styles.tripInfo}>
                    <Text style={styles.terminalName}>Pasajero: {trip.nombre}</Text>
                    <View style={styles.routeInfo}>
                      <Text style={styles.routeLabel}>Cédula: </Text>
                      <Text style={styles.routeValue}>{trip.cedula}</Text>
                    </View>
                     <View style={styles.routeInfo}>
                      <Text style={styles.routeLabel}>Referencia de viaje: </Text>
                      <Text style={styles.routeValue}>#{trip.hojaTrabajoId}</Text>
                    </View>
                  </View>
                  <View style={styles.timeContainer}>
                     <Text style={styles.departureLabel}>ID Boleto</Text>
                    <Text style={styles.departureTime}>{trip.id}</Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text style={styles.noTripsText}>No tienes viajes próximos.</Text>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    </>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  notificationButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#0F172A',
  },
  logoutText: {
    color: '#EF4444',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  searchContainer: {
    backgroundColor: '#7B61FF',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    justifyContent: 'center',
    height: 50,
  },
  inputDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.7,
  },
  inputText: {
    color: '#0F172A',
    fontSize: 16,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  swapButton: {
    position: 'absolute',
    right: 12,
    top: 10,
    backgroundColor: '#9580FF',
    borderRadius: 12,
    padding: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },
  dateButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  dateButtonTextActive: {
    color: '#7B61FF',
  },
  searchButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#7B61FF',
    fontSize: 16,
    fontWeight: '700',
  },
  tripsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    flex: 1,
  },
  tripsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tripInfo: {
    flex: 1,
  },
  terminalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  routeValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  departureLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  departureTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  errorText: {
    textAlign: 'center',
    color: '#EF4444',
    marginTop: 20,
  },
  noTripsText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 20,
  },
  cityModalContainer: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  searchCityInput: {
    height: 45,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  cityItem: {
    paddingVertical: 15,
  },
  cityItemText: {
    fontSize: 18,
    color: '#0F172A',
  },
  citySeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  }
});
