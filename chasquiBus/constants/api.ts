export const API_CONFIG = {
    BASE_URL: 'https://api.chasquibus.com', // Reemplazar con la URL real del backend
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