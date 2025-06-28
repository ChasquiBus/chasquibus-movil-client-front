export const API_CONFIG = {
    BASE_URL: 'https://chasquibus-back.onrender.com', // URL real del backend
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

export const API_URL = 'http://192.168.1.6:3001'; 