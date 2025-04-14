import * as Tooltip from '@radix-ui/react-tooltip';
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
      <Tooltip.Provider>
        <ToastProvider>
          <BlocksProvider>{children}</BlocksProvider>
        </ToastProvider>
      </Tooltip.Provider>
    </AuthProvider>
    // </GoogleOAuthProvider>
  );
};
