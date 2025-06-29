import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { API_URL } from '../../constants/api';

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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState(new Date());

  const [allBuses, setAllBuses] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);

  const [selectedBus, setSelectedBus] = useState<any | null>(null);
  const [showBusModal, setShowBusModal] = useState(false);

  const [checkingToken, setCheckingToken] = React.useState(true);

  const [directFilter, setDirectFilter] = useState<null | boolean>(null); // null: todos, true: solo directos, false: solo indirectos

  const showUserFilter = fromLocation && toLocation;

  React.useEffect(() => {
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

  useEffect(() => {
    const fetchAllBuses = async () => {
      setLoadingAll(true);
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(`${API_URL}/hoja-trabajo/viajes?estado=programado`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const busesWithTarifa = await Promise.all((data.data || []).map(async (bus: any) => {
          if (bus.rutaId) {
            if (bus.piso_doble) {
              const valorNormal = await fetchTarifa(bus.rutaId, 'NORMAL');
              const valorVIP = await fetchTarifa(bus.rutaId, 'VIP');
              return { ...bus, valorNormal, valorVIP };
            } else {
              const valorNormal = await fetchTarifa(bus.rutaId, 'NORMAL');
              return { ...bus, valorNormal };
            }
          } else {
            return { ...bus, valorNormal: 'N/A', valorVIP: 'N/A' };
          }
        }));
        setAllBuses(busesWithTarifa);
      } catch (e) {
        setAllBuses([]);
      }
      setLoadingAll(false);
    };
    fetchAllBuses();
  }, []);

  useEffect(() => {
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

  const handleSearch = () => {
    if (!fromLocation.trim() || !toLocation.trim()) {
      alert('Por favor, ingresa el punto de salida y el destino.');
      return;
    }
    if (fromLocation === toLocation) {
      alert('El origen y el destino no pueden ser iguales.');
      return;
    }
    
    // Siempre pasa el string 'Hoy', 'Mañana' o la fecha seleccionada
    router.push({
      pathname: './buses',
      params: { from: fromLocation, to: toLocation, date: selectedDate },
    });
  };

  const handleDateButton = (date: string) => {
    setShowDatePicker(false);
    if (date === 'Hoy' || date === 'Mañana') {
      setSelectedDate(date);
      setCustomDate(new Date()); // Opcional: resetea la fecha personalizada
    } else {
      setShowDatePicker(true);
    }
  };

  const handleDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setCustomDate(selected);
      // Formato YYYY-MM-DD
      const formatted = selected.toISOString().split('T')[0];
      setSelectedDate(formatted);
    }
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

  // Función para formatear la fecha para mostrar
  const formatDateForDisplay = (dateString: string) => {
    if (dateString === 'Hoy') return 'Hoy';
    if (dateString === 'Mañana') return 'Mañana';
    
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      };
      return date.toLocaleDateString('es-ES', options);
    } catch (e) {
      return dateString;
    }
  };

  const handleSwapLocations = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
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

  if (checkingToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={{ marginTop: 16, color: '#7B61FF', fontWeight: 'bold' }}>Validando sesión...</Text>
      </View>
    );
  }

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
            <View style={{ position: 'relative' }}>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={[styles.input, loading && styles.inputDisabled, { position: 'relative' }]}
                  onPress={openFromModal}
                  disabled={loading}
                >
                  <Text style={fromLocation ? styles.inputText : styles.placeholderText}>
                    {fromLocation || 'Punto de salida'}
                  </Text>
                  {fromLocation && (
                    <TouchableOpacity
                      onPress={() => setFromLocation('')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: [{ translateY: -10 }],
                        padding: 4,
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#64748B" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleSwapLocations}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: [{ translateX: -20 }, { translateY: -20 }],
                  backgroundColor: '#E6E6FF',
                  borderRadius: 20,
                  padding: 6,
                  borderWidth: 2,
                  borderColor: '#7B61FF',
                  zIndex: 10,
                  elevation: 6,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.18,
                  shadowRadius: 6,
                }}
              >
                <Ionicons name="swap-vertical" size={28} color="#7B61FF" />
              </TouchableOpacity>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={[styles.input, loading && styles.inputDisabled, { position: 'relative' }]}
                  onPress={openToModal}
                  disabled={loading}
                >
                  <Text style={toLocation ? styles.inputText : styles.placeholderText}>
                    {toLocation || '¿A dónde vas?'}
                  </Text>
                  {toLocation && (
                    <TouchableOpacity
                      onPress={() => setToLocation('')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: [{ translateY: -10 }],
                        padding: 4,
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#64748B" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={[styles.dateButton, selectedDate === 'Hoy' && styles.dateButtonActive]}
                onPress={() => handleDateButton('Hoy')}
              >
                <Text style={[styles.dateButtonText, selectedDate === 'Hoy' && styles.dateButtonTextActive]}>Hoy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, selectedDate !== 'Hoy' && selectedDate !== 'Mañana' && styles.dateButtonActive]}
                onPress={() => handleDateButton('Otro')}
              >
                <Ionicons name="calendar-outline" size={20} color={selectedDate !== 'Hoy' && selectedDate !== 'Mañana' ? '#7B61FF' : '#0F172A'} style={{ marginRight: 4 }} />
                <Text style={[styles.dateButtonText, selectedDate !== 'Hoy' && selectedDate !== 'Mañana' && styles.dateButtonTextActive]}>
                  Otra fecha
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={customDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              {/* Mostrar la fecha personalizada solo si está seleccionada */}
              {selectedDate !== 'Hoy' && selectedDate !== 'Mañana' && (
                <Text style={{ color: '#7B61FF', marginLeft: 8, alignSelf: 'center', fontWeight: 'bold' }}>
                  {formatDateForDisplay(selectedDate)}
                </Text>
              )}
            </View>
            <View style={{ marginTop: 2, marginBottom: 8 }}>
              <Text style={{ color: '#0F172A', fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>
                Viaje Directo
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setDirectFilter(true)}
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 18 }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#7B61FF',
                    backgroundColor: directFilter === true ? '#7B61FF' : '#fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 6,
                  }}>
                    {directFilter === true && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={{ color: '#0F172A', fontSize: 14 }}>Si</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDirectFilter(false)}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#7B61FF',
                    backgroundColor: directFilter === false ? '#7B61FF' : '#fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 6,
                  }}>
                    {directFilter === false && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={{ color: '#0F172A', fontSize: 14 }}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Buscar autobuses</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: 16,
              alignSelf: 'center'
            }}>
              Próximos buses programados
            </Text>
            {loadingAll ? (
              <ActivityIndicator size="large" color="#7B61FF" />
            ) : allBuses.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#64748B' }}>No hay buses programados.</Text>
            ) : (
              <FlatList
                data={directFilter === null ? allBuses : allBuses.filter(bus => bus.directo === directFilter)}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item: bus, index }: { item: any; index: number }) => (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedBus(bus);
                      setShowBusModal(true);
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'stretch',
                      backgroundColor: '#fff',
                      borderRadius: 20,
                      marginBottom: 18,
                      marginHorizontal: 8,
                      shadowColor: '#7B61FF',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 10,
                      elevation: 6,
                      minHeight: 90,
                      maxHeight: 110,
                    }}>
                      {/* Número grande a la izquierda */}
                      <View style={{
                        backgroundColor: '#7B61FF',
                        borderTopLeftRadius: 20,
                        borderBottomLeftRadius: 20,
                        width: 60,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>{index + 1}</Text>
                      </View>
                      {/* Centro: datos del bus */}
                      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 16, color: '#0F172A', marginBottom: 2 }}>{bus.nombre_cooperativa || 'Bus terminal'}</Text>
                        <Text style={{ color: '#64748B', fontSize: 13, marginBottom: 2 }}>Origen : <Text style={{ color: '#0F172A' }}>{bus.ciudad_origen}</Text></Text>
                        <Text style={{ color: '#64748B', fontSize: 13 }}>Destino : <Text style={{ color: '#0F172A' }}>{bus.ciudad_destino}</Text></Text>
                        <Text style={{ color: '#64748B', fontSize: 13, marginBottom: 2 }}>Fecha : <Text style={{ color: '#0F172A' }}>{bus.fechaSalida ? formatDateLong(bus.fechaSalida) : ''}</Text></Text>
                      </View>
                      {/* Derecha: bloque negro con hora y fecha y TARIFA */}
                      <View style={{
                        backgroundColor: '#0F172A',
                        borderTopRightRadius: 20,
                        borderBottomRightRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 18,
                        minWidth: 110,
                      }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>Hora de salida</Text>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                          {formatTime(bus.horaSalidaProg)}
                        </Text>
                        <Text style={{ color: '#fff', fontSize: 13 }}>
                          {formatDateBlock(bus.fechaSalida)}
                        </Text>
                        {/* TARIFA */}
                        {bus.piso_doble ? (
                          <View style={{ marginTop: 4 }}>
                            <Text style={{ color: '#F59E42', fontWeight: 'bold', fontSize: 13 }}>Normal: {bus.valorNormal} $</Text>
                            <Text style={{ color: '#F59E42', fontWeight: 'bold', fontSize: 13 }}>VIP: {bus.valorVIP} $</Text>
                          </View>
                        ) : (
                          <Text style={{ color: '#F59E42', fontWeight: 'bold', fontSize: 16, marginTop: 4 }}>{bus.valorNormal} $</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 330, borderRadius: 24, paddingBottom: 8 }}
                contentContainerStyle={{ paddingBottom: 8 }}
              />
            )}
          </View>

          <View style={styles.tripsContainer}>
            
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
              <Text style={styles.noTripsText}>ChasquiBus tu mejor elección.</Text>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
      {/* Modal de detalles del bus */}
      <Modal
        visible={showBusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBusModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={() => setShowBusModal(false)}
        >
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 24,
            padding: 24,
            width: '85%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.18,
            shadowRadius: 16,
            elevation: 12,
            alignItems: 'center'
          }}>
            {selectedBus?.imagen && (
              <Image
                source={{ uri: selectedBus.imagen }}
                style={{ width: 180, height: 100, borderRadius: 16, marginBottom: 12 }}
              />
            )}
            {selectedBus?.cooperativa?.logo ? (
              <Image source={{ uri: selectedBus.cooperativa.logo }} style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 8 }} />
            ) : selectedBus?.logo ? (
              <Image source={{ uri: selectedBus.logo }} style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 8 }} />
            ) : null}
            <Text style={{ fontWeight: '700', fontSize: 18, color: '#7B61FF', marginBottom: 4 }}>
              {selectedBus?.nombre_cooperativa || 'Bus terminal'}
            </Text>
            <Text style={{ color: '#0F172A', fontSize: 16, marginBottom: 8 }}>
              {selectedBus?.codigo || `Viaje #${selectedBus?.id}`}
            </Text>
            <Text style={{ color: '#64748B', fontSize: 15, marginBottom: 8 }}>
              <Text style={{ fontWeight: '600' }}>Origen:</Text> {selectedBus?.ciudad_origen}{"\n"}
              <Text style={{ fontWeight: '600' }}>Destino:</Text> {selectedBus?.ciudad_destino}
            </Text>
            <Text style={{ color: '#0F172A', fontSize: 15, marginBottom: 8 }}>
              {selectedBus?.piso_doble ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6E6FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' }}>
                  <Ionicons name="bus" size={18} color="#7B61FF" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 15 }}>Doble piso</Text>
                </View>
              ) : (
                'Piso normal'
              )}
            </Text>
            <Text
              style={{
                color: '#64748B',
                fontSize: 15,
                marginBottom: 8,
                textAlign: 'center',
                width: '100%',
              }}
            >
              <Text style={{ fontWeight: '600' }}>Fecha de salida: </Text>
              {selectedBus?.fechaSalida ? formatDateLong(selectedBus.fechaSalida) : ''}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#7B61FF',
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 32,
                marginTop: 12
              }}
              onPress={() => {
                setShowBusModal(false);
                const paramsToSend = {
                  company: selectedBus?.nombre_cooperativa || '',
                  type: selectedBus?.piso_doble ? 'Doble piso' : 'Piso normal',
                  origin: selectedBus?.ciudad_origen || '',
                  destination: selectedBus?.ciudad_destino || '',
                  departure: selectedBus?.horaSalidaProg || '',
                  arrival: selectedBus?.horaLlegadaProg || '',
                  duration: selectedBus?.duracion || '',
                  price: selectedBus?.valorNormal || '',
                  seatsLeft: selectedBus?.asientos_disponibles || 0,
                  date: selectedBus?.fechaSalida ? formatDateBlock(selectedBus.fechaSalida) : '',
                };
               // console.log('Datos enviados a seat-selection:', paramsToSend);
                router.push({ pathname: '/seat-selection', params: paramsToSend });
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Escoger asientos</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
    paddingTop: 16,
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

// Helpers para formatear hora y fecha
function formatTime(hora: string): string {
  if (!hora) return '';
  const [h, m] = hora.split(':');
  let hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${hour} ${ampm}`;
}
function formatDateBlock(fecha: string): string {
  if (!fecha) return '';
  const d = new Date(fecha);
  const day = d.toLocaleDateString('en-US', { weekday: 'short' });
  return `${day} ${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// --- FUNCION PARA OBTENER TARIFA ---
const fetchTarifa = async (rutaId: any, tipoAsiento = 'NORMAL') => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const res = await fetch(`${API_URL}/tarifas-paradas/ruta/${rutaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    let tarifaNormal = data.find((t: any) => t.tipoAsiento === tipoAsiento && Number(t.valor) > 0);
    if (!tarifaNormal) {
      tarifaNormal = data.find((t: any) => t.tipoAsiento === tipoAsiento);
    }
    let tarifaVIP = data.find((t: any) => t.tipoAsiento === 'VIP' && Number(t.valor) > 0);
    return tarifaNormal ? tarifaNormal.valor : 'N/A';
  } catch (e) {
    return 'N/A';
  }
};

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
