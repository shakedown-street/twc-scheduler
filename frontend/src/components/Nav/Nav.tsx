import logo from '@/assets/logo.avif';
import { ImpersonateDialog } from '@/features/auth/components/ImpersonateDialog/ImpersonateDialog';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { http } from '@/http';
import { Button, Container, IconButton, RadixDialog, useToast } from '@/ui';
import clsx from 'clsx';
import { IdCard, LogOut, Settings, User } from 'lucide-react';
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { SettingsDialog } from '../SettingsDialog/SettingsDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import './Nav.scss';

export const Nav = () => {
  const [impersonateDialogOpen, setImpersonateDialogOpen] = React.useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);

  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const toast = useToast();

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
          {/* <Button color="primary" navigateTo={'/sign-up'}>
            Sign Up
          </Button> */}
          <Button color="primary" navigateTo={'/login'}>
            Login
          </Button>
        </div>
      </>
    );
  }

  function renderUserMenu() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton>
            <span className="material-symbols-outlined">menu</span>
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User />
            Profile
          </DropdownMenuItem>
          {user?.is_superuser && (
            <DropdownMenuItem onClick={() => setImpersonateDialogOpen(true)}>
              <IdCard />
              Impersonate
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setSettingsDialogOpen(true)}>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
            {user && (
              <div className="Nav__links">
                <NavLink
                  to="/"
                  className={({ isActive }) => {
                    return clsx('Nav__link', {
                      'Nav__link--active': isActive,
                    });
                  }}
                >
                  <span className="material-symbols-outlined">edit_calendar</span>
                  Schedule
                </NavLink>
                <NavLink
                  to="/overview"
                  className={({ isActive }) => {
                    return clsx('Nav__link', {
                      'Nav__link--active': isActive,
                    });
                  }}
                >
                  <span className="material-symbols-outlined">overview</span>
                  Overview
                </NavLink>
                <NavLink
                  to="/availability"
                  className={({ isActive }) => {
                    return clsx('Nav__link', {
                      'Nav__link--active': isActive,
                    });
                  }}
                >
                  <span className="material-symbols-outlined">event_available</span>
                  Availability
                </NavLink>
                <NavLink
                  to="/sub-list"
                  className={({ isActive }) => {
                    return clsx('Nav__link', {
                      'Nav__link--active': isActive,
                    });
                  }}
                >
                  <span className="material-symbols-outlined">swap_horiz</span>
                  Sub List
                </NavLink>
              </div>
            )}
            {/* <div className="Nav__spacer"></div> */}
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
      <RadixDialog
        description="Change your settings"
        open={settingsDialogOpen}
        onOpenChange={(open) => setSettingsDialogOpen(open)}
        title="Settings"
      >
        <SettingsDialog onClose={() => setSettingsDialogOpen(false)} />
      </RadixDialog>
    </>
  );
};
