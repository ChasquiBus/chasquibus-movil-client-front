export const API_CONFIG = {
    // Cambia esta URL según donde esté corriendo tu backend
    // Para desarrollo local: 'http://localhost:3001'
    // Para IP específica: 'http://192.168.1.6:3001'
    // Para producción: 'https://chasquibus-back.onrender.com'
    BASE_URL: 'http://192.168.100.29:3001', // URL del backend en tu red local
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
        },
        USER: {
            PROFILE: '/user/profile',
        },
    },
};

export const getFullUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;

export const API_URL = API_CONFIG.BASE_URL; 