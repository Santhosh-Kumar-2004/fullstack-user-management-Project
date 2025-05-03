import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/home" replace /> : children; //Replaec keyword is Delete/ to replaces the current history
};

export default PublicRoute;
