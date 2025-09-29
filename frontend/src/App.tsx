import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Nav } from './components/Nav/Nav';
import { ImpersonationWarning } from './features/auth/components/ImpersonationWarning/ImpersonationWarning';
import './index.css';
import './index.scss';

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
