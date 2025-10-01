import { useSchedule } from '@/contexts/ScheduleContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { getBlockAppointments, getBlockAvailabilities } from '@/utils/appointments';
import { dayColor, skillLevelColor, striped } from '@/utils/color';
import { hours, hoursByDay, isMaxedOnSessions } from '@/utils/computedProperties';
import { Check, Info } from 'lucide-react';
import React from 'react';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';
import { TechnicianForm } from '../TechnicianForm/TechnicianForm';
import { Button } from '../ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

const TableHeader = ({ children, className, ...props }: React.ComponentProps<'th'>) => {
  return (
    <th
      className={cn('border border-black p-1 text-left text-[10px] [writing-mode:vertical-rl]', className)}
      {...props}
    >
      {children}
    </th>
  );
};

const TableCell = ({ children, className, ...props }: React.ComponentProps<'td'>) => {
  return (
    <td className={cn('border border-black p-1 text-left text-xs', className)} {...props}>
      {children}
    </td>
  );
};

export type TechniciansOverviewProps = {
  isSubList?: boolean;
  showLegend?: boolean;
};

export const TechniciansOverview = ({ isSubList = false, showLegend = true }: TechniciansOverviewProps) => {
  const [technicianForm, setTechnicianForm] = React.useState<{
    open: boolean;
    technician?: Technician;
  }>({
    open: false,
    technician: undefined,
  });

  const { user } = useAuth();
  const { blocks, technicians, setTechnicians } = useSchedule();

  const days = [0, 1, 2, 3, 4];

  function totalHoursByDay(day: number) {
    return technicians.reduce((acc, technician) => acc + hoursByDay(technician, day), 0);
  }

  function totalHours() {
    return technicians.reduce((acc, technician) => acc + hours(technician), 0);
  }

  function displayTotalHoursByDay(technician: Technician, day: number) {
    return hoursByDay(technician, day) > 0 ? hoursByDay(technician, day) : '-';
  }

  function totalRequestedHours() {
    return technicians.reduce((acc, technician) => acc + technician.requested_hours, 0);
  }

  function availableTechsCount(day: number, block: Block) {
    return technicians.reduce((acc, technician) => {
      const appointments = getBlockAppointments(technician.appointments || [], day, block) || [];
      const availabilities = getBlockAvailabilities(technician.availabilities || [], day, block) || [];
      return acc + (appointments.length < 1 && availabilities.length > 0 && !isMaxedOnSessions(technician) ? 1 : 0);
    }, 0);
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

  function onUpdateTechnician(updated: Technician) {
    setTechnicians(technicians.map((t) => (t.id === updated.id ? Object.assign({}, t, updated) : t)));
    closeTechnicianForm();
  }

  function onDeleteTechnician(deleted: Technician) {
    setTechnicians(technicians.filter((t) => t.id !== deleted.id));
    closeTechnicianForm();
  }

  function renderBlock(technician: Technician, day: number, block: Block, blockIndex: number) {
    const blockAppointments = getBlockAppointments(technician.appointments || [], day, block) || [];
    const blockAvailabilities = getBlockAvailabilities(technician.availabilities || [], day, block) || [];
    const isAvailableToSub = blockAvailabilities.length > 0 && blockAppointments.length === 0;

    const borderLeftWidth = blockIndex === 0 ? '6px' : '1px';
    const borderRightWidth = blockIndex === blocks.length - 1 ? '6px' : '1px';

    // Render sub list blocks
    if (isSubList) {
      if (isAvailableToSub) {
        return (
          <TableCell
            key={block.id}
            className="bg-blue-700 text-center font-bold text-white"
            style={{
              borderLeftWidth,
              borderRightWidth,
            }}
          >
            S
          </TableCell>
        );
      }

      return (
        <TableCell
          key={block.id}
          className="bg-neutral-700"
          style={{
            borderLeftWidth,
            borderRightWidth,
          }}
        ></TableCell>
      );
    }

    // Render appointment blocks
    if (blockAppointments.length > 0) {
      const appointment = blockAppointments[0];
      const bgColor = appointment.client?.is_onboarding ? '#eab308' : '#15803d'; // tw-yellow-500 : tw-green-700
      let background = bgColor;
      if (appointment.in_clinic) {
        background = striped('black', bgColor);
      }

      const hoverTrigger = (
        <TableCell
          className="relative cursor-pointer"
          style={{
            background,
            borderLeftWidth,
            borderRightWidth,
          }}
        >
          {appointment.is_preschool_or_adaptive && (
            <div className="absolute top-0 right-0 bg-black p-0.5 text-[8px] leading-none text-white">PA</div>
          )}
        </TableCell>
      );

      if (user?.hover_cards_enabled) {
        return (
          <HoverCard key={block.id}>
            <HoverCardTrigger asChild>{hoverTrigger}</HoverCardTrigger>
            <HoverCardContent className="w-96">
              <AppointmentHover appointment={appointment} />
            </HoverCardContent>
          </HoverCard>
        );
      } else {
        return hoverTrigger;
      }
    }

    // Render availability blocks
    if (blockAvailabilities.length > 0) {
      let background = 'black';
      let color = '#22c55e'; // tw-green-500
      let letter = 'A';
      if (isMaxedOnSessions(technician)) {
        background = 'black';
        color = '#ef4444'; // tw-red-500
        letter = 'M';
      }
      if (blockAvailabilities[0].is_sub) {
        background = '#1d4ed8'; // tw-blue-700
        color = 'white';
        letter = 'S';
      }
      return (
        <TableCell
          key={block.id}
          className={cn('text-center font-bold')}
          style={{
            background,
            borderLeftWidth,
            borderRightWidth,
            color,
          }}
        >
          {letter}
        </TableCell>
      );
    }

    // Render unavailable blocks
    return (
      <TableCell
        key={block.id}
        className="bg-neutral-700"
        style={{
          borderLeftWidth,
          borderRightWidth,
        }}
      ></TableCell>
    );
  }

  function renderLegend() {
    if (isSubList) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-xs">
            <div className="flex h-6 w-6 items-center justify-center border border-black bg-neutral-700"></div>
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="flex h-6 w-6 items-center justify-center border border-black bg-blue-700 font-bold text-white">
              A
            </div>
            <span>Available to sub</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-6 w-6 border border-black bg-neutral-700"></div>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex h-6 w-6 items-center justify-center border border-black bg-black font-bold text-green-500">
            A
          </div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex h-6 w-6 items-center justify-center border border-black bg-blue-700 font-bold text-white">
            S
          </div>
          <span>Available to sub</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex h-6 w-6 items-center justify-center border border-black bg-black font-bold text-red-500">
            M
          </div>
          <span>Maxed on sessions</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-6 w-6 border border-black bg-green-700"></div>
          <span>Has session</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-6 w-6 border border-black bg-yellow-500"></div>
          <span>Client onboarding</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-6 w-6 border border-black" style={{ background: striped('black', 'white') }}></div>
          <span>In clinic</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="bg-background relative h-6 w-6 border border-black">
            <div className="absolute top-0 right-0 bg-black p-0.5 text-[8px] leading-none font-bold text-white">PA</div>
          </div>
          <span>Preschool/adaptive</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {showLegend && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button className="self-start" size="sm" variant="outline">
                <Info />
                Legend
              </Button>
            </HoverCardTrigger>
            <HoverCardContent align="start">{renderLegend()}</HoverCardContent>
          </HoverCard>
        )}
        <table className="w-full border-collapse">
          <colgroup>
            <col width="24px" />
            <col width="24px" />
            <col />
            <col />
            {!isSubList && (
              <>
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col width="24px" />
              </>
            )}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
              <React.Fragment key={day}>
                {blocks.map((block) => (
                  <col key={block.id} width="28px" />
                ))}
              </React.Fragment>
            ))}
          </colgroup>
          <thead>
            <tr>
              <TableHeader></TableHeader>
              <TableHeader title="Skill level"></TableHeader>
              <TableHeader title="Spanish speaker">Spa</TableHeader>
              <TableHeader title="Technician"></TableHeader>
              {!isSubList && (
                <>
                  <TableHeader>Mon</TableHeader>
                  <TableHeader>Tue</TableHeader>
                  <TableHeader>Wed</TableHeader>
                  <TableHeader>Thu</TableHeader>
                  <TableHeader>Fri</TableHeader>
                  <TableHeader title="Week hours">Week</TableHeader>
                  <TableHeader title="Hours requested">Req</TableHeader>
                  <TableHeader title="Available"></TableHeader>
                </>
              )}
              {['M', 'T', 'W', 'TH', 'F'].map((day, dayIndex) => (
                <React.Fragment key={day}>
                  {blocks.map((block, blockIndex) => (
                    <TableHeader
                      key={block.id}
                      className={cn('border-x text-black', {
                        'border-l-6': blockIndex === 0,
                        'border-r-6': blockIndex === blocks.length - 1,
                      })}
                      style={{
                        background: dayColor(dayIndex),
                      }}
                    >
                      {day}
                      {blockIndex + 1}
                    </TableHeader>
                  ))}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {technicians.map((technician, index) => (
              <tr key={technician.id} className="even:bg-muted hover:bg-border">
                <TableCell
                  className="text-center"
                  style={{ background: technician.bg_color, color: technician.text_color }}
                >
                  {index + 1}
                </TableCell>
                <TableCell
                  className="text-center text-black"
                  style={{ background: skillLevelColor(technician.skill_level) }}
                >
                  {technician.skill_level}
                </TableCell>
                <TableCell className="text-center align-middle">
                  {technician.spanish_speaking && <Check className="text-green-700" size="14" />}
                </TableCell>
                <TableCell
                  className="text-nowrap"
                  style={{ background: technician.bg_color, color: technician.text_color }}
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
                {!isSubList && (
                  <>
                    <TableCell className="text-center">{displayTotalHoursByDay(technician, 0)}</TableCell>
                    <TableCell className="text-center">{displayTotalHoursByDay(technician, 1)}</TableCell>
                    <TableCell className="text-center">{displayTotalHoursByDay(technician, 2)}</TableCell>
                    <TableCell className="text-center">{displayTotalHoursByDay(technician, 3)}</TableCell>
                    <TableCell className="text-center">{displayTotalHoursByDay(technician, 4)}</TableCell>
                    <TableCell className="text-center">{hours(technician)}</TableCell>
                    <TableCell className="text-center">{technician.requested_hours}</TableCell>
                    <TableCell
                      className={cn('bg-black text-center font-bold', {
                        'text-red-500': isMaxedOnSessions(technician),
                        'text-green-500': !isMaxedOnSessions(technician),
                      })}
                    >
                      {isMaxedOnSessions(technician) ? 'M' : 'A'}
                    </TableCell>
                  </>
                )}
                {days.map((day) => (
                  <React.Fragment key={day}>
                    {blocks.map((block, blockIndex) => (
                      <React.Fragment key={block.id}>{renderBlock(technician, day, block, blockIndex)}</React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
          {!isSubList && (
            <tfoot>
              <tr className="hover:bg-border">
                <TableCell className="text-center" colSpan={4}>
                  Total
                </TableCell>
                <TableCell className="text-center">{totalHoursByDay(0)}</TableCell>
                <TableCell className="text-center">{totalHoursByDay(1)}</TableCell>
                <TableCell className="text-center">{totalHoursByDay(2)}</TableCell>
                <TableCell className="text-center">{totalHoursByDay(3)}</TableCell>
                <TableCell className="text-center">{totalHoursByDay(4)}</TableCell>
                <TableCell className="text-center">{totalHours()}</TableCell>
                <TableCell className="text-center">{totalRequestedHours()}</TableCell>
                <TableCell></TableCell>
                {['M', 'T', 'W', 'TH', 'F'].map((day, dayIndex) => (
                  <React.Fragment key={day}>
                    {blocks.map((block, blockIndex) => (
                      <TableCell
                        key={block.id}
                        className={cn('border-x text-center', {
                          'border-l-6': blockIndex === 0,
                          'border-r-6': blockIndex === blocks.length - 1,
                        })}
                      >
                        {availableTechsCount(dayIndex, block)}
                      </TableCell>
                    ))}
                  </React.Fragment>
                ))}
              </tr>
              <tr>
                <TableCell colSpan={12}></TableCell>
                <TableCell colSpan={15} className="border-x-6">
                  Total Available
                </TableCell>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {technicianForm.technician && (
        <Sheet
          open={technicianForm.open}
          onOpenChange={(open) => setTechnicianForm({ ...technicianForm, open, technician: undefined })}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Update Technician</SheetTitle>
            </SheetHeader>
            <TechnicianForm
              technician={technicianForm.technician}
              onCancel={() => {
                setTechnicianForm({ ...technicianForm, open: false, technician: undefined });
              }}
              onUpdate={onUpdateTechnician}
              onDelete={onDeleteTechnician}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};
