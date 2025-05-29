import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { COLORS } from '../constants/Colors';

export default function PassengerInfoScreen() {
  const [passengers, setPassengers] = useState([
    { id: 1, cedula: '', nombre: '', edad: '', genero: '' },
    { id: 2, cedula: '', nombre: '', edad: '', genero: '' }
  ]);

  const handleContinue = () => {
    // Handle reservation continuation
    console.log('Continuing with reservation', passengers);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Información del viajero',
          headerStyle: {
            backgroundColor: COLORS.PRIMARY,
          },
          headerTintColor: '#fff',
          headerLeft: () => (
            <Pressable style={{ marginLeft: 16 }}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable style={{ marginRight: 16 }}>
              <MaterialIcons name="notifications-none" size={24} color="white" />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.tripInfo}>
          <ThemedText style={styles.busName}>El Dorado</ThemedText>
          <View style={styles.tripDetails}>
            <ThemedText style={styles.tripType}>A/C Sleeper (2+2)</ThemedText>
            <ThemedText style={styles.tripTime}>9:00 AM — 9:45 AM</ThemedText>
          </View>
        </View>

        <View style={styles.scanSection}>
          <ThemedText style={styles.sectionTitle}>Scanear cédula</ThemedText>
          <Pressable style={styles.scanButton}>
            <MaterialIcons name="qr-code-scanner" size={24} color={COLORS.PRIMARY} />
          </Pressable>
        </View>

        {passengers.map((passenger, index) => (
          <View key={passenger.id} style={styles.passengerForm}>
            <ThemedText style={styles.passengerTitle}>Pasajero {index + 1}</ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Cédula"
              placeholderTextColor="#666"
              value={passenger.cedula}
            />

            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#666"
              value={passenger.nombre}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.ageInput]}
                placeholder="Edad"
                placeholderTextColor="#666"
                value={passenger.edad}
              />
              
              <View style={styles.genderContainer}>
                <Pressable
                  style={[
                    styles.genderButton,
                    passenger.genero === 'Hombre' && styles.genderButtonActive
                  ]}
                >
                  <ThemedText style={styles.genderButtonText}>Hombre</ThemedText>
                </Pressable>
                <Pressable
                  style={[
                    styles.genderButton,
                    passenger.genero === 'Mujer' && styles.genderButtonActive
                  ]}
                >
                  <ThemedText style={styles.genderButtonText}>Mujer</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <ThemedText style={styles.continueButtonText}>
            Continuar para reservar
          </ThemedText>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  tripInfo: {
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  busName: {
    fontSize: 24,
    color: 'white',
    fontWeight: '600',
  },
  tripDetails: {
    marginTop: 8,
  },
  tripType: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  tripTime: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
  },
  scanSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  },
  scanButton: {
    padding: 12,
    backgroundColor: '#E6F0FF',
    borderRadius: 12,
  },
  passengerForm: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passengerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ageInput: {
    flex: 1,
  },
  genderContainer: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#7B61FF',
    borderColor: '#7B61FF',
  },
  genderButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#7B61FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 