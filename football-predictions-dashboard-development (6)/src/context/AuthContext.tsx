import React, { createContext, useContext, useState } from 'react';

export type UserPlan = 'none' | 'free' | 'premium';

export interface User {
  name: string;
  email: string;
  plan: UserPlan;
  joinDate: string;
  avatar: string;
  country: string;
  bio: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, plan: UserPlan) => void;
  logout: () => void;
  upgrade: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, plan: UserPlan) => {
    setUser({
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      plan,
      joinDate: new Date().toISOString(),
      avatar: '',
      country: 'United Kingdom',
      bio: 'Football betting enthusiast. Always looking for value picks.',
      notifications: { email: true, sms: false, push: true },
    });
  };

  const logout = () => {
    setUser(null);
  };

  const upgrade = () => {
    if (user) {
      setUser({ ...user, plan: 'premium' });
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, upgrade, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
