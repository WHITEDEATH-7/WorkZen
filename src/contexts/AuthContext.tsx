import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import api from '@/lib/api';
import { verifyPassword } from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (loginIdOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (loginIdOrEmail: string, password: string) => {
    try {
      // Trim and normalize input
      const normalizedInput = loginIdOrEmail.trim().toLowerCase();
      const normalizedPassword = password.trim();
      
      console.log('🔐 Login Attempt:', { 
        loginIdOrEmail: loginIdOrEmail.trim(), 
        passwordLength: normalizedPassword.length 
      });
      
      // Query all users to find matching login_id or email
      const response = await api.get('/users');

      const users = response.data;
      console.log('👥 Total users found:', users.length);
      console.log('All user emails:', users.map((u: User) => u.email));
      
      const foundUser = users.find(
        (u: User) => {
          const userEmail = (u.email || '').toLowerCase().trim();
          const userLoginId = (u.login_id || '').toLowerCase().trim();
          return userEmail === normalizedInput || userLoginId === normalizedInput;
        }
      );

      if (!foundUser) {
        console.error('❌ User not found with:', loginIdOrEmail);
        console.error('Searched for:', normalizedInput);
        return { success: false, error: 'Invalid credentials - User not found' };
      }

      console.log('✅ User found:', foundUser.email, '| Role:', foundUser.role);

      // Verify password
      const passwordMatch = verifyPassword(normalizedPassword, foundUser.password_hash);
      console.log('🔑 Password verification:', passwordMatch ? 'SUCCESS' : 'FAILED');
      console.log('Expected hash:', foundUser.password_hash);
      console.log('Provided password:', normalizedPassword);
      
      if (!passwordMatch) {
        return { success: false, error: 'Invalid credentials - Incorrect password' };
      }

      // Store user and token
      localStorage.setItem('user', JSON.stringify(foundUser));
      localStorage.setItem('auth_token', `mock_token_${foundUser.id}`);
      setUser(foundUser);

      console.log('🎉 Login successful!');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { success: false, error: 'An error occurred during sign in' };
    }
  };

  const signOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
