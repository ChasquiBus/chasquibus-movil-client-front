import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/Colors';

const slides = [
  require('../assets/images/welcome.jpg'),
  require('../assets/images/welcome2.png'),
  require('../assets/images/welcome3.jpg'),
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      // Primero hacemos fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // para el slider de imagenes
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        // Hacemos fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: '',
          headerStyle: {
            backgroundColor: '#E6F0FF',
          },
          headerShadowVisible: false,
          headerTintColor: '#0F172A',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingLeft: 16 }}
              accessibilityLabel="Volver"
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          ),
        }} 
      />
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        <View style={styles.contentContainer}>
          <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
            <Image
              source={slides[currentIndex]}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>

          <Text style={styles.title}>
            ¡Bienvenido!!! 🚌✨
          </Text>

          <Text style={styles.subtitle}>
            Tu aplicación ideal para reservar asientos de{'\n'}
            autobús de forma sencilla, consultar horarios{'\n'}
            en tiempo real, realizar pagos seguros y{'\n'}
            recibir actualizaciones de viaje.
          </Text>

          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index && styles.activeDot
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>
              COMENZAR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRegister}
          >
            <Text style={styles.createAccountText}>
              Crear Cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  //contenedor de imagen aqui se puede cambiar el tamaño de la imagen
  imageContainer: {
    width: 300,
    height: 300,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT.PRIMARY,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT.SECONDARY,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.DOTS.INACTIVE,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.DOTS.ACTIVE,
  },
  primaryButton: {
    backgroundColor: COLORS.BUTTON.PRIMARY,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.BUTTON.TEXT,
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'none',
  },
}); 