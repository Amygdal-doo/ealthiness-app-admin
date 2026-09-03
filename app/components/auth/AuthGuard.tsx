import React from 'react';
import { AuthProvider } from '~/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}