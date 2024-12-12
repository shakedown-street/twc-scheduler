import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppProvider } from './AppProvider';
import { routes } from './router';

const router = createBrowserRouter(routes);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
);
