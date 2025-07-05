import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';

export default function PaypalCancel() {
  const { orderId } = useLocalSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<any>(null);
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  useEffect(() => {
    const procesarCancelacion = async () => {
      try {
        console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
        console.log('orderId:', orderId);
        const url = `${process.env.EXPO_PUBLIC_API_URL}/pagos/paypal/cancel?token=${orderId}`;
        console.log('URL completa:', url);
        
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        console.log('Status de respuesta:', res.status);
        console.log('Status text:', res.statusText);
        
        const data = await res.json();
        console.log('Datos de respuesta:', data);
        
        if (res.ok && data.ok) {
          setData(data);
          setStatus('success');
        } else {
          console.error('Error al procesar cancelación:', data);
          setStatus('error');
        }
      } catch (e) {
        console.error('Error de red:', e);
        if (e instanceof Error) {
          console.error('Detalles del error:', {
            message: e.message,
            name: e.name
          });
        }
        setStatus('error');
      }
    };

    if (orderId) {
      procesarCancelacion();
    } else {
      console.log('No hay orderId, asumiendo cancelación');
      setStatus('success'); // Si no hay orderId, asumimos que fue cancelado
    }
  }, [orderId]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Procesando cancelación...</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 20 }}>
          Error al procesar la cancelación del pago.
        </Text>
        <Button title="Volver al inicio" onPress={() => router.replace('/(tabs)')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Pago cancelado
      </Text>
      
      <View style={{ backgroundColor: '#fff3cd', padding: 20, borderRadius: 10, width: '100%', marginBottom: 20, borderWidth: 1, borderColor: '#ffeaa7' }}>
        <Text style={{ fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
          El pago ha sido cancelado exitosamente.
        </Text>
        {data?.orderId && (
          <Text style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
            ID de Orden: {data.orderId}
          </Text>
        )}
      </View>
      
      <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
        Serás redirigido automáticamente al inicio en {countdown} segundos
      </Text>
      
      <Button title="Buscar otro viaje ahora" onPress={() => router.replace('/(tabs)')} />
    </View>
  );
} 