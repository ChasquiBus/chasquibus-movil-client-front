import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PaypalWebview() {
  const router = useRouter();
  const { url } = useLocalSearchParams();

  if (!url) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: decodeURIComponent(url as string) }}
      startInLoadingState
      onNavigationStateChange={(navState) => {
        const { url: currentUrl } = navState;
        console.log('WebView navegando a:', currentUrl);
      
        // ✅ Detectar éxito - ahora manejamos la respuesta JSON
        if (currentUrl.includes('/paypal/success') && currentUrl.includes('token=')) {
          const tokenMatch = currentUrl.match(/token=([^&]+)/);
          const token = tokenMatch ? tokenMatch[1] : null;
          console.log('Token de éxito encontrado:', token);
          if (token) {
            console.log('Redirigiendo a página de éxito con token:', token);
            router.replace({
              pathname: '/paginas-pagos/paypal-success',
              params: { orderId: token },
            });
          }
        }
      
        // ✅ Detectar cancelación - ahora manejamos la respuesta JSON
        if (currentUrl.includes('/paypal/cancel')) {
          const tokenMatch = currentUrl.match(/token=([^&]+)/);
          const token = tokenMatch ? tokenMatch[1] : null;
          console.log('Token de cancelación encontrado:', token);
          if (token) {
            console.log('Redirigiendo a página de cancelación con token:', token);
            router.replace({
              pathname: '/paginas-pagos/paypal-cancel',
              params: { orderId: token },
            });
          }
        }
      }}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('Error en WebView:', nativeEvent);
      }}
      onHttpError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('Error HTTP en WebView:', nativeEvent);
      }}
    />
  );
} 