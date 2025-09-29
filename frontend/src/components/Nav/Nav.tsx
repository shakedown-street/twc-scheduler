import { UserModel } from '@/api';
import logoSmall from '@/assets/logo-small.png';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { http } from '@/lib/http';
import { toastError } from '@/utils/errors';
import { ArrowLeftRight, Calendar, CalendarCheck, IdCard, List, LogOut, Menu, Settings, User } from 'lucide-react';
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { SearchPopover } from '../SearchPopover/SearchPopover';
import { SettingsDialog } from '../SettingsDialog/SettingsDialog';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

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
      <div className="bg-background shadow">
        <div className="container mx-auto flex items-center gap-2 px-4 py-2">
          <Link to="/">
            <img className="h-10" src={logoSmall} />
          </Link>
          {user && (
            <div className="flex items-center gap-1">
              <NavLink to="/">
                {({ isActive }) => (
                  <Button size="sm" variant={isActive ? 'default' : 'ghost'}>
                    <Calendar size="18" /> Schedule
                  </Button>
                )}
              </NavLink>
              <NavLink to="/overview">
                {({ isActive }) => (
                  <Button size="sm" variant={isActive ? 'default' : 'ghost'}>
                    <List size="18" /> Overview
                  </Button>
                )}
              </NavLink>
              <NavLink to="/availability">
                {({ isActive }) => (
                  <Button size="sm" variant={isActive ? 'default' : 'ghost'}>
                    <CalendarCheck size="18" /> Availability
                  </Button>
                )}
              </NavLink>
              <NavLink to="/sub-list">
                {({ isActive }) => (
                  <Button size="sm" variant={isActive ? 'default' : 'ghost'}>
                    <ArrowLeftRight size="18" /> Sub List
                  </Button>
                )}
              </NavLink>
            </div>
          )}
          <div className="flex-1"></div>
          {!user ? renderAuthLinks() : renderUserMenu()}
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
            <DialogDescription>Configure your user settings</DialogDescription>
          </DialogHeader>
          <SettingsDialog onClose={() => setSettingsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
