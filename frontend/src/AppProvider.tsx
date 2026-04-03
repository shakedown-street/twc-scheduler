import { ScheduleProvider } from './contexts/ScheduleContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './features/auth/contexts/AuthContext';

export type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ScheduleProvider>{children}</ScheduleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
