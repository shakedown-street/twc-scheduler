import { BlocksProvider } from './contexts/BlocksContext';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { ToastProvider } from './ui';

export type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    // <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID}>
    <AuthProvider>
      <ToastProvider>
        <BlocksProvider>{children}</BlocksProvider>
      </ToastProvider>
    </AuthProvider>
    // </GoogleOAuthProvider>
  );
};
