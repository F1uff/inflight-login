import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function RoleBasedRedirect() {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // No token means user is not logged in - redirect to login page
  if (!token) {
    return <Navigate to="/" />;
  }
  
  try {
    // Get user role from token
    const { role } = jwtDecode(token);

    // Send user to appropriate dashboard based on role
    if (role === 'admin') return <Navigate to="/dashboard/admin" />;
    if (role === 'user') return <Navigate to="/dashboard/user" />;

    // Show error message for unknown roles
    return <div>Unknown role</div>;
  } catch (error) {
    // Handle invalid token by clearing it and redirecting to login
    localStorage.removeItem('token');
    return <Navigate to="/" />;
  }
}

export default RoleBasedRedirect;
