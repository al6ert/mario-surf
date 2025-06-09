import React from 'react';
import App from '../components/App';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <App />
    </ProtectedRoute>
  );
} 