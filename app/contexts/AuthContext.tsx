import React, { createContext, useContext } from 'react';
import { useCurrentUser } from '~/hooks/useAuthApi';
import { clientTokens } from '~/lib/auth/client-cookies';
import type { User } from '~/lib/auth/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading, error } = useCurrentUser();
  
  // Only show loading if we have tokens but are fetching user data
  const hasTokens = !!clientTokens.get();
  const shouldShowLoading = hasTokens && isLoading && user === undefined;

  const value: AuthContextType = {
    user: error ? null : (user || null),
    isAuthenticated: !!user && !error,
    isLoading: shouldShowLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}