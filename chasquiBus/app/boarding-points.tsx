import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_URL } from '../constants/api';

// Estado para los descuentos activos
type Descuento = {
  id: number;
  tipoDescuento?: string;
  tipo_descuento?: string;
  requiereValidacion?: boolean;
  requiere_validacion?: boolean;
  porcentaje: string;
  estado: string;
};

interface Passenger {
  photo: string | null;
  nombre: string;
  apellido: string;
  cedula: string;
  descuentoId: number | null;
  totalSinDescPorPers: string;
  totalDescPorPers: string;
  totalPorPer: string;
  tarifaId: number;
}

export default function BoardingPointsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const asientosSeleccionados = typeof params.asientosSeleccionados === 'string' ? JSON.parse(params.asientosSeleccionados) : [];
  const seats = asientosSeleccionados.map((a: any) => a.numeroAsiento);
  const total: string = typeof params.total === 'string' ? params.total : '0.00';
  const [showMenu, setShowMenu] = useState(false);
  const [checkingToken, setCheckingToken] = React.useState(true);
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const precioUnitario = seats.map(() => parseFloat(total) / seats.length);
  const tarifas = typeof params.tarifas === 'string' ? JSON.parse(params.tarifas) : (params.tarifas || []);
  const [passengers, setPassengers] = useState<Passenger[]>(
    asientosSeleccionados.map((a: any) => {
      const tarifa = tarifas.find((t: any) => t.tipoAsiento === a.tipoAsiento);
      return {
        photo: null,
        nombre: '',
        apellido: '',
        cedula: '',
        descuentoId: null,
        totalSinDescPorPers: tarifa ? tarifa.valor : a.precio.toFixed(2),
        totalDescPorPers: '0.00',
        totalPorPer: tarifa ? tarifa.valor : a.precio.toFixed(2),
        tarifaId: tarifa ? tarifa.id : null
      };
    })
  );
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  // Métodos de pago disponibles (hardcodeados por posición)
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
    // Traer descuentos activos
    const fetchDescuentos = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/descuentos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        // Filtra solo los descuentos activos y que no sean 'estudiante'
        const activos = Array.isArray(data) ? data.filter(d => d.estado === 'activo' && (d.tipoDescuento || d.tipo_descuento).toLowerCase() !== 'estudiante') : [];
        console.log('Descuentos activos:', activos);
        setDescuentos(activos);
      } catch (e) {
        setDescuentos([]);
      }
    };
    fetchDescuentos();
  }, [params.cooperativaId]);

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
    // Cruce de asientos y tarifas antes de enviar
    const boletos = passengers.map((p, idx) => {
      const asiento = asientosSeleccionados[idx];
      // Filtrar por tipoAsiento y aplicaTarifa
      const tarifa = tarifas.find((t: any) => t.tipoAsiento === asiento.tipoAsiento && t.aplicaTarifa);
      if (!tarifa) {
        setFeedback(`Error: No se encontró tarifa activa para el tipo de asiento ${asiento.tipoAsiento}`);
        setLoading(false);
        throw new Error(`No se encontró tarifa activa para el tipo de asiento: ${asiento.tipoAsiento}`);
      }
      return {
        asientoNumero: asiento.numeroAsiento,
        tarifaId: tarifa.id,
        cedula: p.cedula,
        nombre: p.nombre,
        apellido: p.apellido,
        descuentoId: p.descuentoId,
        totalSinDescPorPers: tarifa.valor,
        totalDescPorPers: p.totalDescPorPers,
        totalPorPer: p.totalPorPer || tarifa.valor,
      };
    });
    // Validación de tarifaId
    if (boletos.some(b => !b.tarifaId || b.tarifaId <= 0)) {
      setFeedback('Error: Hay un pasajero sin tarifa válida.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setFeedback('Registrando venta...');
    try {
      // IDs y datos de ejemplo, reemplaza por los reales de params si existen
      const cooperativaId = params.cooperativaId || 1;
      const hojaTrabajoId = Number(params.hojaTrabajoId);
      if (!hojaTrabajoId || isNaN(hojaTrabajoId)) {
        setFeedback('Error: No se seleccionó un viaje válido. Intenta de nuevo.');
        setLoading(false);
        return;
      }
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

      const ventaPayload = {
        cooperativaId,
        metodoPagoId,
        hojaTrabajoId,
        estadoPago,
        busId,
        tipoVenta,
        posiciones,
        boletos
      };
      console.log('Payload a enviar:', ventaPayload);
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
  setTimeout(async () => {
    setFeedback(null);
    try {
      const venta = JSON.parse(text);
      const ventaId = venta.id || venta.ventaId || (venta.venta && venta.venta.id);
      const pago = venta.pago;
      let boletos: any[] = [];

      // 👉 1. Si el método de pago es PayPal, redirige al WebView con la URL de PayPal
      const isPaypal = metodoPagoId === metodosPago[1].id; 
      const paypalUrl = pago?.url;

      if (isPaypal && paypalUrl) {
        // 🚀 Redirigir a la pantalla con WebView embebido
        router.replace({
          pathname: '/paginas-pagos/paypal-webview',
          params: { url: encodeURIComponent(paypalUrl) },
        });
        return;
      }

      // 👉 2. Si el método de pago es Depósito, redirige a las instrucciones
      const isDeposito = metodoPagoId === metodosPago[0].id;
      if (isDeposito) {
        // 🚀 Redirigir a la pantalla de instrucciones de depósito con los datos de la venta
        router.replace({
          pathname: '/paginas-pagos/deposito-view',
          params: { ventaData: JSON.stringify({ ...venta, boletos }) },
        });
        return;
      }

      // 👉 2. Si no es PayPal, continúa flujo normal
      if (ventaId) {
        const token = await AsyncStorage.getItem('access_token');
        const boletosRes = await fetch(`${API_URL}/boletos/venta/${ventaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (boletosRes.ok) {
          boletos = await boletosRes.json();
          console.log('Boletos recibidos del backend:', boletos);
        } else {
          console.log('Error al obtener boletos:', boletosRes.status, await boletosRes.text());
        }
      }

      router.replace({
        pathname: '/success',
        params: { venta: JSON.stringify({ ...venta, boletos }) },
      });

    } catch (e) {
      console.error('Error al procesar respuesta de venta:', e);
      router.replace('/success');
    }
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

  // Restaurar función de tomar foto y autocompletar ambos campos con una sola petición
  const handleOpenCamera = async (idx: number) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Se requiere permiso para acceder a la cámara');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 1 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Preprocesar la imagen antes de enviarla
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [
          { resize: { width: 1000 } },
        ],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 1 }
      );
      const updated = [...passengers];
      updated[idx].photo = manipResult.uri;
      setPassengers(updated);
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: manipResult.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);
        const endpoint = `${API_URL}/boletos/cedula-ocr`;
        const token = await AsyncStorage.getItem('access_token');
        setLoading(true);
        setFeedback('Procesando cédula...');
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
          console.log('Respuesta OCR data:', data);
        } catch (e) {
          setFeedback('Respuesta no es JSON');
          setTimeout(() => setFeedback(null), 2000);
          setLoading(false);
          return;
        }
        if (!data.cedula || !data.nombre) {
          setFeedback('No se pudo extraer la información. Intenta con una foto más clara.');
          setTimeout(() => setFeedback(null), 2000);
          setLoading(false);
          return;
        }
        if (!/^\d{10}$/.test(data.cedula)) {
          setFeedback('La cédula extraída no es válida. Intenta con una foto más clara.');
          setTimeout(() => setFeedback(null), 2000);
          setLoading(false);
          return;
        }
        updated[idx].nombre = data.nombre;
        updated[idx].cedula = data.cedula;
        setPassengers([...updated]);
        setFeedback('Datos autocompletados');
        setTimeout(() => setFeedback(null), 1500);
      } catch (error: any) {
        setFeedback('Error al procesar la imagen: ' + (error?.message || error));
        setTimeout(() => setFeedback(null), 2000);
      } finally {
        setLoading(false);
      }
    }
  };

  // Calcular la tarifa total dinámica según los descuentos seleccionados
  const totalTarifa = passengers.reduce((acc, p) => acc + parseFloat(p.totalPorPer || '0'), 0).toFixed(2);

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
            <View style={{ flex: 1, alignItems: 'center', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', pointerEvents: 'none' }}>
              <Text style={styles.headerTitle}>Datos de pasajeros</Text>
            </View>
          </View>
          {/* Tarifa total */}
          <View style={[styles.fareContainer, { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginHorizontal: 8, marginTop: 20, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#E2E8F0' }]}> 
            <Text style={{ fontSize: 16, color: '#64748B', fontWeight: '500', flex: 1 }}>Tarifa total</Text>
            <Text style={{ fontSize: 28, color: '#0F172A', fontWeight: 'bold' }}>{totalTarifa} $</Text>
          </View>
          {/* Detalle de descuentos por pasajero */}
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, marginHorizontal: 8, marginBottom: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Text style={{ color: '#7B61FF', fontWeight: 'bold', marginBottom: 6 }}>Pasajeros y descuentos:</Text>
            {passengers.map((p, idx) => {
              const desc = descuentos.find(d => d.id === p.descuentoId);
              return (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ color: '#0F172A', fontWeight: '500', minWidth: 90 }}>
                    • Asiento {seats[idx]}:
                  </Text>
                  <Text style={{ color: desc ? '#7B61FF' : '#64748B', fontWeight: desc ? 'bold' : 'normal', marginLeft: 2, minWidth: 90 }}>
                    {desc ? (desc.tipoDescuento || desc.tipo_descuento) : 'Ninguno'}
                  </Text>
                  <Text style={{ color: '#64748B', marginLeft: 8, minWidth: 70 }}>
                    —  ${parseFloat(p.totalDescPorPers).toFixed(2)}
                  </Text>
                  <Text style={{ color: '#0F172A', fontWeight: 'bold', marginLeft: 8 }}>
                    Total: ${parseFloat(p.totalPorPer).toFixed(2)}
                  </Text>
              </View>
              );
            })}
            </View>
          {/* ScrollView para el formulario de pasajeros y el botón */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Formulario de pasajeros */}
            {seats.length > 0 && (
              <View style={{ marginTop: 24 }}>
                {seats.map((seat: number | string, idx: number) => (
                  <View key={idx} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontWeight: 'bold', color: '#7B61FF', marginBottom: 8 }}>
                      Pasajero {idx + 1} (Asiento {seat})
                    </Text>
                    <Text style={{ color: '#64748B', marginBottom: 8 }}>
                      Toma foto de cédula para llenar tus datos automáticamente (opcional)
                    </Text>
                    <Text style={{ color: '#64748B', fontSize: 13, marginBottom: 8 }}>
                      📸 Recomendaciones para una mejor lectura:
                      {"\n• Toma la foto en un lugar bien iluminado" +
                       "\n• Mantén la cédula plana y sin sombras" +
                       "\n• Acércate lo suficiente para que se vea clara" +
                       "\n• Evita reflejos en la cédula" +
                       "\n• Asegúrate de que toda la cédula esté visible"}
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
                      placeholder="Nombre"
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
                      placeholder="Apellido"
                      placeholderTextColor="#64748B"
                      value={passengers[idx].apellido}
                      onChangeText={text => {
                        const updated = [...passengers];
                        updated[idx].apellido = text;
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
                    {/* Selector de descuento */}
                    <Text style={{ fontWeight: 'bold', color: '#7B61FF', marginBottom: 4, marginTop: 8 }}>
                      Tipo de descuento
                    </Text>
                    <Text style={{ color: '#64748B', marginBottom: 8, fontSize: 13 }}>
                      Señor pasajero, escoja "Ninguno" en caso de no tener discapacidad, ser tercera edad o menor de edad. La información se verificará cuando aborde al bus.
                    </Text>
                    {(Array.isArray(descuentos) && descuentos.length === 0) && (
                      <Text style={{ color: '#64748B', marginBottom: 8 }}>No hay descuentos disponibles</Text>
                    )}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                  <Pressable 
                        onPress={() => {
                          const updated = [...passengers];
                          updated[idx].descuentoId = null;
                          const precio = asientosSeleccionados[idx]?.precio || 0;
                          updated[idx].totalSinDescPorPers = precio.toFixed(2);
                          updated[idx].totalDescPorPers = '0.00';
                          updated[idx].totalPorPer = precio.toFixed(2);
                          setPassengers(updated);
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: passengers[idx].descuentoId === null ? '#7B61FF' : '#F3F4F6',
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ color: passengers[idx].descuentoId === null ? '#fff' : '#0F172A' }}>Ninguno</Text>
                  </Pressable>
                      {(Array.isArray(descuentos) ? descuentos : []).map((desc) => (
                  <Pressable 
                          key={desc.id}
                          onPress={() => {
                            const updated = [...passengers];
                            updated[idx].descuentoId = desc.id;
                            // Calcular precios con descuento
                            const precio = asientosSeleccionados[idx]?.precio || 0;
                            const porcentaje = parseFloat(desc.porcentaje);
                            const descValue = (precio * porcentaje / 100).toFixed(2);
                            const finalValue = (precio - parseFloat(descValue)).toFixed(2);
                            updated[idx].totalSinDescPorPers = precio.toFixed(2);
                            updated[idx].totalDescPorPers = descValue;
                            updated[idx].totalPorPer = finalValue;
                            setPassengers(updated);
                          }}
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: passengers[idx].descuentoId === desc.id ? '#7B61FF' : '#F3F4F6',
                            marginRight: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ color: passengers[idx].descuentoId === desc.id ? '#fff' : '#0F172A' }}>
                            {desc.tipoDescuento || desc.tipo_descuento}
                    </Text>
                  </Pressable>
                      ))}
              </View>
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
            {/* Botón continuar habilitado solo si todos los pasajeros tienen nombre, apellido y cédula y hay método de pago */}
              <Pressable
                style={[
                  styles.continueButton,
                (!passengers.every(p => p.nombre && p.apellido && p.cedula) || !metodoPagoId) && styles.continueButtonDisabled
                ]}
                onPress={handleContinue}
              disabled={!passengers.every(p => p.nombre && p.apellido && p.cedula) || !metodoPagoId}
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