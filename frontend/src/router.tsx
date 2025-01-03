import { Navigate, RouteObject } from 'react-router-dom';
import { App } from './App';
import { useAuth } from './features/auth/contexts/AuthContext';
import { Login } from './features/auth/routes/Login/Login';
import { PasswordReset } from './features/auth/routes/PasswordReset/PasswordReset';
import { PasswordResetConfirm } from './features/auth/routes/PasswordResetConfirm/PasswordResetConfirm';
import { Profile } from './features/auth/routes/Profile/Profile';
import { SignUp } from './features/auth/routes/SignUp/SignUp';
import { VerifyEmail } from './features/auth/routes/VerifyEmail/VerifyEmail';
import { Checkout } from './features/payments/routes/Checkout/Checkout';
import { CheckoutSuccess } from './features/payments/routes/CheckoutSuccess/CheckoutSuccess';
import { ClientAvailability } from './routes/ClientAvailability/ClientAvailability';
import { Home } from './routes/Home/Home';
import { NotFound } from './routes/NotFound/NotFound';
import { Sheet1 } from './routes/Sheet1/Sheet1';
import { StyleGuide } from './routes/StyleGuide/StyleGuide';
import { TechAvailability } from './routes/TechAvailability/TechAvailability';

export type AuthGuardProps = {
  children: React.ReactNode;
  requireSubscription?: boolean;
};

export const AuthGuard = ({ children, requireSubscription = false }: AuthGuardProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireSubscription && !user.is_subscribed) {
    return <Navigate to="/checkout" />;
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
      {
        path: '/password-reset',
        element: <PasswordReset />,
      },
      {
        path: '/password-reset/:uid/:token',
        element: <PasswordResetConfirm />,
      },
      {
        path: '/style-guide',
        element: <StyleGuide />,
      },
      {
        path: '/sign-up',
        element: <SignUp />,
      },
      {
        path: '/verify-email/:uid/:token',
        element: <VerifyEmail />,
      },
      {
        path: '/',
        element: (
          <AuthGuard>
            <Home />
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
        path: '/checkout',
        element: (
          <AuthGuard>
            <Checkout />
          </AuthGuard>
        ),
      },
      {
        path: '/checkout/success',
        element: (
          <AuthGuard>
            <CheckoutSuccess />
          </AuthGuard>
        ),
      },
      {
        path: '/sheet1',
        element: (
          <AuthGuard>
            <Sheet1 />
          </AuthGuard>
        ),
      },
      {
        path: '/client-availability',
        element: (
          <AuthGuard>
            <ClientAvailability />
          </AuthGuard>
        ),
      },
      {
        path: '/tech-availability',
        element: (
          <AuthGuard>
            <TechAvailability />
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
