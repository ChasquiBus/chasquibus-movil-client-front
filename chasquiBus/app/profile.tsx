import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [checkingToken, setCheckingToken] = React.useState(true);

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

  if (checkingToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={{ marginTop: 16, color: '#7B61FF', fontWeight: 'bold' }}>Validando sesión...</Text>
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Pantalla de Perfil</Text>
      </View>
    </>
  );
} 