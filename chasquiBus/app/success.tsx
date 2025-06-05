import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';

export default function SuccessScreen() {
  const router = useRouter();

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
});
