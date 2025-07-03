import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';

export default function PaymentScreen() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const handleLogout = () => {
    setShowMenu(false);
    router.replace('/(auth)/login');
  };

  const handleViewReservations = () => {
    setShowMenu(false);
    router.push('/tickets');
  };

  const handlePayment = async () => {
    try {
      // Aquí deberías armar el objeto ventaPayload con los datos reales
      const ventaPayload = {
        cooperativaId: 8, // <-- reemplaza por el valor real
        metodoPagoId: 3, // <-- reemplaza por el valor real
        hojaTrabajoId: 21, // <-- reemplaza por el valor real
        estadoPago: 'PENDIENTE',
        busId: 50, // <-- reemplaza por el valor real
        tipoVenta: 'online',
        posiciones: [
          { numeroAsiento: 1, tipoAsiento: 'NORMAL' },
          { numeroAsiento: 2, tipoAsiento: 'NORMAL' }
        ],
        boletos: [
          {
            numeroAsiento: 1,
            tarifaId: 101,
            cedula: '1234567890',
            nombre: 'Juan Perez'
          },
          {
            numeroAsiento: 2,
            tarifaId: 101,
            cedula: '0987654321',
            nombre: 'Maria Lopez'
          }
        ]
      };
      // POST al backend
      const res = await fetch('https://tu-backend.com/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaPayload)
      });
      if (!res.ok) throw new Error('Error al crear la venta');
      const venta = await res.json();
      // Navega a success pasando la venta y boletos
      router.replace({ pathname: '/success', params: { venta: JSON.stringify(venta) } });
    } catch (e) {
      Alert.alert('Error', 'No se pudo completar la venta. Intenta de nuevo.');
    }
  };

  const formatCardNumber = (text: string) => {
    // Remove any spaces and non-digits
    const cleaned = text.replace(/\s+/g, '').replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted;
  };

  const renderMonthPicker = () => (
    <Modal
      visible={showMonthPicker}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowMonthPicker(false)}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={() => setShowMonthPicker(false)}
      >
        <View style={styles.pickerContainer}>
          <ThemedText style={styles.pickerTitle}>Seleccionar Mes</ThemedText>
          <ScrollView>
            {Array.from({ length: 12 }, (_, i) => {
              const month = (i + 1).toString().padStart(2, '0');
              return (
                <Pressable
                  key={month}
                  style={styles.pickerItem}
                  onPress={() => {
                    setExpiryMonth(month);
                    setShowMonthPicker(false);
                  }}
                >
                  <ThemedText style={styles.pickerItemText}>{month}</ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  const renderYearPicker = () => (
    <Modal
      visible={showYearPicker}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowYearPicker(false)}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={() => setShowYearPicker(false)}
      >
        <View style={styles.pickerContainer}>
          <ThemedText style={styles.pickerTitle}>Seleccionar Año</ThemedText>
          <ScrollView>
            {Array.from({ length: 10 }, (_, i) => {
              const year = (new Date().getFullYear() + i).toString();
              return (
                <Pressable
                  key={year}
                  style={styles.pickerItem}
                  onPress={() => {
                    setExpiryYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  <ThemedText style={styles.pickerItemText}>{year}</ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

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
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
            </Pressable>
            <ThemedText style={styles.headerTitle}>Método de Pago</ThemedText>
            <View style={styles.notificationIcon}>
              <Ionicons name="notifications-outline" size={24} color="#0F172A" />
            </View>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.userInfo}>
              <Pressable onPress={() => setShowMenu(!showMenu)}>
                <Image
                  source={require('../assets/images/avatar.png')}
                  style={styles.avatar}
                />
              </Pressable>
              <View>
                <ThemedText style={styles.greeting}>Hola Saduni Silva!</ThemedText>
                <ThemedText style={styles.subtitle}>Elige tu asiento</ThemedText>
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
                  top: 120,
                  left: 16,
                }]}>
                  <Pressable 
                    style={styles.menuItem}
                    onPress={handleViewReservations}
                  >
                    <Ionicons name="ticket-outline" size={20} color="#0F172A" />
                    <Text style={styles.menuItemText}>Mis Reservas</Text>
                  </Pressable>
                  
                  <View style={styles.menuDivider} />
                  
                  <Pressable 
                    style={styles.menuItem}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={[styles.menuItemText, styles.logoutText]}>
                      Cerrar Sesión
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>

            <View style={styles.tripCard}>
              <ThemedText style={styles.busName}>El Dorado</ThemedText>
              <View style={styles.tripDetails}>
                <ThemedText style={styles.busType}>A/C Sleeper (2+2)</ThemedText>
                <ThemedText style={styles.tripTime}>9:00 AM — 9:45 AM</ThemedText>
              </View>
              <View style={styles.busIconContainer}>
                <Ionicons name="bus-outline" size={32} color="#FFFFFF" style={{ transform: [{ scaleX: -1 }] }} />
              </View>
            </View>

            <View style={styles.paymentContainer}>
              <View style={styles.paymentCard}>
                <ThemedText style={styles.paymentTitle}>
                  Detalles de la tarjeta de crédito
                </ThemedText>

                <View style={styles.paymentMethodContainer}>
                  <ThemedText style={styles.inputLabel}>Método de pago</ThemedText>
                  <View style={styles.cardTypesContainer}>
                    <Image 
                      source={require('../assets/images/mastercard.png')} 
                      style={styles.cardTypeIcon} 
                    />
                    <Image 
                      source={require('../assets/images/visa.png')} 
                      style={styles.cardTypeIcon} 
                    />
                    <Image 
                      source={require('../assets/images/amex.png')} 
                      style={styles.cardTypeIcon} 
                    />
                    <Image 
                      source={require('../assets/images/discover.png')} 
                      style={styles.cardTypeIcon} 
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Nombre en la tarjeta</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#64748B"
                    value={cardName}
                    onChangeText={setCardName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Número de tarjeta</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor="#64748B"
                    value={cardNumber}
                    onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 2 }]}>
                    <ThemedText style={styles.inputLabel}>Fecha de expiración</ThemedText>
                    <View style={styles.expiryContainer}>
                      <Pressable
                        style={[styles.expiryInput, { marginRight: 8 }]}
                        onPress={() => setShowMonthPicker(true)}
                      >
                        <ThemedText style={styles.expiryText}>
                          {expiryMonth || 'MM'}
                        </ThemedText>
                        <Ionicons name="chevron-down" size={20} color="#64748B" />
                      </Pressable>
                      <Pressable
                        style={styles.expiryInput}
                        onPress={() => setShowYearPicker(true)}
                      >
                        <ThemedText style={styles.expiryText}>
                          {expiryYear || 'YYYY'}
                        </ThemedText>
                        <Ionicons name="chevron-down" size={20} color="#64748B" />
                      </Pressable>
                    </View>
                  </View>

                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <ThemedText style={styles.inputLabel}>CVV</ThemedText>
                    <View style={styles.cvvContainer}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="123"
                        placeholderTextColor="#64748B"
                        value={cvv}
                        onChangeText={setCvv}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                      <Pressable style={styles.cvvInfo}>
                        <Ionicons name="information-circle-outline" size={24} color="#64748B" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.totalContainer}>
                <View style={styles.totalRow}>
                  <ThemedText style={styles.totalLabel}>Total a pagar</ThemedText>
                  <ThemedText style={styles.totalAmount}>8 $</ThemedText>
                </View>
              </View>

              <Pressable
                style={[
                  styles.payButton,
                  (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) && styles.payButtonDisabled
                ]}
                onPress={handlePayment}
                disabled={!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv}
              >
                <Text style={styles.payButtonText}>
                  Pagar ahora
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {renderMonthPicker()}
          {renderYearPicker()}

          {/* Bottom Navigation Bar */}
          <View style={styles.bottomNav}>
            <Pressable 
              style={[styles.navItem]} 
              onPress={() => router.push('/')}
            >
              <View style={styles.navIconContainer}>
                <Ionicons name="home-outline" size={24} color="#FFFFFF" />
              </View>
            </Pressable>
            <Pressable 
              style={[styles.navItem]} 
              onPress={() => router.push('/tickets')}
            >
              <View style={[styles.navIconContainer, styles.activeNavItem]}>
                <Ionicons name="ticket-outline" size={24} color="#FFFFFF" />
              </View>
            </Pressable>
            <Pressable 
              style={[styles.navItem]} 
              onPress={() => router.push('/profile')}
            >
              <View style={styles.navIconContainer}>
                <Ionicons name="person-outline" size={24} color="#FFFFFF" />
              </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  notificationIcon: {
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
  scrollView: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#7B61FF',
    marginTop: 4,
  },
  tripCard: {
    backgroundColor: '#7B61FF',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  busName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tripDetails: {
    marginTop: 8,
  },
  busType: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tripTime: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  busIconContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -16 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 20,
  },
  paymentMethodContainer: {
    marginBottom: 20,
  },
  cardTypesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTypeIcon: {
    width: 40,
    height: 25,
    marginRight: 12,
    resizeMode: 'contain',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  expiryContainer: {
    flexDirection: 'row',
  },
  expiryInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expiryText: {
    fontSize: 16,
    color: '#64748B',
  },
  cvvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvvInfo: {
    marginLeft: 8,
  },
  totalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  totalAmount: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#7B61FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    marginTop: 20,
    marginBottom: 20,
  },
  payButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  pickerTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#5B41FF',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNavItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ scale: 1.1 }],
  },
}); 