import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('Hoy');
  const [showMenu, setShowMenu] = useState(false);

  // Datos simulados de próximos viajes
  const upcomingTrips = [
    {
      id: 1,
      terminal: 'Bus terminal 1',
      from: 'Ambato',
      to: 'Quito',
      time: '9 AM',
      date: '2024.12.08',
      day: 'Sun'
    },
    {
      id: 2,
      terminal: 'Bus terminal 2',
      from: 'Pelileo',
      to: 'Guayaquil',
      time: '2 PM',
      date: '2024.12.08',
      day: 'Sun'
    },
    {
      id: 3,
      terminal: 'Bus terminal 3',
      from: 'Baños',
      to: 'Cuenca',
      time: '5 PM',
      date: '2024.12.08',
      day: 'Sun'
    }
  ];

  const handleSearch = () => {
    console.log('Buscando viajes:', { fromLocation, toLocation, selectedDate });
    router.push('/buses');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleLogout = () => {
    setShowMenu(false);
    router.replace('/(auth)/login');
  };

  const handleViewReservations = () => {
    setShowMenu(false);
    router.push('/tickets');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#E6F0FF', '#FFFFFF']}
          locations={[0, 0.2]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
                <Image
                  source={require('../../assets/images/avatar.png')}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <Text style={styles.welcomeText}>¿A dónde quieres ir?</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Menu desplegable */}
          <Modal
            visible={showMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowMenu(false)}
          >
            <Pressable 
              style={styles.modalOverlay}
              onPress={() => setShowMenu(false)}
            >
              <View style={[styles.menuContainer, {
                top: 70, // Posicionar debajo del avatar
                left: 16,
              }]}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleViewReservations}
                >
                  <Ionicons name="ticket-outline" size={20} color="#0F172A" />
                  <Text style={styles.menuItemText}>Mis Reservas</Text>
                </TouchableOpacity>
                
                <View style={styles.menuDivider} />
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  <Text style={[styles.menuItemText, styles.logoutText]}>
                    Cerrar Sesión
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>

          <View style={styles.searchContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Punto de salida"
                value={fromLocation}
                onChangeText={setFromLocation}
                placeholderTextColor="#666"
              />
              <TouchableOpacity style={styles.swapButton}>
                <Ionicons name="swap-vertical" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="¿A dónde vas?"
                value={toLocation}
                onChangeText={setToLocation}
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  selectedDate === 'Hoy' && styles.dateButtonActive
                ]}
                onPress={() => handleDateSelect('Hoy')}
              >
                <Text style={[
                  styles.dateButtonText,
                  selectedDate === 'Hoy' && styles.dateButtonTextActive
                ]}>Hoy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  selectedDate === 'Mañana' && styles.dateButtonActive
                ]}
                onPress={() => handleDateSelect('Mañana')}
              >
                <Text style={[
                  styles.dateButtonText,
                  selectedDate === 'Mañana' && styles.dateButtonTextActive
                ]}>Mañana</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  selectedDate === 'Otro' && styles.dateButtonActive
                ]}
                onPress={() => handleDateSelect('Otro')}
              >
                <Ionicons name="calendar-outline" size={20} color={selectedDate === 'Otro' ? '#FFFFFF' : '#7B61FF'} />
                <Text style={[
                  styles.dateButtonText,
                  selectedDate === 'Otro' && styles.dateButtonTextActive
                ]}>Otro</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Buscar autobuses</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tripsContainer}>
            <Text style={styles.tripsTitle}>Próximo viaje</Text>
            {upcomingTrips.map((trip) => (
              <Pressable
                key={trip.id}
                style={styles.tripCard}
              >
                <View style={styles.tripNumberContainer}>
                  <Text style={styles.tripNumber}>{trip.id}</Text>
                </View>
                <View style={styles.tripInfo}>
                  <Text style={styles.terminalName}>{trip.terminal}</Text>
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeLabel}>From : </Text>
                    <Text style={styles.routeValue}>{trip.from}</Text>
                  </View>
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeLabel}>to : </Text>
                    <Text style={styles.routeValue}>{trip.to}</Text>
                  </View>
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.departureLabel}>Hora de salida</Text>
                  <Text style={styles.departureTime}>{trip.time} , {trip.day}</Text>
                  <Text style={styles.departureDate}>{trip.date}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7B61FF',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
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
  searchContainer: {
    backgroundColor: '#7B61FF',
    borderRadius: 20,
    margin: 16,
    padding: 16,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  swapButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    backgroundColor: '#7B61FF',
    borderRadius: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonActive: {
    backgroundColor: '#5B41FF',
  },
  dateButtonText: {
    color: '#7B61FF',
    fontSize: 14,
    fontWeight: '600',
  },
  dateButtonTextActive: {
    color: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#7B61FF',
    fontSize: 16,
    fontWeight: '600',
  },
  tripsContainer: {
    padding: 16,
  },
  tripsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  tripCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7B61FF',
  },
  tripInfo: {
    flex: 1,
  },
  terminalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  routeLabel: {
    fontSize: 14,
    color: '#64748B',
    width: 50,
  },
  routeValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  timeContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  departureLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  departureTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  departureDate: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
});
