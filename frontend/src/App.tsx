import { Helmet } from 'react-helmet';
import { Outlet } from 'react-router-dom';
import { Nav } from './components/Nav/Nav';
import { ImpersonationWarning } from './features/auth/components/ImpersonationWarning/ImpersonationWarning';
import './index.scss';
import './index.css';
import { Toaster } from './ui';

export const App = () => {
  return (
    <>
      <Helmet>
        <title>Schedule Builder</title>
        <meta property="og:title" content="Schedule Builder" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Schedule Builder" />
      </Helmet>
      <Toaster />
      <Nav />
      <Outlet />
      <ImpersonationWarning />
    </>
  );
};
