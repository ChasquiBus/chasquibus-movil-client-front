import { Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function TicketsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mis Tickets',
          headerStyle: {
            backgroundColor: '#E6F0FF',
          },
          headerShadowVisible: false,
          headerTintColor: '#0F172A',
        }}
      />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Pantalla de Tickets</Text>
      </View>
    </>
  );
} 