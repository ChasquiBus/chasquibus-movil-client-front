import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';

export default function PaypalSuccess() {
  const { orderId } = useLocalSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const confirmarPago = async () => {
      try {
        console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
        console.log('orderId:', orderId);
        
        if (!process.env.EXPO_PUBLIC_API_URL) {
          console.error('EXPO_PUBLIC_API_URL no está definida');
          setStatus('error');
          return;
        }
        
        const url = `${process.env.EXPO_PUBLIC_API_URL}/pagos/paypal/success?token=${orderId}`;
        console.log('URL completa:', url);
        
        // Test de conectividad básica
        try {
          console.log('Probando conectividad...');
          const testRes = await fetch(process.env.EXPO_PUBLIC_API_URL, { 
            method: 'GET'
          });
          console.log('Test de conectividad exitoso:', testRes.status);
        } catch (testError) {
          console.warn('Test de conectividad falló:', testError);
        }
        
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
          
          // Redirección automática después de 5 segundos
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                router.replace('/(tabs)/tickets');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          console.error('Error al confirmar:', data);
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
      confirmarPago();
    } else {
      console.error('No se proporcionó orderId');
      setStatus('error');
    }
  }, [orderId]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Confirmando pago...</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 20 }}>
          Error al confirmar el pago con PayPal.
        </Text>
        <Button title="Volver al inicio" onPress={() => router.replace('/(tabs)')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        ¡Pago confirmado con éxito!
      </Text>
      
      <View style={{ backgroundColor: '#f0f0f0', padding: 20, borderRadius: 10, width: '100%', marginBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>ID de Orden:</Text> {data?.orderId}
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>Estado:</Text> {data?.mensaje}
        </Text>
        {data?.ventaId && (
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>ID de Venta:</Text> {data.ventaId}
          </Text>
        )}
      </View>
      
      <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
        Serás redirigido automáticamente a tus tickets en {countdown} segundos
      </Text>
      
      <Button title="Ver mis tickets ahora" onPress={() => router.replace('/(tabs)/tickets')} />
      <View style={{ height: 10 }} />
      <Button title="Ir al inicio" onPress={() => router.replace('/(tabs)')} />
    </View>
  );
} 