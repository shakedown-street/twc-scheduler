import { Navigate, RouteObject } from 'react-router-dom';
import { App } from './App';
import { useAuth } from './features/auth/contexts/AuthContext';
import { Login } from './features/auth/routes/Login/Login';
import { Profile } from './features/auth/routes/Profile/Profile';
import { AvailabilityRoute } from './routes/AvailabilityRoute/AvailabilityRoute';
import { NotFound } from './routes/NotFound/NotFound';
import { Overview } from './routes/Overview/Overview';
import { Schedule } from './routes/Schedule/Schedule';
import { StyleGuide } from './routes/StyleGuide/StyleGuide';
import { SubList } from './routes/SubList/SubList';

export type AuthGuardProps = {
  children: React.ReactNode;
};

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      // {
      //   path: '/password-reset',
      //   element: <PasswordReset />,
      // },
      // {
      //   path: '/password-reset/:uid/:token',
      //   element: <PasswordResetConfirm />,
      // },
      {
        path: '/style-guide',
        element: <StyleGuide />,
      },
      // {
      //   path: '/sign-up',
      //   element: <SignUp />,
      // },
      // {
      //   path: '/verify-email/:uid/:token',
      //   element: <VerifyEmail />,
      // },
      {
        path: '/',
        element: (
          <AuthGuard>
            <Schedule />
          </AuthGuard>
        ),
      },
      {
        path: '/profile',
        element: (
          <AuthGuard>
            <Profile />
          </AuthGuard>
        ),
      },
      {
        path: '/overview',
        element: (
          <AuthGuard>
            <Overview />
          </AuthGuard>
        ),
      },
      {
        path: '/availability',
        element: (
          <AuthGuard>
            <AvailabilityRoute />
          </AuthGuard>
        ),
      },
      {
        path: '/sub-list',
        element: (
          <AuthGuard>
            <SubList />
          </AuthGuard>
        ),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
