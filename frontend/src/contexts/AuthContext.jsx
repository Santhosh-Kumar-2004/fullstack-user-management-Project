// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getAllUsers } from '../api/api';
import 'jwt-decode';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    // useEffect(() => {
    //     const token = localStorage.getItem("token");
      
    //     if (token) {
    //       try {
    //         const decoded = jwtDecode(token);
    //         setUser({
    //           name: decoded.name,
    //           email: decoded.sub,
    //           role: decoded.role,
    //           user_id: decoded.user_id
    //         });
    //       } catch (err) {
    //         console.error("Failed to decode token", err);
    //         setUser(null);
    //       }
    //     }
    //   }, []);
      

    const login = async (email, password) => {
        try {
            const response = await loginUser({ email, password });
            const token = response.access_token;
            console.log("Token received from backend:", token);

            setToken(token);
            localStorage.setItem('token', token);

            const decoded = jwtDecode(token);
            console.log("Decoded user:", decoded);

            // setUser({
            //     name: decoded.name,
            //     email: decoded.sub,
            //     role: decoded.role,
            //     user_id: decoded.user_id
            // });

            return { success: true };
        } catch (err) {
            console.error('Login failed:', err.response?.data || err.message);
            return { success: false, message: err.response?.data?.detail || 'Login failed' };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await registerUser({ name, email, password });
            const token = response.access_token;
            console.log("Token received from backend:", token);

            setToken(token);
            localStorage.setItem('token', token);

            return { success: true };
        } catch (err) {
            console.error('Register failed:', err.response?.data || err.message);
            return { success: false, message: err.response?.data?.detail || 'Register failed' };
        }
    };

    const allUsers = async () => {
        try {
            const response = await getAllUsers();
            console.log("All users data:", response);
            return response; // no .data here if api already returns data
        } catch (err) {
            console.error('Getting All users failed:', err.response?.data || err.message);
            return { success: false, message: err.response?.data?.detail || 'GettingAll failed' };
        }
    };

    const logout = () => {
        setToken('');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, register, allUsers }}>
            {children}
        </AuthContext.Provider>
    );
};
