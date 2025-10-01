import { UserModel } from '@/api';
import logoSmall from '@/assets/logo-small.png';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { http } from '@/lib/http';
import { toastError } from '@/utils/errors';
import { ArrowLeftRight, Calendar, CalendarCheck, CalendarCog, List, LogOut, Menu } from 'lucide-react';
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { SearchPopover } from '../SearchPopover/SearchPopover';
import { SettingsDialog } from '../SettingsDialog/SettingsDialog';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export const Nav = () => {
  const [impersonateDialogOpen, setImpersonateDialogOpen] = React.useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);

  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { user, setUser } = useAuth();
  const { schedules } = useSchedule();

  function selectedScheduleName() {
    const scheduleId = localStorage.getItem('schedule');
    if (!scheduleId) {
      return 'Current Schedule';
    }
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      return 'Current Schedule';
    }
    return schedule.name;
  }

  function switchToCurrentSchedule() {
    localStorage.removeItem('schedule');
    window.location.reload();
  }

  function switchToSchedule(schedule: Schedule) {
    localStorage.setItem('schedule', schedule.id);
    window.location.reload();
  }

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
          <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
          {user?.is_superuser && (
            <DropdownMenuItem onClick={() => setImpersonateDialogOpen(true)}>Impersonate</DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setSettingsDialogOpen(true)}>Settings</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
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
          <div className="flex items-center gap-2">
            {user && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarCog />
                    {selectedScheduleName()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="text-muted-foreground text-sm font-medium">Switch to Schedule</div>
                  <div className="my-2 max-h-40 overflow-y-auto">
                    <ul>
                      <li
                        className="hover:bg-accent hover:text-accent-foreground block w-full rounded-md p-2 text-sm font-bold"
                        onClick={switchToCurrentSchedule}
                      >
                        Current Schedule <span className="text-muted-foreground">(default)</span>
                      </li>
                      {schedules.map((schedule) => (
                        <li
                          key={schedule.id}
                          className="hover:bg-accent hover:text-accent-foreground block w-full rounded-md p-2 text-sm"
                          onClick={() => switchToSchedule(schedule)}
                        >
                          {schedule.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/manage-schedules">Manage Schedules</Link>
                  </Button>
                </PopoverContent>
              </Popover>
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
            <DialogDescription>Configure your user settings</DialogDescription>
          </DialogHeader>
          <SettingsDialog onClose={() => setSettingsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
