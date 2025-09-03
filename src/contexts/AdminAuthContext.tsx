import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  permissions: string[];
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  sessionToken: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      const storedToken = localStorage.getItem('admin_session_token');
      if (storedToken) {
        setSessionToken(storedToken);
        const isValid = await verifyStoredSession(storedToken);
        if (!isValid) {
          localStorage.removeItem('admin_session_token');
          setSessionToken(null);
        }
      }
      setIsLoading(false);
    };

    loadSession();
  }, []);

  const verifyStoredSession = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'verify',
          session_token: token,
        },
      });

      if (error) {
        console.error('Session verification failed:', error);
        return false;
      }

      if (data?.success) {
        setAdmin(data.admin);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session verification failed:', error);
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'login',
          username,
          password,
        },
      });

      if (error) {
        console.error('Login failed:', error);
        return { success: false, error: 'Login failed. Please try again.' };
      }

      if (data?.success) {
        setAdmin(data.admin);
        setSessionToken(data.session_token);
        localStorage.setItem('admin_session_token', data.session_token);
        return { success: true };
      } else {
        return { success: false, error: data?.error || data?.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (sessionToken) {
        await supabase.functions.invoke('admin-auth', {
          body: {
            action: 'logout',
            session_token: sessionToken,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
      setSessionToken(null);
      localStorage.removeItem('admin_session_token');
    }
  };

  const verifySession = async (): Promise<boolean> => {
    if (!sessionToken) return false;
    return await verifyStoredSession(sessionToken);
  };

  const value: AdminAuthContextType = {
    admin,
    sessionToken,
    login,
    logout,
    verifySession,
    isLoading
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};