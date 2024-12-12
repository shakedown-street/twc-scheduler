import * as Tooltip from '@radix-ui/react-tooltip';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { ToastProvider } from './ui';

export type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID}>
      <AuthProvider>
        <Tooltip.Provider>
          <ToastProvider>{children}</ToastProvider>
        </Tooltip.Provider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};
