import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TicketsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Próximamente: Mis Tickets</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 18,
    color: '#7B61FF',
    fontWeight: '600',
  },
}); 