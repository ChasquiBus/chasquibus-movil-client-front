import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { BackHandler, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  let venta = null;
  try {
    venta = params.venta ? JSON.parse(params.venta as string) : null;
  } catch (e) {
    venta = null;
  }

  // Bloquear retroceso físico y gesto de back
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true; // Bloquea el back
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: '#E6F0FF' }
        }}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <StatusBar style="dark" />
          <LinearGradient
            colors={['#E6F0FF', '#FFFFFF']}
            locations={[0, 0.2]}
            style={styles.gradient}
          >
            <View style={styles.contentContainer}>
              <View style={styles.successImageContainer}>
                <View style={styles.cartIconContainer}>
                  <Ionicons name="cart" size={60} color="#FFFFFF" />
                </View>
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.starContainer1}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                </View>
                <View style={styles.starContainer2}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                </View>
              </View>

              <View style={styles.textContainer}>
                <ThemedText style={styles.title}>
                Tu boleto ha sido generado con éxito
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                ¡Gracias por viajar con nosotros! Puedes seguir comprando boletos y descubrir más destinos en Ecuador ❤
                </ThemedText>
              </View>

              {/* Mostrar boletos y QR si existen */}
              {venta && venta.boletos && Array.isArray(venta.boletos) && venta.boletos.length > 0 ? (
                venta.boletos.map((boleto: any, idx: number) => (
                  <View key={boleto.id || idx} style={styles.ticketCard}>
                    <Text style={styles.ticketTitle}>Boleto #{boleto.id}</Text>
                    <Text style={styles.ticketInfo}>Asiento: <Text style={{ fontWeight: 'bold' }}>{boleto.asientoNumero || boleto.numeroAsiento}</Text></Text>
                    <Text style={styles.ticketInfo}>Pasajero: <Text style={{ fontWeight: 'bold' }}>{boleto.nombre} {boleto.apellido}</Text></Text>
                    <Text style={styles.ticketInfo}>Cédula: <Text style={{ fontWeight: 'bold' }}>{boleto.cedula}</Text></Text>
                    <View style={{ alignItems: 'center', marginVertical: 12 }}>
                      {boleto.codigoQr ? (
                        <Image source={{ uri: boleto.codigoQr }} style={{ width: 180, height: 180, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }} />
                      ) : (
                        <Text style={{ color: '#64748B' }}>QR no disponible</Text>
                      )}
                    </View>
                    <Text style={{ color: '#64748B', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>Presenta este QR al abordar el bus</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#EF4444', textAlign: 'center', marginTop: 32 }}>No se encontraron boletos en la respuesta.</Text>
              )}

              <Pressable
                style={styles.button}
                onPress={() => router.replace('/(tabs)')}
              >
                <Text style={styles.buttonText}>
                  Volver a la página de inicio
                </Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successImageContainer: {
    width: 200,
    height: 200,
    position: 'relative',
    marginBottom: 40,
  },
  cartIconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#7B61FF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 40,
    left: 40,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 40,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starContainer1: {
    position: 'absolute',
    top: 100,
    left: 20,
  },
  starContainer2: {
    position: 'absolute',
    bottom: 40,
    right: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#7B61FF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7B61FF',
    marginBottom: 8,
  },
  ticketInfo: {
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 2,
  },
});
