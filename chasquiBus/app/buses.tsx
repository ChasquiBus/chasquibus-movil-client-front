import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function BusSelectionScreen() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    setShowMenu(false);
    router.replace('/(auth)/login');
  };

  const handleViewReservations = () => {
    setShowMenu(false);
    router.push('/tickets');
  };

  const buses = [
    {
      id: 1,
      company: 'El Dorado',
      type: 'A/C Sleeper (2+2)',
      departure: '9:00 AM',
      arrival: '9:45 AM',
      duration: '45 Min',
      price: 4,
      seatsLeft: 15,
      features: ['wifi', 'ac', 'usb', 'food'],
    },
    {
      id: 2,
      company: '22 de Julio',
      type: 'A/C Sleeper (2+2)',
      departure: '9:00 AM',
      arrival: '9:20 AM',
      duration: '20 Min',
      price: 3.50,
      seatsLeft: 2,
      features: ['wifi', 'ac', 'usb', 'food'],
    },
    {
      id: 3,
      company: 'Amazonas',
      type: 'Non A/C Sleeper (2+1)',
      departure: '9:00 AM',
      arrival: '9:45 AM',
      duration: '45 Min',
      price: 5,
      seatsLeft: 5,
      features: ['wifi', 'ac', 'usb', 'food'],
    },
  ];

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Selección de Bus',
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
                  source={require('../assets/images/avatar.png')}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <View>
                <Text style={styles.greeting}>Hola Saduni Silva!</Text>
                <Text style={styles.subtitle}>Selecciona tu autobús</Text>
              </View>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="filter" size={24} color="#0F172A" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
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
                top: 70,
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

          <View style={styles.routeCard}>
            <View style={styles.routeInfo}>
              <View style={styles.locationContainer}>
                <Ionicons name="home-outline" size={24} color="#FFFFFF" />
                <Text style={styles.locationText}>Ambato</Text>
              </View>
              <View style={styles.swapIconContainer}>
                <Ionicons name="bus-outline" size={28} color="#7B61FF" style={{ transform: [{ scaleX: -1 }] }} />
              </View>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={24} color="#FFFFFF" />
                <Text style={styles.locationText}>Quito</Text>
              </View>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>
                08 de diciembre de 2024 | Domingo
              </Text>
            </View>
          </View>

          <ScrollView style={styles.busListContainer}>
            {buses.map((bus) => (
              <TouchableOpacity
                key={bus.id}
                style={styles.busCard}
                onPress={() => {
                  console.log('Selected bus:', bus.id);
                  router.push({
                    pathname: '/seat-selection',
                    params: {
                      busId: bus.id,
                      company: bus.company,
                      type: bus.type,
                      departure: bus.departure,
                      arrival: bus.arrival,
                      duration: bus.duration,
                      price: bus.price,
                      seatsLeft: bus.seatsLeft
                    }
                  });
                }}
              >
                <View style={styles.busHeader}>
                  <Text style={styles.companyName}>{bus.company}</Text>
                  <Text style={styles.price}>{bus.price} $</Text>
                </View>
                <Text style={styles.busType}>{bus.type}</Text>
                
                <View style={styles.timeContainer}>
                  <View style={styles.timeInfo}>
                    <Text style={styles.time}>{bus.departure}</Text>
                    <Text style={styles.duration}>{bus.duration}</Text>
                    <Text style={styles.time}>{bus.arrival}</Text>
                  </View>
                </View>

                <View style={styles.bottomContainer}>
                  <Text style={[
                    styles.seatsLeft,
                    bus.seatsLeft <= 2 ? styles.seatsWarning : styles.seatsNormal
                  ]}>
                    Quedan {bus.seatsLeft} asientos
                  </Text>
                  <View style={styles.features}>
                    {bus.features.map((feature, index) => (
                      <Ionicons
                        key={index}
                        name={
                          feature === 'wifi' ? 'wifi' :
                          feature === 'ac' ? 'snow' :
                          feature === 'usb' ? 'phone-portrait' :
                          'restaurant'
                        }
                        size={20}
                        color="#64748B"
                        style={styles.featureIcon}
                      />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
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
  routeCard: {
    backgroundColor: '#7B61FF',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#7B61FF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  swapIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  dateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  busListContainer: {
    flex: 1,
    padding: 16,
  },
  busCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ translateY: 0 }],
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyName: {
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
  timeContainer: {
    marginBottom: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
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
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  seatsLeft: {
    fontSize: 14,
    fontWeight: '500',
  },
  seatsNormal: {
    color: '#10B981',
  },
  seatsWarning: {
    color: '#EF4444',
  },
  features: {
    flexDirection: 'row',
    gap: 12,
  },
  featureIcon: {
    opacity: 0.8,
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