import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BillingSessionModel } from '~/api';
import logo from '~/assets/logo.avif';
import { ImpersonateDialog } from '~/features/auth/components/ImpersonateDialog/ImpersonateDialog';
import { useAuth } from '~/features/auth/contexts/AuthContext';
import { http } from '~/http';
import { Button, Container, IconButton, RadixDialog, RadixPopover, useToast } from '~/ui';
import './Nav.scss';

export const Nav = () => {
  const [impersonateDialogOpen, setImpersonateDialogOpen] = React.useState(false);

  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const toast = useToast();

  function openBilling() {
    BillingSessionModel.create({})
      .then((session) => {
        window.open(session.data.url, '_blank');
      })
      .catch((err) => toast.errorResponse(err));
  }

  function logout() {
    http
      .post('/api/token-auth/logout/')
      .then()
      .catch((err) => toast.errorResponse(err))
      .finally(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('impersonate');
        setUser(undefined);
        navigate('/login');
      });
  }

  function renderAuthLinks() {
    return (
      <>
        <div className="flex gap-2">
          <Button color="primary" navigateTo={'/sign-up'}>
            Sign Up
          </Button>
          <Button color="primary" navigateTo={'/login'}>
            Login
          </Button>
        </div>
      </>
    );
  }

  function renderUserMenu() {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <IconButton>
            <span className="material-symbols-outlined">menu</span>
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" className="DropdownMenu__content">
            <DropdownMenu.Item className="DropdownMenu__item" onClick={() => navigate('/profile')}>
              <div className="DropdownMenu__icon">
                <span className="material-symbols-outlined">person</span>
              </div>
              Profile
            </DropdownMenu.Item>
            {/*
              NOTE: If you know the project is using stripe, you can remove this
              condition and just always show the billing link.
            */}
            {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && (
              <DropdownMenu.Item className="DropdownMenu__item" onClick={() => openBilling()}>
                <div className="DropdownMenu__icon">
                  <span className="material-symbols-outlined">credit_card</span>
                </div>
                Billing
              </DropdownMenu.Item>
            )}
            {user?.is_superuser && (
              <DropdownMenu.Item className="DropdownMenu__item" onClick={() => setImpersonateDialogOpen(true)}>
                <div className="DropdownMenu__icon">
                  <span className="material-symbols-outlined">id_card</span>
                </div>
                Impersonate
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item className="DropdownMenu__item" onClick={() => logout()}>
              <div className="DropdownMenu__icon">
                <span className="material-symbols-outlined">logout</span>
              </div>
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  return (
    <>
      <div className="Nav">
        <Container>
          <div className="Nav__content">
            <Link to="/">
              <img className="Nav__logo" src={logo} />
            </Link>
            <Button navigateTo="/" size="sm">
              Schedule
            </Button>
            <Button navigateTo="/overview" size="sm">
              Overview
            </Button>
            <RadixPopover align="start" close={false} trigger={<Button size="sm">Availability</Button>}>
              <div className="p-2">
                <ul>
                  <li>
                    <Button fluid navigateTo="/client-availability" size="xs" style={{ textAlign: 'left' }}>
                      Clients
                    </Button>
                  </li>
                  <li>
                    <Button fluid navigateTo="/tech-availability" size="xs" style={{ textAlign: 'left' }}>
                      Technicians
                    </Button>
                  </li>
                </ul>
              </div>
            </RadixPopover>
            <div className="Nav__spacer"></div>
            {!user ? renderAuthLinks() : renderUserMenu()}
          </div>
        </Container>
      </div>
      <RadixDialog
        description="Impersonate another user"
        open={impersonateDialogOpen}
        onOpenChange={(open) => setImpersonateDialogOpen(open)}
        title="Impersonate"
      >
        <ImpersonateDialog />
      </RadixDialog>
    </>
  );
};
