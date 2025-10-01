/* eslint-disable react-refresh/only-export-components */

import { UserModel } from '@/api';
import { Loader } from 'lucide-react';
import React from 'react';

export type AuthContextType = {
  getUser: () => Promise<User | undefined>;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  user: User | undefined;
};

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export type AuthProviderProps = {
  children: React.ReactNode;
  initialUser?: User;
};

export const AuthProvider = (props: AuthProviderProps) => {
  const [user, setUser] = React.useState<User | undefined>();
  // userLoading must be set to true initially
  // otherwise refreshing on protected routes will redirect to login
  const [userLoading, setUserLoading] = React.useState(true);

  React.useEffect(() => {
    getUser()
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('impersonate');
        setUser(undefined);
      })
      .finally(() => setUserLoading(false));
  }, []);

  async function getUser() {
    const res = await UserModel.listAction('auth', 'get');
    // A 204 response means the user is not authenticated
    if (res.status === 204) {
      return undefined;
    }
    return res.data;
  }

  if (userLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Loader className="h-8 w-8 animate-spin" />
        <div className="text-muted-foreground">Loading auth...</div>
      </div>
    );
  }

  return (
    <AuthContext
      value={{
        getUser,
        setUser,
        user,
      }}
    >
      {props.children}
    </AuthContext>
  );
};

export const useAuth = () => {
  const context = React.use(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
