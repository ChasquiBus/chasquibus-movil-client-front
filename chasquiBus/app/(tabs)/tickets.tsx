import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function TicketsScreen() {
  const router = useRouter();
  const [checkingToken, setCheckingToken] = React.useState(true);
  const [userName, setUserName] = useState('');

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

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/clientes/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserName(data.usuario?.nombre || '');
      }
    };
    fetchUser();
  }, []);

  if (checkingToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={{ marginTop: 16, color: '#7B61FF', fontWeight: 'bold' }}>Validando sesión...</Text>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 16, marginLeft: 16 }}>
            <Image
              source={require('../../assets/images/welcome.jpg')}
              style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
            />
            <View>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0F172A' }}>
                Hola {userName}!
              </Text>
              <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 15 }}>
                MIS RESERVAS
              </Text>
            </View>
          </View>

          <ScrollView style={styles.reservationList}>
            <TouchableOpacity style={styles.reservationCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.busName}>El Dorado</Text>
                <Text style={styles.price}>8$</Text>
              </View>
              <Text style={styles.busType}>A/C Sleeper (2+2)</Text>
              <View style={styles.timeInfo}>
                <Text style={styles.time}>9:00 AM</Text>
                <Text style={styles.duration}>—</Text>
                <Text style={styles.time}>9:45 AM</Text>
              </View>
              <Text style={styles.status}>Reservado</Text>
              <View style={styles.bottomContainer}>
                <View style={styles.features}>
                  <Ionicons name="location-outline" size={20} color="#64748B" style={styles.featureIcon} />
                  <Ionicons name="ticket-outline" size={20} color="#64748B" style={styles.featureIcon} />
                  <Ionicons name="time-outline" size={20} color="#64748B" style={styles.featureIcon} />
                  <Ionicons name="refresh-outline" size={20} color="#64748B" style={styles.featureIcon} />
                </View>
                <Text style={styles.tripId}>17,18</Text>
              </View>
              <Text style={{ marginTop: 8 }}>Código QR:</Text>
              <QRCode value="17,18" size={120} />
            </TouchableOpacity>
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