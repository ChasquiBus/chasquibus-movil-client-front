import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../../constants/api';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  cedula: string;
}

interface UserInfo {
  id: number;
  usuario: Usuario;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          router.replace('/(auth)/login');
          return;
        }

        const response = await fetch(`${API_URL}/clientes/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          await AsyncStorage.removeItem('access_token');
          router.replace('/(auth)/login');
          return;
        }

        if (response.ok) {
          const data: UserInfo = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mi Perfil',
          headerStyle: {
            backgroundColor: '#E6F0FF',
          },
          headerShadowVisible: false,
          headerTintColor: '#0F172A',
        }}
      />
      <ScrollView style={styles.container}>
        {/* Header con información del usuario */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#7B61FF" />
          </View>
          <Text style={styles.userName}>{userInfo?.usuario?.nombre || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{userInfo?.usuario?.email || 'usuario@email.com'}</Text>
          <Text style={styles.userCedula}>Cédula: {userInfo?.usuario?.cedula || 'N/A'}</Text>
        </View>

        {/* Opciones de configuración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="person-outline" size={24} color="#7B61FF" />
            <Text style={styles.optionText}>Editar Perfil</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="notifications-outline" size={24} color="#7B61FF" />
            <Text style={styles.optionText}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="lock-closed-outline" size={24} color="#7B61FF" />
            <Text style={styles.optionText}>Seguridad</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="card-outline" size={24} color="#7B61FF" />
            <Text style={styles.optionText}>Métodos de Pago</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Información del viaje */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Viaje</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="ticket-outline" size={24} color="#7B61FF" />
            <Text style={styles.optionText}>Mis Reservas</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="time-outline" size={24} color="#7B61FF" />
            <Text style={styles.optionText}>Historial de Viajes</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="star-outline" size={24} color="#7B61FF" />
            <Text style={styles.optionText}>Calificaciones</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Soporte y ayuda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="help-circle-outline" size={24} color="#7B61FF" />
            <Text style={styles.optionText}>Centro de Ayuda</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="chatbubble-outline" size={24} color="#7B61FF" />
            <Text style={styles.optionText}>Contactar Soporte</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="information-circle-outline" size={24} color="#7B61FF" />
            <Text style={styles.optionText}>Acerca de</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    color: '#7B61FF',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  userCedula: {
    fontSize: 14,
    color: '#94A3B8',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
}); 