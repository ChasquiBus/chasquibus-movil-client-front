import { Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function ProfileScreen() {
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Pantalla de Perfil</Text>
      </View>
    </>
  );
} 