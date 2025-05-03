import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />; //Replaec keyword is Delete/ to replaces the current history
};

export default PrivateRoute;
