// Este archivo será movido fuera de (tabs) para que no aparezca como tab.

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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
    TouchableOpacity,
    View,
} from 'react-native';
import { API_URL } from '../constants/api';

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

export default function BusSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buses, setBuses] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [selectedBus, setSelectedBus] = useState<any | null>(null);
  const [showBusModal, setShowBusModal] = useState(false);
  const [checkingToken, setCheckingToken] = React.useState(true);

  // Recibe los parámetros de búsqueda
  const from = params.from as string;
  const to = params.to as string;
  const date = params.date as string;

  // Mapeo de nombres de ciudades a códigos
  const cityCodeMap: { [key: string]: string } = {
    'Ambato': 'AMBA',
    'Puerto El Coca': 'ELCO',
    'El Coca': 'ELCO',
    'Quito': 'QUIT',
    'Guayaquil': 'GUAY',
    'Cuenca': 'CUEN',
    'Manta': 'MANT',
    'Esmeraldas': 'ESME',
    'Machala': 'MACH',
    'Loja': 'LOJA',
    'Ibarra': 'IBAR',
    'Riobamba': 'RIOB',
    'Santo Domingo': 'SADO',
    'Portoviejo': 'PORT',
    'Tulcán': 'TULC',
    'Latacunga': 'LATA',
    'Babahoyo': 'BABA',
    'Milagro': 'MILA',
    'Quevedo': 'QUEV',
    'Daule': 'DAUL',
    'Samborondón': 'SAMB',
    'Durán': 'DURA',
    'Salinas': 'SALI',
    'Playas': 'PLAY',
    'Vinces': 'VINC',
    'Nobol': 'NOBO',
    'Yaguachi': 'YAGU',
    'El Triunfo': 'TRIU',
    'Naranjal': 'NARA',
    'Balao': 'BALA',
    'El Guabo': 'GUAB',
    'Pasaje': 'PASA',
    'Santa Rosa': 'SROS',
    'Huaquillas': 'HUAQ',
    'Zaruma': 'ZARU',
    'Piñas': 'PIÑA',
    'Atahualpa': 'ATAH',
    'Chilla': 'CHIL',
    'Arenillas': 'AREN',
    'Las Lajas': 'LLAJ',
    'Catamayo': 'CATA',
    'Cariamanga': 'CARI',
    'Gonzanamá': 'GONZ',
    'Calvas': 'CALV',
    'Paltas': 'PALT',
    'Puyango': 'PUYA',
    'Saraguro': 'SARA',
    'Yacuambi': 'YACU',
    'Zamora': 'ZAMO',
    'Yantzaza': 'YANT',
    'Gualaquiza': 'GUAL',
    'Nangaritza': 'NANG',
    'Centinela del Cóndor': 'CENT',
    'El Pangui': 'PANG',
    'Palanda': 'PALA',
    'Chinchipe': 'CHIN',
    'Pucará': 'PUCA',
    'Oña': 'OÑA',
    'Paute': 'PAUT',
    'Gualaceo': 'GUAL',
    'Chordeleg': 'CHOR',
    'El Pan': 'ELPA',
    'Sevilla de Oro': 'SEVI',
    'Guachapala': 'GUAC',
    'Camilo Ponce Enríquez': 'CAMI',
    'Girón': 'GIRÓ',
    'San Fernando': 'SAFE',
    'Santa Isabel': 'SAIS',
    'Pindal': 'PIND',
    'Quilanga': 'QUIL',
    'Olmedo': 'OLME',
    'Celica': 'CELI',
    'Pózul': 'PÓZU',
    'Macará': 'MACA',
    'Sozoranga': 'SOZO',
    'Zapotillo': 'ZAPO',
    'Alamor': 'ALAM',
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

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no especificada';
    try {
      let date;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // Comparar fechas
      if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Mañana';
      } else {
        // Formato: "Lunes, 15 de Enero"
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        };
        return date.toLocaleDateString('es-ES', options);
      }
    } catch (e) {
      return dateString;
    }
  };

  // Helpers para formato de hora y fecha
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
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;
      const profileResponse = await fetch(`${API_URL}/clientes/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileResponse.ok) {
        const profileData: UserInfo = await profileResponse.json();
        setUserInfo(profileData);
      }
    };
    fetchUser();
  }, []);

  // Función para obtener la tarifa
  const fetchTarifa = async (rutaId: number, tipoAsiento: string = 'NORMAL') => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/tarifas-paradas/ruta/${rutaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Tarifas devueltas para ruta', rutaId, 'y tipo', tipoAsiento, ':', data);
      // Primero intenta encontrar tarifa con valor > 0
      let tarifa = data.find((t: any) => t.tipoAsiento === tipoAsiento && Number(t.valor) > 0);
      // Si no hay, toma la tarifa con valor 0 si existe
      if (!tarifa) {
        tarifa = data.find((t: any) => t.tipoAsiento === tipoAsiento);
      }
      return tarifa ? tarifa.valor : 'N/A';
    } catch (e) {
      return 'N/A';
    }
  };

  useEffect(() => {
    const fetchBuses = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          router.replace('/(auth)/login');
          return;
        }
        // Mapear nombres a códigos
        const fromCode = cityCodeMap[from] || from;
        const toCode = cityCodeMap[to] || to;
        // Obtener todos los viajes programados
        const url = `${API_URL}/hoja-trabajo/viajes?estado=programado`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // Filtrar por ciudad_origen y ciudad_destino
        const filtered = (data.data || []).filter(
          (item) =>
            item.ciudad_origen?.toLowerCase() === from?.toLowerCase() &&
            item.ciudad_destino?.toLowerCase() === to?.toLowerCase()
        );
        // Obtener tarifa para cada bus
        const busesWithTarifa = await Promise.all(filtered.map(async (bus: any) => {
          if (bus.rutaId) {
            if (bus.piso_doble) {
              // Doble piso: busca ambas tarifas
              const valorNormal = await fetchTarifa(bus.rutaId, 'NORMAL');
              const valorVIP = await fetchTarifa(bus.rutaId, 'VIP');
              return { ...bus, valorNormal, valorVIP };
            } else {
              // Un solo piso: busca solo la tarifa NORMAL
              const valorNormal = await fetchTarifa(bus.rutaId, 'NORMAL');
              return { ...bus, valorNormal };
            }
          } else {
            return { ...bus, valorNormal: 'N/A', valorVIP: 'N/A' };
          }
        }));
        setBuses(busesWithTarifa);
      } catch (e) {
        setError('Error al buscar buses');
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, [router, from, to, date]);

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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#E6F0FF', '#FFFFFF']}
          locations={[0, 0.2]}
          style={{ flex: 1 }}
        >
          {/* Header superior con retroceso */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 0 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back-outline" size={28} color="#0F172A" />
            </TouchableOpacity>
          </View>
          {/* Header superior */}
          <View style={[styles.header, { marginTop: 0, paddingTop: 0 }]}>
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
                <Image
                  source={require('../assets/images/welcome.jpg')}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <Text style={styles.welcomeText}>
                {userInfo ? `Hola, ${userInfo.usuario.nombre}` : 'Hola, Cliente!'}
              </Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>
          {/* Menú modal */}
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
          {/* Header visual de ciudades y fecha */}
          <View style={styles.headerBox}>
            <View style={styles.citiesRow}>
              <View style={styles.cityItem}>
                <Ionicons name="home-outline" size={22} color="#fff" style={styles.cityIcon} />
                <Text style={styles.cityText}>{from}</Text>
              </View>
              <View style={styles.busCircle}>
                <Ionicons name="bus" size={32} color="#7B61FF" />
              </View>
              <View style={styles.cityItem}>
                <Ionicons name="location-outline" size={22} color="#fff" style={styles.cityIcon} />
                <Text style={styles.cityText}>{to}</Text>
              </View>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </View>
          </View>
          {/* Lista de buses */}
          {loading ? (
            <ActivityIndicator size="large" color="#7B61FF" style={{ marginTop: 40 }} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : buses.length === 0 ? (
            <Text style={styles.noBusesText}>No hay buses disponibles para esta ruta y fecha.</Text>
          ) : (
            <FlatList
              data={buses}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }: { item: any; index: number }) => {
                // Calcular duración si es posible
                let duracion = 'N/A';
                if (item.horaSalidaProg && item.horaLlegadaProg) {
                  const [h1, m1] = item.horaSalidaProg.split(':').map(Number);
                  const [h2, m2] = item.horaLlegadaProg.split(':').map(Number);
                  let min = (h2 * 60 + m2) - (h1 * 60 + m1);
                  if (min < 0) min += 24 * 60;
                  duracion = `${Math.floor(min / 60)}h ${min % 60}m`;
                }
                // Precio/tarifa
                let precio = 'N/A';
                if (item.piso_doble) {
                  precio = `Normal: ${item.valorNormal} $\nVIP: ${item.valorVIP} $`;
                } else {
                  precio = `${item.valorNormal} $`;
                }
                // Nombre del bus
                const nombreBus = item.placa || item.numero_bus || 'N/A';
                // Horario
                const horaInicio = item.horaSalidaProg ? item.horaSalidaProg.slice(0,5) : 'N/A';
                const horaFin = item.horaLlegadaProg ? item.horaLlegadaProg.slice(0,5) : 'N/A';
                // Servicios (mock icons)
                const servicios = [
                  { icon: 'snow-outline', color: '#64748B' }, // aire acondicionado
                  { icon: 'wifi-outline', color: '#64748B' }, // wifi
                  { icon: 'pricetag-outline', color: '#64748B' }, // ticket
                  { icon: 'log-in-outline', color: '#64748B' }, // entrada (icono válido de Ionicons)
                ];
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedBus(item);
                      setShowBusModal(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={{
                      backgroundColor: '#fff',
                      borderRadius: 16,
                      marginBottom: 16,
                      padding: 18,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 2,
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}>
                      {/* Centro: datos del bus */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 19, fontWeight: '600', color: '#222', marginBottom: 2 }}>{item.nombre_cooperativa || 'N/A'}</Text>
                        <Text style={{ fontSize: 15, color: '#64748B', marginBottom: 4 }}>{nombreBus}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                          <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#222' }}>{horaInicio}</Text>
                          <Text style={{ color: '#64748B', fontSize: 15, marginHorizontal: 6 }}>—</Text>
                          <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#222' }}>{horaFin}</Text>
                        </View>
                        <Text style={{ color: '#222', fontSize: 15, marginBottom: 2 }}>
                          {duracion !== 'N/A' ? duracion.replace('h', 'h ') : 'N/A'}
                        </Text>
                        <View style={{ flexDirection: 'row', marginTop: 4 }}>
                          {servicios.map((s, i) => (
                            <Ionicons key={i} name={s.icon} size={18} color={s.color} style={{ marginRight: 10 }} />
                          ))}
                        </View>
                      </View>
                      {/* Derecha: precio y duración */}
                      <View style={{ alignItems: 'flex-end', justifyContent: 'flex-start', minWidth: 90 }}>
                        {item.piso_doble ? (
                          <View>
                            <Text style={{ color: '#F59E42', fontWeight: 'bold', fontSize: 18 }}>Normal: {item.valorNormal} $</Text>
                            <Text style={{ color: '#F59E42', fontWeight: 'bold', fontSize: 18 }}>VIP: {item.valorVIP} $</Text>
                          </View>
                        ) : (
                          <Text style={{ color: '#F59E42', fontWeight: 'bold', fontSize: 24, marginBottom: 2 }}>{item.valorNormal} $</Text>
                        )}
                        <Text style={{ color: '#222', fontWeight: '500', fontSize: 16 }}>{duracion !== 'N/A' ? duracion.replace('h', 'h ') : 'N/A'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              style={{ borderRadius: 24, paddingBottom: 8 }}
            />
          )}
          {/* Modal de detalles del bus */}
          <Modal
            visible={showBusModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowBusModal(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowBusModal(false)}
            >
              <View style={styles.busModalBox}>
                {selectedBus?.imagen ? (
                  <Image source={{ uri: selectedBus.imagen }} style={styles.busModalImage} />
                ) : null}
                {selectedBus?.cooperativa?.logo ? (
                  <Image source={{ uri: selectedBus.cooperativa.logo }} style={styles.busModalLogo} />
                ) : selectedBus?.logo ? (
                  <Image source={{ uri: selectedBus.logo }} style={styles.busModalLogo} />
                ) : null}
                <Text style={styles.busModalTitle}>{selectedBus?.nombre_cooperativa || 'Bus terminal'}</Text>
                <Text style={styles.busModalCode}>{selectedBus?.codigo || `Viaje #${selectedBus?.id}`}</Text>
                <Text style={styles.busModalRoute}><Text style={{ fontWeight: '600' }}>Origen:</Text> {selectedBus?.ciudad_origen}{"\n"}<Text style={{ fontWeight: '600' }}>Destino:</Text> {selectedBus?.ciudad_destino}</Text>
                <Text style={styles.busModalType}>
                  {selectedBus?.piso_doble ? (
                    <View style={styles.busModalDoubleFloor}>
                      <Ionicons name="bus" size={18} color="#7B61FF" style={{ marginRight: 6 }} />
                      <Text style={styles.busModalDoubleFloorText}>Doble piso</Text>
                    </View>
                  ) : (
                    'Piso normal'
                  )}
                </Text>
                <TouchableOpacity
                  style={styles.busModalButton}
                  onPress={() => {
                    setShowBusModal(false);
                    // Aquí navega a la pantalla de compra o selección de asiento
                    // router.push({ pathname: '/compra', params: { busId: selectedBus.id, ... } });
                  }}
                >
                  <Text style={styles.busModalButtonText}>Escoger asientos</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  headerBox: {
    backgroundColor: '#7B61FF',
    borderRadius: 24,
    margin: 16,
    marginBottom: 18,
    padding: 20,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  citiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityIcon: {
    marginRight: 6,
  },
  cityText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  swapCircle: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    width: '100%',
  },
  dateText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  noBusesText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 8,
  },
  busCard: {
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
  },
  busCardNumberBox: {
    backgroundColor: '#7B61FF',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busCardNumber: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  busCardCenter: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  busCardTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 2,
  },
  busCardSub: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 2,
  },
  busCardRight: {
    backgroundColor: '#0F172A',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    minWidth: 110,
  },
  busCardRightLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  busCardRightTime: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  busCardRightDate: {
    color: '#fff',
    fontSize: 13,
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
  busModalBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
    alignItems: 'center',
  },
  busModalImage: {
    width: 180,
    height: 100,
    borderRadius: 16,
    marginBottom: 12,
  },
  busModalLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 8,
  },
  busModalTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#7B61FF',
    marginBottom: 4,
  },
  busModalCode: {
    color: '#0F172A',
    fontSize: 16,
    marginBottom: 8,
  },
  busModalRoute: {
    color: '#64748B',
    fontSize: 15,
    marginBottom: 8,
  },
  busModalType: {
    color: '#0F172A',
    fontSize: 15,
    marginBottom: 8,
  },
  busModalDoubleFloor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  busModalDoubleFloorText: {
    color: '#7B61FF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  busModalButton: {
    backgroundColor: '#7B61FF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 12,
  },
  busModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  busCircle: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  dateBar: {
    backgroundColor: '#A992FF',
    borderRadius: 12,
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dateBarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
}); 