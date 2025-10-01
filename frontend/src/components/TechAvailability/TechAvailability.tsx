import { TechnicianModel } from '@/api';
import { AvailabilityForm } from '@/components/AvailabilityForm/AvailabilityForm';
import { TechnicianForm } from '@/components/TechnicianForm/TechnicianForm';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { isFullBlock } from '@/utils/appointments';
import { skillLevelColor } from '@/utils/color';
import { availableHours } from '@/utils/computedProperties';
import { checkTimeIntersection, formatTimeShort } from '@/utils/time';
import clsx from 'clsx';
import { AlertTriangle, ArrowLeftRight, Check } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

const TableHeader = ({ children, className, ...props }: React.ComponentProps<'th'>) => {
  return (
    <th className={cn('border border-black p-1 text-left text-[10px]', className)} {...props}>
      {children}
    </th>
  );
};

const TableCell = ({ children, className, ...props }: React.ComponentProps<'td'>) => {
  return (
    <td className={cn('border border-black p-1 text-xs', className)} {...props}>
      {children}
    </td>
  );
};

export const TechAvailability = () => {
  const [showSubOnly, setShowSubOnly] = React.useState(false);
  const [technicianForm, setTechnicianForm] = React.useState<{
    open: boolean;
    technician?: Technician;
  }>({
    open: false,
    technician: undefined,
  });
  const [availabilityForm, setAvailabilityForm] = React.useState<{
    open: boolean;
    instance?: Availability;
    object?: Technician;
    initialStartTime: string;
    initialEndTime: string;
    day: number;
  }>({
    open: false,
    instance: undefined,
    object: undefined,
    initialStartTime: '',
    initialEndTime: '',
    day: 0,
  });

  const { user } = useAuth();
  const { blocks, technicians, setTechnicians } = useSchedule();

  const days = [0, 1, 2, 3, 4];

  function totalRequestedHours() {
    return technicians.reduce((total, technician) => total + (technician.requested_hours || 0), 0);
  }

  function totalAvailableHours() {
    return technicians.reduce((total, technician) => total + (availableHours(technician) || 0), 0);
  }

  function getBlockAvailability(technician: Technician, day: number, block: Block) {
    return technician.availabilities?.find(
      (availability) =>
        availability.day === day &&
        checkTimeIntersection(availability.start_time, availability.end_time, block.start_time, block.end_time) &&
        (!showSubOnly || availability.is_sub),
    );
  }

  function countTechniciansAvailableForBlock(day: number, block: Block) {
    return technicians.filter((technician) => !!getBlockAvailability(technician, day, block)).length;
  }

  function openTechnicianForm(technician: Technician | undefined = undefined) {
    setTechnicianForm({
      ...technicianForm,
      open: true,
      technician,
    });
  }

  function closeTechnicianForm() {
    setTechnicianForm({
      ...technicianForm,
      open: false,
      technician: undefined,
    });
  }

  function onCreateTechnician(created: Technician) {
    setTechnicians((prev) => {
      return [...prev, created].sort((a, b) => a.first_name.localeCompare(b.first_name));
    });
    closeTechnicianForm();
  }

  function onUpdateTechnician(updated: Technician) {
    setTechnicians(technicians.map((t) => (t.id === updated.id ? Object.assign({}, t, updated) : t)));
    closeTechnicianForm();
  }

  function onDeleteTechnician(deleted: Technician) {
    setTechnicians(technicians.filter((t) => t.id !== deleted.id));
    closeTechnicianForm();
  }

  function openAvailabilityForm(
    technician: Technician,
    day: number,
    block: Block,
    instance: Availability | undefined = undefined,
  ) {
    setAvailabilityForm({
      ...availabilityForm,
      open: true,
      instance,
      object: technician,
      day,
      initialStartTime: block.start_time,
      initialEndTime: block.end_time,
    });
  }

  function closeAvailabilityForm() {
    setAvailabilityForm({
      ...availabilityForm,
      open: false,
      instance: undefined,
      object: undefined,
      initialStartTime: '',
      initialEndTime: '',
    });
  }

  function refetchTechnician(technician: Technician) {
    return TechnicianModel.get(technician.id, {
      expand_availabilities: true,
    }).then((technicianUpdated) => {
      setTechnicians((prev) =>
        prev.map((t) => {
          if (t.id === technician.id) {
            t = technicianUpdated.data;
            return t;
          }
          return t;
        }),
      );
      closeAvailabilityForm();
    });
  }

  function renderAvailabilities(technician: Technician) {
    return days.map((day) =>
      blocks.map((block, index) => {
        const blockAvailability = getBlockAvailability(technician, day, block);

        return (
          <TableCell
            key={block.id}
            className={clsx('w-18 cursor-pointer bg-gray-400 text-black', {
              'border-l-6': index === 0,
              'border-r-6': index === blocks.length - 1,
            })}
            style={{
              background: blockAvailability ? block.color : undefined,
            }}
            onClick={() => {
              if (!user?.is_superuser) {
                return;
              }
              if (blockAvailability) {
                openAvailabilityForm(technician, day, block, blockAvailability);
              } else {
                openAvailabilityForm(technician, day, block);
              }
            }}
          >
            {blockAvailability && (
              <div className="flex items-center gap-1">
                <div className="text-nowrap">
                  {formatTimeShort(blockAvailability.start_time)}-{formatTimeShort(blockAvailability.end_time)}
                </div>
                {blockAvailability.is_sub && <ArrowLeftRight size="14" />}
                {!isFullBlock(blockAvailability, block) && <AlertTriangle className="text-red-700" size="14" />}
              </div>
            )}
          </TableCell>
        );
      }),
    );
  }

  function renderBlockTotals() {
    return days.map((day) =>
      blocks.map((block) => (
        <TableCell
          key={block.id}
          className={clsx('bg-green-100 text-right text-black', {
            'border-l-6': block.id === 1,
            'border-r-6': block.id === blocks.length,
          })}
        >
          {countTechniciansAvailableForBlock(day, block)}
        </TableCell>
      )),
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Technicians</h2>
        {user?.is_superuser && (
          <Button onClick={() => setTechnicianForm({ ...technicianForm, open: true })}>Create Technician</Button>
        )}
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Checkbox checked={showSubOnly} id="is_sub_filter" onCheckedChange={() => setShowSubOnly(!showSubOnly)} />
        <Label htmlFor="is_sub_filter">Sub only</Label>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <TableHeader className="[writing-mode:vertical-rl]"></TableHeader>
            <TableHeader className="[writing-mode:vertical-rl]" title="Technician"></TableHeader>
            <TableHeader className="[writing-mode:vertical-rl]" title="Skill level">
              Rating
            </TableHeader>
            <TableHeader className="[writing-mode:vertical-rl]" title="Spanish speaker">
              Spa
            </TableHeader>
            <TableHeader className="[writing-mode:vertical-rl]" title="Requested hours">
              Req
            </TableHeader>
            <TableHeader className="[writing-mode:vertical-rl]" title="Total available hours">
              Avail
            </TableHeader>
            {days.map((day) => (
              <TableHeader key={day} colSpan={blocks.length} className="border-x-6">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][day]}
              </TableHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {technicians.map((technician, index) => (
            <tr key={technician.id} className="hover:bg-border">
              <TableCell>{index + 1}</TableCell>
              <TableCell
                className="text-nowrap"
                style={{
                  background: technician.bg_color,
                }}
              >
                <a
                  className="cursor-pointer"
                  onClick={() => {
                    if (!user?.is_superuser) {
                      return;
                    }
                    openTechnicianForm(technician);
                  }}
                  style={{ color: technician.text_color }}
                >
                  {technician.first_name} {technician.last_name}
                </a>
              </TableCell>
              <TableCell
                className="text-center text-black"
                style={{
                  background: skillLevelColor(technician.skill_level),
                }}
              >
                {technician.skill_level}
              </TableCell>
              <TableCell className="text-center">
                {technician.spanish_speaking && <Check className="text-green-700" size="14" />}
              </TableCell>
              <TableCell>{technician.requested_hours}</TableCell>
              <TableCell>{availableHours(technician)}</TableCell>
              {renderAvailabilities(technician)}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="hover:bg-border">
            <TableCell colSpan={4}></TableCell>
            <TableCell>{totalRequestedHours()}</TableCell>
            <TableCell>{totalAvailableHours()}</TableCell>
            {renderBlockTotals()}
          </tr>
        </tfoot>
      </table>
      <Sheet
        open={technicianForm.open}
        onOpenChange={(open) => setTechnicianForm({ ...technicianForm, open, technician: undefined })}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{technicianForm.technician ? 'Update' : 'Create'} Technician</SheetTitle>
          </SheetHeader>
          <TechnicianForm
            technician={technicianForm.technician}
            onCancel={() => {
              setTechnicianForm({ ...technicianForm, open: false, technician: undefined });
            }}
            onCreate={onCreateTechnician}
            onUpdate={onUpdateTechnician}
            onDelete={onDeleteTechnician}
          />
        </SheetContent>
      </Sheet>
      <Dialog
        open={availabilityForm.open}
        onOpenChange={(open) => {
          if (!open) {
            closeAvailabilityForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{availabilityForm.instance ? 'Update' : 'Create'} Availability</DialogTitle>
          </DialogHeader>
          {availabilityForm.object && (
            <AvailabilityForm
              contentType="technician"
              onCreate={(technician) => refetchTechnician(technician as Technician)}
              onUpdate={(technician) => refetchTechnician(technician as Technician)}
              onDelete={(technician) => refetchTechnician(technician as Technician)}
              instance={availabilityForm.instance}
              object={availabilityForm.object}
              day={availabilityForm.day}
              initialStartTime={availabilityForm.initialStartTime}
              initialEndTime={availabilityForm.initialEndTime}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
