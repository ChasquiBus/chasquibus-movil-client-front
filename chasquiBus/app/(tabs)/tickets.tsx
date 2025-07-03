import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_URL } from '../../constants/api';

// Define la interfaz para un boleto
interface Boleto {
  id: number;
  ventaId: number;
  tarifaId: number;
  descuentoId?: number | null;
  asientoNumero: number;
  codigoQr?: string | null;
  cedula: string;
  nombre: string;
  totalSinDescPorPers: string;
  totalDescPorPers: string;
  totalPorPer: string;
  valorTarifa?: string;
  tipoAsiento?: string;
  tipoVenta?: string;
  hojaTrabajoId?: number;
  cooperativaId?: number;
  nombreCooperativa?: string;
  logoCooperativa?: string;
  telefonoCooperativa?: string;
  busId?: number;
  estadoHojaTrabajo?: string;
  frecDiaId?: number;
  fechaSalida?: string;
  numeroBus?: string;
  placaBus?: string;
  horaSalidaProg?: string;
  rutaId?: number;
  codigoRuta?: string;
  usado?: boolean;
  apellido?: string;
}

export default function TicketsScreen() {
  const router = useRouter();
  const [checkingToken, setCheckingToken] = React.useState(true);
  const [userName, setUserName] = useState('');
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [loadingBoletos, setLoadingBoletos] = useState(true);
  const [filtro, setFiltro] = useState('proximos'); // 'proximos', 'usados', 'todos'
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchBoletos = async () => {
    setLoadingBoletos(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch(`${API_URL}/boletos/mis-boletos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBoletos(data);
      }
    } catch (e) {
      //
    } finally {
      setLoadingBoletos(false);
    }
  };

  React.useEffect(() => {
    fetchBoletos();
  }, []);

  const hoy = new Date();
  const boletosFiltrados = boletos.filter((boleto: Boleto) => {
    if (filtro === 'proximos') {
      // Si tiene campo usado, prioriza eso, si no, usa fecha
      if (typeof boleto.usado === 'boolean') return !boleto.usado;
      if (boleto.fechaSalida) return new Date(boleto.fechaSalida) >= hoy;
      return true;
    }
    if (filtro === 'usados') {
      if (typeof boleto.usado === 'boolean') return boleto.usado;
      if (boleto.fechaSalida) return new Date(boleto.fechaSalida) < hoy;
      return false;
    }
    return true; // todos
  });

  // Ordena los boletos filtrados: primero por fechaSalida descendente, si no hay, por id descendente
  const boletosOrdenados = [...boletosFiltrados].sort((a, b) => {
    if (a.fechaSalida && b.fechaSalida) {
      return new Date(b.fechaSalida).getTime() - new Date(a.fechaSalida).getTime();
    }
    return (b.id || 0) - (a.id || 0);
  });

  // Función para copiar el código de boleto
  const copyToClipboard = (boletoId: number) => {
    Clipboard.setStringAsync(String(boletoId));
    Alert.alert('Copiado', `Código de boleto #${boletoId} copiado al portapapeles.`);
  };

  // Función para compartir el QR
  const shareQr = async (codigoQr: string | undefined | null, boletoId: number) => {
    if (!codigoQr) return;
    try {
      // Extrae solo el base64
      const base64Data = codigoQr.replace(/^data:image\/png;base64,/, '');
      // Crea un archivo temporal
      const fileUri = FileSystem.cacheDirectory + `boleto_${boletoId}_qr.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
      // Comparte el archivo
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el QR');
      console.error('Error al compartir QR:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBoletos();
    setRefreshing(false);
  };

  if (checkingToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={{ marginTop: 16, color: '#7B61FF', fontWeight: 'bold' }}>Validando sesión...</Text>
      </View>
    );
  }

  if (loadingBoletos) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={{ marginTop: 16, color: '#7B61FF', fontWeight: 'bold' }}>Cargando boletos...</Text>
      </View>
    );
  }

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
          {/* Top Navigation */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 16 }}>
            <Pressable
              onPress={() => router.back()}
              style={{ padding: 0 }}
            >
              <Ionicons name="arrow-back-outline" size={28} color="#0F172A" />
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#0F172A', textAlign: 'center', flex: 1 }}>
              MIS RESERVAS
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Header with Avatar */}
         

          {/* Filtro de boletos */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
            <Pressable onPress={() => setFiltro('proximos')} style={[{ padding: 8, borderRadius: 8, marginHorizontal: 4 }, filtro === 'proximos' && { backgroundColor: '#7B61FF' }]}> 
              <Text style={{ color: filtro === 'proximos' ? '#fff' : '#7B61FF', fontWeight: 'bold' }}>Próximos</Text>
            </Pressable>
            <Pressable onPress={() => setFiltro('usados')} style={[{ padding: 8, borderRadius: 8, marginHorizontal: 4 }, filtro === 'usados' && { backgroundColor: '#7B61FF' }]}> 
              <Text style={{ color: filtro === 'usados' ? '#fff' : '#7B61FF', fontWeight: 'bold' }}>Usados</Text>
            </Pressable>
            <Pressable onPress={() => setFiltro('todos')} style={[{ padding: 8, borderRadius: 8, marginHorizontal: 4 }, filtro === 'todos' && { backgroundColor: '#7B61FF' }]}> 
              <Text style={{ color: filtro === 'todos' ? '#fff' : '#7B61FF', fontWeight: 'bold' }}>Todos</Text>
            </Pressable>
          </View>

          {/* Lista de boletos */}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 32 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7B61FF']} />
            }
          >
            {boletosOrdenados.length === 0 ? (
              <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 32, fontSize: 16 }}>
                No tienes boletos aún.
              </Text>
            ) : (
              boletosOrdenados.map((boleto) => (
                (() => { console.log('BOLETO:', boleto); })(),
                <View key={boleto.id} style={{ backgroundColor: '#fff', borderRadius: 16, margin: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  {/* Logo y nombre cooperativa */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    {boleto.logoCooperativa && (
                      <Image source={{ uri: boleto.logoCooperativa }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                    )}
                    <View>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#7B61FF' }}>{boleto.nombreCooperativa}</Text>
                      <Text style={{ color: '#64748B', fontSize: 13 }}>Tel: {boleto.telefonoCooperativa || 'N/A'}</Text>
                    </View>
                  </View>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4, color: '#7B61FF' }}>Boleto #{boleto.id}</Text>
                  <Text>Asiento: <Text style={{ fontWeight: 'bold' }}>{boleto.asientoNumero}</Text>  |  Tipo: <Text style={{ fontWeight: 'bold' }}>{boleto.tipoAsiento}</Text></Text>
                  <Text style={{ fontSize: 15, color: '#0F172A', marginBottom: 2 }}>
                    Pasajero: <Text style={{ fontWeight: 'bold' }}>{boleto.nombre}{boleto.apellido ? ' ' + boleto.apellido : ''}</Text> (Cédula: <Text style={{ fontWeight: 'bold' }}>{boleto.cedula}</Text>)
                  </Text>
                  <Text>Tipo de venta: <Text style={{ fontWeight: 'bold' }}>{boleto.tipoVenta}</Text></Text>
                  <Text>Ruta: <Text style={{ fontWeight: 'bold' }}>{boleto.codigoRuta || 'N/A'}</Text></Text>
                  <Text>Bus: <Text style={{ fontWeight: 'bold' }}>{boleto.numeroBus || 'N/A'}</Text> ({boleto.placaBus || 'N/A'})</Text>
                  <Text>Fecha/Hora: <Text style={{ fontWeight: 'bold' }}>{boleto.fechaSalida ? `${boleto.fechaSalida} ${boleto.horaSalidaProg || ''}` : 'N/A'}</Text></Text>
                  <Text>Estado: <Text style={{ fontWeight: 'bold' }}>{boleto.estadoHojaTrabajo || 'N/A'}</Text></Text>
                  <Text>Precio: <Text style={{ fontWeight: 'bold' }}>${boleto.totalSinDescPorPers}</Text>  Descuento: <Text style={{ fontWeight: 'bold' }}>${boleto.totalDescPorPers}</Text>  Total: <Text style={{ fontWeight: 'bold' }}>${boleto.totalPorPer}</Text></Text>
                  {/* Animación sutil al mostrar QR */}
                  {boleto.codigoQr && (
                    <Animated.View entering={Animated.FadeIn} style={{ alignItems: 'center', marginVertical: 10 }}>
                      <Image source={{ uri: boleto.codigoQr }} style={{ width: 150, height: 150, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }} />
                    </Animated.View>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                    <Pressable onPress={() => copyToClipboard(boleto.id)} style={{ backgroundColor: '#7B61FF', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16, marginRight: 8 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Copiar código</Text>
                    </Pressable>
                    {boleto.codigoQr && (
                      <Pressable onPress={() => shareQr(boleto.codigoQr, boleto.id)} style={{ backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Compartir QR</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
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
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    marginBottom: 16,
  },
  navButton: {
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
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
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
  greeting: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7B61FF',
  },
  reservationList: {
    flex: 1,
    padding: 16,
  },
  reservationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#7B61FF',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  busName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7B61FF',
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
  status: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
    marginBottom: 12,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  features: {
    flexDirection: 'row',
    gap: 12,
  },
  featureIcon: {
    opacity: 0.8,
  },
  tripId: {
    fontSize: 12,
    color: '#64748B',
  }
}); 