import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SeatProps {
  id: string;
  status: 'available' | 'reserved' | 'selected';
  onSelect: (id: string) => void;
}

interface SeatSelectionProps {
  seats: Array<{
    id: string;
    status: 'available' | 'reserved' | 'selected';
  }>;
  onSeatSelect: (seatId: string) => void;
  selectedFloor: 'lower' | 'upper';
  onFloorChange: (floor: 'lower' | 'upper') => void;
}

const Seat: React.FC<SeatProps> = ({ id, status, onSelect }) => {
  const getColor = () => {
    switch (status) {
      case 'available':
        return '#F8FAFC';
      case 'reserved':
        return '#FEE2E2';
      case 'selected':
        return '#7B61FF';
      default:
        return '#F8FAFC';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'available':
        return '#E2E8F0';
      case 'reserved':
        return '#FCA5A5';
      case 'selected':
        return '#7B61FF';
      default:
        return '#E2E8F0';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => status === 'available' && onSelect(id)}
      style={[
        styles.seat,
        {
          backgroundColor: getColor(),
          borderColor: getBorderColor(),
        }
      ]}
      disabled={status === 'reserved'}
    >
      <MaterialCommunityIcons 
        name="seat" 
        size={20} 
        color={status === 'selected' ? '#FFFFFF' : status === 'reserved' ? '#EF4444' : '#64748B'} 
      />
      <Text style={[
        styles.seatNumber,
        { color: status === 'selected' ? '#FFFFFF' : '#64748B' }
      ]}>{id}</Text>
    </TouchableOpacity>
  );
};

const SeatSelection: React.FC<SeatSelectionProps> = ({ 
  seats, 
  onSeatSelect,
  selectedFloor,
  onFloorChange
}) => {
  // Organizar los asientos en filas de 4 (2 a cada lado del pasillo)
  const rows = [];
  for (let i = 0; i < seats.length; i += 4) {
    rows.push(seats.slice(i, i + 4));
  }

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]} />
          <Text style={styles.legendText}>Disponible</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]} />
          <Text style={styles.legendText}>Reservado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#7B61FF', borderColor: '#7B61FF' }]} />
          <Text style={styles.legendText}>Tu asiento</Text>
        </View>
      </View>

      {/* Floor Selection Buttons */}
      <View style={styles.floorSelection}>
        <TouchableOpacity
          style={[
            styles.floorButton,
            selectedFloor === 'lower' && styles.floorButtonActive
          ]}
          onPress={() => onFloorChange('lower')}
        >
          <Text style={[
            styles.floorButtonText,
            selectedFloor === 'lower' && styles.floorButtonTextActive
          ]}>Parte inferior</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.floorButton,
            selectedFloor === 'upper' && styles.floorButtonActive
          ]}
          onPress={() => onFloorChange('upper')}
        >
          <Text style={[
            styles.floorButtonText,
            selectedFloor === 'upper' && styles.floorButtonTextActive
          ]}>Parte superior</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.busLayout}>
          {/* Frente del bus */}
          <View style={styles.busFront}>
            <MaterialCommunityIcons name="steering" size={24} color="#64748B" />
            <Text style={styles.frontText}>Frente</Text>
          </View>

          {/* Asientos */}
          <View style={styles.seatsContainer}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {/* Asientos izquierdos */}
                <View style={styles.sideSeats}>
                  {row.slice(0, 2).map((seat) => (
                    <Seat
                      key={seat.id}
                      id={seat.id}
                      status={seat.status}
                      onSelect={onSeatSelect}
                    />
                  ))}
                </View>

                {/* Pasillo */}
                <View style={styles.aisle} />

                {/* Asientos derechos */}
                <View style={styles.sideSeats}>
                  {row.slice(2, 4).map((seat) => (
                    <Seat
                      key={seat.id}
                      id={seat.id}
                      status={seat.status}
                      onSelect={onSeatSelect}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  busLayout: {
    alignItems: 'center',
    paddingVertical: 16,
    minHeight: height * 0.5, // Asegura que el contenido ocupe al menos la mitad de la pantalla
  },
  busFront: {
    alignItems: 'center',
    marginBottom: 20,
  },
  frontText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  seatsContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sideSeats: {
    flexDirection: 'row',
    gap: 8,
  },
  aisle: {
    width: 20,
  },
  seat: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  seatNumber: {
    fontSize: 10,
    marginTop: -4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 14,
    color: '#64748B',
  },
  floorSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 4,
  },
  floorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  floorButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  floorButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  floorButtonTextActive: {
    color: '#7B61FF',
    fontWeight: '600',
  },
});

export default SeatSelection; 