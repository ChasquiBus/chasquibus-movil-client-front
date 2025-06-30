import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { API_URL } from '../constants/api';

export default function BoardingPointsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const seats = typeof params.seats === 'string' ? params.seats.split(',') : [];
  const total: string = typeof params.total === 'string' ? params.total : '0.00';
  const [showMenu, setShowMenu] = useState(false);
  const [checkingToken, setCheckingToken] = React.useState(true);
  const [passengers, setPassengers] = useState(
    seats.map(() => ({ photo: null, nombre: '', cedula: '' }))
  );
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  // Métodos de pago disponibles (puedes traerlos de la API si lo prefieres)
  const metodosPago = [
    { id: 3, nombre: 'Depósito Banco Pichincha' },
    { id: 4, nombre: 'PayPal' }
  ];
  const [metodoPagoId, setMetodoPagoId] = useState<number | null>(null);

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

  const handleContinue = async () => {
    if (!metodoPagoId) {
      setFeedback('Selecciona un método de pago');
      return;
    }
    setLoading(true);
    setFeedback('Registrando venta...');
    try {
      // IDs y datos de ejemplo, reemplaza por los reales de params si existen
      const cooperativaId = params.cooperativaId || 1;
      const hojaTrabajoId = params.hojaTrabajoId || 3;
      const busId = Number(params.busId || params.idBus || 5);
      const tipoVenta = 'online';
      const estadoPago = 'pagado';
      const tarifaId = params.tarifaId || 3;
      // Si tienes descuentos, puedes obtenerlos de params o calcularlos
      const totalSinDescPorPers = params.totalSinDescPorPers || total;
      const totalDescPorPers = params.totalDescPorPers || '0.00';
      const totalPorPer = params.totalPorPer || total;

      // --- INICIO CAMBIO: mapeo correcto de posiciones ---
      // Asegura que asientosData sea un array de objetos con posicionesJson
      let asientosDataArr = [];
      if (Array.isArray(params.asientosData)) {
        asientosDataArr = params.asientosData;
      } else if (typeof params.asientosData === 'string') {
        try {
          asientosDataArr = JSON.parse(params.asientosData);
        } catch (e) {
          asientosDataArr = [];
        }
      }
      let posicionesArray = [];
      if (asientosDataArr.length > 0) {
        const posicionesJson = asientosDataArr[0]?.posicionesJson;
        if (typeof posicionesJson === 'string') {
          posicionesArray = JSON.parse(posicionesJson);
        }
      }
      const posiciones = seats.map((numeroAsiento: number | string) => {
        const asiento = posicionesArray.find((a: any) => a.numeroAsiento === Number(numeroAsiento));
        return {
          fila: asiento?.fila || 1,
          columna: asiento?.columna || 1,
          piso: asiento?.piso || 1,
          tipoAsiento: asiento?.tipoAsiento || 'NORMAL',
          numeroAsiento: asiento?.numeroAsiento || Number(numeroAsiento),
          ocupado: false
        };
      });
      // --- FIN CAMBIO ---

      const boletos = passengers.map((p, idx) => ({
        asientoNumero: posiciones[idx]?.numeroAsiento || Number(seats[idx]),
        tarifaId: tarifaId,
        cedula: p.cedula,
        nombre: p.nombre,
        totalSinDescPorPers: totalSinDescPorPers,
        totalDescPorPers: totalDescPorPers,
        totalPorPer: totalPorPer,
        // descuentoId: ... // Si aplica
      }));
      const ventaPayload = {
        cooperativaId,
        metodoPagoId,
        hojaTrabajoId,
        estadoPago,
        busId,
        tipoVenta,
        posiciones,
        boletos,
      };
      const token = await AsyncStorage.getItem('access_token');
      console.log('--- REGISTRO DE VENTA ---');
      console.log('URL:', `${API_URL}/ventas/app-cliente`);
      console.log('Token:', token);
      console.log('Payload:', ventaPayload);
      const response = await fetch(`${API_URL}/ventas/app-cliente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ventaPayload),
      });
      console.log('Status HTTP:', response.status);
      const text = await response.text();
      console.log('Respuesta backend:', text);
      if (response.ok) {
        setFeedback('Venta registrada con éxito');
        setTimeout(() => {
          setFeedback(null);
          router.replace('/tickets');
        }, 1800);
      } else {
        setFeedback('Error al registrar la venta');
        setTimeout(() => setFeedback(null), 2500);
      }
    } catch (error) {
      console.log('Error en handleContinue:', error);
      setFeedback('Error de conexión');
      setTimeout(() => setFeedback(null), 2500);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCamera = async (idx: number) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Se requiere permiso para acceder a la cámara');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const updated = [...passengers];
      updated[idx].photo = result.assets[0].uri;
      setPassengers(updated);
      // --- OCR: autocompletar nombre y cédula ---
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);
        const endpoint = `${API_URL}/boletos/cedula-ocr`;
        console.log('Enviando imagen a:', endpoint);
        console.log('FormData:', formData);
        setLoading(true);
        setFeedback('Procesando cédula...');
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const text = await response.text();
        console.log('Respuesta OCR (texto):', text);
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          setFeedback('Respuesta no es JSON');
          setTimeout(() => setFeedback(null), 2000);
          setLoading(false);
          return;
        }
        if (data.nombre && data.cedula) {
          updated[idx].nombre = data.nombre;
          updated[idx].cedula = data.cedula;
          setPassengers([...updated]);
          setFeedback('Datos autocompletados');
          setTimeout(() => setFeedback(null), 1500);
        } else {
          setFeedback('No se pudo extraer la información');
          setTimeout(() => setFeedback(null), 2000);
        }
      } catch (error: any) {
        setFeedback('Error al procesar la imagen: ' + (error?.message || error));
        setTimeout(() => setFeedback(null), 2000);
      } finally {
        setLoading(false);
      }
    }
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
          {/* Header simplificado */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back-outline" size={28} color="#0F172A" />
            </Pressable>
            <Text style={styles.headerTitle}>Datos de pasajeros</Text>
            <View style={styles.notificationIcon} />
          </View>
          {/* Tarifa total */}
          <View style={styles.fareContainer}>
            <ThemedText style={styles.fareLabel}>Tarifa total</ThemedText>
            <ThemedText style={styles.fareAmount}>{total} $</ThemedText>
          </View>
          {/* ScrollView para el formulario de pasajeros y el botón */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Formulario de pasajeros */}
            {seats.length > 0 && (
              <View style={{ marginTop: 24 }}>
                {seats.map((seat, idx) => (
                  <View key={idx} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontWeight: 'bold', color: '#7B61FF', marginBottom: 8 }}>
                      Pasajero {idx + 1} (Asiento {seat})
                    </Text>
                    <Text style={{ color: '#64748B', marginBottom: 8 }}>
                      Toma foto de cédula para llenar tus datos automáticamente (opcional)
                    </Text>
                    <Pressable
                      onPress={() => handleOpenCamera(idx)}
                      style={{ backgroundColor: '#F3F4F6', borderRadius: 50, padding: 20, marginBottom: 12, alignSelf: 'center' }}
                    >
                      <Ionicons name="camera-outline" size={36} color="#7B61FF" />
                    </Pressable>
                    {passengers[idx].photo && (
                      <Image source={{ uri: passengers[idx].photo }} style={{ width: 120, height: 120, marginBottom: 12, borderRadius: 12, alignSelf: 'center' }} />
                    )}
                    <TextInput
                      style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
                      placeholder="Nombre completo"
                      placeholderTextColor="#64748B"
                      value={passengers[idx].nombre}
                      onChangeText={text => {
                        const updated = [...passengers];
                        updated[idx].nombre = text;
                        setPassengers(updated);
                      }}
                    />
                    <TextInput
                      style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
                      placeholder="Cédula"
                      placeholderTextColor="#64748B"
                      keyboardType="numeric"
                      value={passengers[idx].cedula}
                      onChangeText={text => {
                        const updated = [...passengers];
                        updated[idx].cedula = text;
                        setPassengers(updated);
                      }}
                    />
                  </View>
                ))}
              </View>
            )}
            {/* Selección de método de pago */}
            <View style={{ marginTop: 24, marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold', color: '#7B61FF', marginBottom: 8, fontSize: 16 }}>
                Escoge el método de pago
              </Text>
              {metodosPago.map(metodo => (
                <Pressable
                  key={metodo.id}
                  onPress={() => setMetodoPagoId(metodo.id)}
                  style={{
                    padding: 12,
                    backgroundColor: metodoPagoId === metodo.id ? '#7B61FF' : '#F3F4F6',
                    borderRadius: 8,
                    marginBottom: 8
                  }}
                >
                  <Text style={{ color: metodoPagoId === metodo.id ? '#fff' : '#0F172A', fontWeight: 'bold' }}>
                    {metodo.nombre}
                  </Text>
                </Pressable>
              ))}
            </View>
            {/* Botón continuar habilitado solo si todos los pasajeros tienen nombre y cédula y hay método de pago */}
            <Pressable
              style={[
                styles.continueButton,
                (!passengers.every(p => p.nombre && p.cedula) || !metodoPagoId) && styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
              disabled={!passengers.every(p => p.nombre && p.cedula) || !metodoPagoId}
            >
              <Text style={styles.continueButtonText}>
                Continuar
              </Text>
            </Pressable>
          </ScrollView>
        </LinearGradient>
        {/* Tab bar consistente */}
        <View style={styles.bottomNav}>
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
      {(loading || feedback) && (
        <View style={{ position: 'absolute', top: 80, left: 0, right: 0, zIndex: 1000, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 }}>
            {loading && <ActivityIndicator size="small" color="#7B61FF" style={{ marginRight: 8 }} />}
            <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '600' }}>{feedback}</Text>
          </View>
        </View>
      )}
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
}); 