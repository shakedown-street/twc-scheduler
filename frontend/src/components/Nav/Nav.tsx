import { UserModel } from '@/api';
import logo from '@/assets/logo.avif';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { http } from '@/lib/http';
import { toastError } from '@/utils/errors';
import clsx from 'clsx';
import { IdCard, LogOut, Menu, Settings, User } from 'lucide-react';
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { SearchPopover } from '../SearchPopover/SearchPopover';
import { SettingsDialog } from '../SettingsDialog/SettingsDialog';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import './Nav.scss';

export const Nav = () => {
  const [impersonateDialogOpen, setImpersonateDialogOpen] = React.useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);

  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  function impersonate(user: User) {
    UserModel.detailAction(user.id, 'impersonate', 'get').then((res) => {
      navigate('/');
      localStorage.setItem('impersonate', res.data.token);
      window.location.reload();
    });
  }

  function logout() {
    http
      .post('/api/token-auth/logout/')
      .then()
      .catch((err) => toastError(err))
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
          {/* <Button asChild>
            <Link to="/sign-up">Sign Up</Link>
          </Button> */}
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </>
    );
  }

  function renderUserMenu() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <Menu />
          </Button>
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
        <div className="container mx-auto px-4">
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
            {!user ? renderAuthLinks() : renderUserMenu()}
          </div>
        </div>
      </div>
      <Dialog open={impersonateDialogOpen} onOpenChange={(open) => setImpersonateDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonate User</DialogTitle>
            <DialogDescription>Search for a user to impersonate</DialogDescription>
          </DialogHeader>
          <SearchPopover
            endpoint="/api/users/"
            onChange={(value: User) => impersonate(value)}
            parameter="search"
            renderMatch={(user: User) => {
              return <>{user.email}</>;
            }}
            trigger={
              <Button className="w-full" variant="outline">
                Search
              </Button>
            }
          />
        </DialogContent>
      </Dialog>
      <Dialog open={settingsDialogOpen} onOpenChange={(open) => setSettingsDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Change your settings</DialogDescription>
          </DialogHeader>
          <SettingsDialog onClose={() => setSettingsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
