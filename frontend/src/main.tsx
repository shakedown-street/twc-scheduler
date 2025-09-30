// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from './AppProvider';
import './index.css';
import { routes } from './router';

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>,
  //</StrictMode>,
);
