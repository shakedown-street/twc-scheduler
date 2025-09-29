import { BlocksProvider } from './contexts/BlocksContext';
import { AuthProvider } from './features/auth/contexts/AuthContext';

export type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    // <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID}>
    <AuthProvider>
      <BlocksProvider>{children}</BlocksProvider>
    </AuthProvider>
    // </GoogleOAuthProvider>
  );
};
