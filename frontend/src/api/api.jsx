// axiosClient.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/User_Management',  // Basic url for accessing the backedn fastAPI
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token to requests
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token'); // Or however you store the token
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   });

//login user
export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/login', credentials);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
    }
};

//rehister user
export const registerUser = async (credentials) => {
    try {
        const response = await api.post('/register', credentials);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
    }
};

//getting all the users
export const getAllUsers = async () => {
        try {
            const response = await api.get('/');
            return response.data;
        } catch (error) {
            console.error('Get all users error:', error);
            throw error;
        }
    };
  

export default api;
