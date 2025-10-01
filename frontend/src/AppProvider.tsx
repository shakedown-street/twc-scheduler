import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
export type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID}>
      <AuthProvider>
        <ScheduleProvider>{children}</ScheduleProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};
