import { GoogleOAuthProvider } from '@react-oauth/google';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './features/auth/contexts/AuthContext';

export type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <ScheduleProvider>{children}</ScheduleProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};
