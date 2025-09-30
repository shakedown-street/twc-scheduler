import { ScheduleModel } from '@/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { useSchedules } from '@/contexts/SchedulesContext';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/utils/format';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { Info, MoreHorizontal, Plus } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

const TableHeader = ({ children, className }: React.ComponentProps<'th'>) => {
  return <th className={cn('p-2 text-left text-sm font-medium', className)}>{children}</th>;
};

const TableCell = ({ children, className }: React.ComponentProps<'td'>) => {
  return <td className={cn('p-2', className)}>{children}</td>;
};

export const ManageSchedules = () => {
  const [creating, setCreating] = React.useState(false);
  const [creatingForm, setCreatingForm] = React.useState({
    name: '',
    copy_from_current: true,
  });
  const [editing, setEditing] = React.useState<Schedule>();
  const [deleting, setDeleting] = React.useState<Schedule>();

  const { schedules, setSchedules } = useSchedules();

  function switchToSchedule(schedule: Schedule) {
    localStorage.setItem('schedule', schedule.id);
    window.location.reload();
  }

  function cancelCreate() {
    setCreating(false);
    setCreatingForm({
      name: '',
      copy_from_current: true,
    });
  }

  function createSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (creatingForm.name.trim().length < 1) {
      toast.error('Name is required');
      return;
    }

    ScheduleModel.create(creatingForm).then((res) => {
      setSchedules((schedules) => [...schedules, res.data]);
      setCreating(false);
      setCreatingForm({
        name: '',
        copy_from_current: true,
      });
    });
  }

  function updateSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!editing) {
      return;
    }

    ScheduleModel.update(editing.id, editing).then((res) => {
      setSchedules((schedules) => schedules.map((s) => (s.id === res.data.id ? res.data : s)));
      setEditing(undefined);
    });
  }

  function deleteSchedule() {
    if (!deleting) {
      return;
    }

    ScheduleModel.delete(deleting.id).then(() => {
      setSchedules((schedules) => schedules.filter((s) => s.id !== deleting.id));
      const isCurrent = localStorage.getItem('schedule') === deleting.id;
      if (isCurrent) {
        localStorage.removeItem('schedule');
        window.location.reload();
      }
      setDeleting(undefined);
    });
  }

  return (
    <>
      <title>Manage Schedules | Schedule Builder</title>
      <div className="container mx-auto mt-4 mb-12 px-4">
        <h1 className="mb-4 text-2xl font-bold">Manage Schedules</h1>
        <p className="text-muted-foreground mb-4 max-w-lg text-sm">
          Here you can create schedules for archiving or testing purposes. You can make changes to these schedules
          without affecting your current schedule.
        </p>
        <Button className="mb-8" onClick={() => setCreating(true)}>
          <Plus />
          Create Schedule
        </Button>
        {schedules.length > 0 && (
          <div className="overflow-hidden rounded border">
            <div className="relative w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <TableHeader>Name</TableHeader>
                    <TableHeader className="w-80">Created At</TableHeader>
                    <TableHeader className="w-16"></TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="not-last:border-b">
                      <TableCell>{schedule.name}</TableCell>
                      <TableCell>{formatDateTime(schedule.created_at)}</TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal size="20" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditing(schedule)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleting(schedule)} variant="destructive">
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => switchToSchedule(schedule)}>
                              Switch to Schedule
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Dialog open={creating} onOpenChange={() => cancelCreate()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Schedule</DialogTitle>
          </DialogHeader>
          <form className="form" onSubmit={(e) => createSchedule(e)}>
            <div className="form-group">
              <Label htmlFor="name_create">Name</Label>
              <Input
                id="name_create"
                placeholder="Name"
                onChange={(e) => {
                  setCreatingForm({ ...creatingForm, name: e.target.value });
                }}
                value={creatingForm.name}
              />
            </div>
            <div className="form-group">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="copy_current_create"
                  checked={creatingForm.copy_from_current}
                  onCheckedChange={() =>
                    setCreatingForm({
                      ...creatingForm,
                      copy_from_current: !creatingForm.copy_from_current,
                    })
                  }
                />
                <Label htmlFor="copy_current_create">
                  Copy from current schedule
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size="16" />
                    </TooltipTrigger>
                    <TooltipContent className="w-64">
                      This will copy all the data from the current schedule to the new one. Uncheck to create a blank
                      schedule.
                    </TooltipContent>
                  </Tooltip>
                </Label>
              </div>
            </div>
            <div className="flex justify-between">
              <Button onClick={cancelCreate} type="button" variant="ghost">
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editing} onOpenChange={() => setEditing(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
          </DialogHeader>
          <form className="form" onSubmit={(e) => updateSchedule(e)}>
            <div className="form-group">
              <Label htmlFor="name_edit">Name</Label>
              <Input
                id="name_edit"
                onChange={(e) => {
                  setEditing({
                    ...editing!,
                    name: e.target.value,
                  });
                }}
                placeholder="Name"
                value={editing?.name}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSchedule}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
