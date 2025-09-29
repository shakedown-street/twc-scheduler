import { Outlet } from 'react-router';
import { Nav } from './components/Nav/Nav';
import { Toaster } from './components/ui/sonner';
import { ImpersonationWarning } from './features/auth/components/ImpersonationWarning/ImpersonationWarning';

export const App = () => {
  return (
    <>
      <title>Schedule Builder</title>
      <meta property="og:title" content="Schedule Builder" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Schedule Builder" />
      <Toaster />
      <Nav />
      <Outlet />
      <ImpersonationWarning />
    </>
  );
};
