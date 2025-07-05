import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface InstruccionesDeposito {
  banco: string;
  numeroCuenta: string;
  tipoCuenta: string;
  titular: string;
  identificacion: string;
  instrucciones: string;
  monto: string;
  codigoReferencia: string;
}

interface PagoDeposito {
  codigoDeposito: string;
  mensaje: string;
  instrucciones: InstruccionesDeposito;
  venta: {
    id: number;
    totalFinal: string;
    fechaVenta: string;
  };
  pasos: string[];
}

export default function PaginasPagosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [pagoDeposito, setPagoDeposito] = useState<PagoDeposito | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const obtenerDatosDeposito = async () => {
      try {
        // Los datos vienen en los parámetros de la venta
        const ventaData = params.ventaData as string;
        if (!ventaData) {
          console.error('No se proporcionaron datos de venta');
          return;
        }

        const venta = JSON.parse(ventaData);
        const pago = venta.pago;
        
        if (pago && pago.codigoDeposito) {
          setPagoDeposito(pago);
        } else {
          console.error('No se encontraron datos de pago por depósito');
        }
      } catch (error) {
        console.error('Error al procesar datos de depósito:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatosDeposito();
  }, [params.ventaData]);

  const handleAceptar = () => {
    // Redirigir a la sección de boletos
    router.replace('/tickets');
  };

  const handleCancelar = () => {
    setShowCancelModal(true);
  };

  const handleConfirmarCancelacion = () => {
    setShowCancelModal(false);
    // Aquí se implementará la funcionalidad de cancelación
    Alert.alert(
      'Cancelación',
      'La funcionalidad de cancelación se implementará próximamente.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleRechazarCancelacion = () => {
    setShowCancelModal(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando instrucciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pagoDeposito) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>No se pudieron cargar las instrucciones</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#7B61FF', '#9B7BFF']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instrucciones de Pago</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="card-outline" size={48} color="#7B61FF" />
          </View>
          
          <Text style={styles.title}>Depósito Bancario</Text>
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Banco:</Text>
              <Text style={styles.infoValue}>{pagoDeposito.instrucciones.banco}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Número de Cuenta:</Text>
              <Text style={styles.infoValue}>{pagoDeposito.instrucciones.numeroCuenta}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="wallet-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Tipo de Cuenta:</Text>
              <Text style={styles.infoValue}>{pagoDeposito.instrucciones.tipoCuenta}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Titular:</Text>
              <Text style={styles.infoValue}>{pagoDeposito.instrucciones.titular}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="id-card-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Identificación:</Text>
              <Text style={styles.infoValue}>{pagoDeposito.instrucciones.identificacion}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Monto:</Text>
              <Text style={styles.infoValue}>${pagoDeposito.instrucciones.monto}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="barcode-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Código de Referencia:</Text>
              <Text style={styles.infoValue}>{pagoDeposito.instrucciones.codigoReferencia}</Text>
            </View>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Instrucciones:</Text>
            <Text style={styles.instructionsText}>{pagoDeposito.instrucciones.instrucciones}</Text>
          </View>

          <View style={styles.pasosContainer}>
            <Text style={styles.pasosTitle}>Pasos a seguir:</Text>
            {pagoDeposito.pasos.map((paso, index) => (
              <View key={index} style={styles.pasoItem}>
                <Text style={styles.pasoText}>{paso}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAceptar}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancelar}
          >
            <Ionicons name="close-circle-outline" size={20} color="#FF6B6B" />
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de confirmación de cancelación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCancelModal}
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="help-circle-outline" size={48} color="#FF6B6B" />
            <Text style={styles.modalTitle}>¿Estás seguro?</Text>
            <Text style={styles.modalText}>
              ¿Realmente deseas cancelar esta transacción?
            </Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleRechazarCancelacion}
              >
                <Text style={styles.modalCancelButtonText}>No</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleConfirmarCancelacion}
              >
                <Text style={styles.modalConfirmButtonText}>Sí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 12,
    marginRight: 8,
    minWidth: 120,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7B61FF',
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  pasosContainer: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  pasosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  pasoItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  pasoText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  acceptButton: {
    backgroundColor: '#7B61FF',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#FF6B6B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 80,
  },
  modalCancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  modalConfirmButton: {
    backgroundColor: '#FF6B6B',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
}); 