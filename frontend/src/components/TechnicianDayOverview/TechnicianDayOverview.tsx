import { TechnicianModel } from '@/api';
import { useBlocks } from '@/contexts/BlocksContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { getBlockAppointments, getBlockAvailabilities } from '@/utils/appointments';
import { skillLevelColor, striped } from '@/utils/color';
import { hours, hoursByDay, isMaxedOnSessions } from '@/utils/computedProperties';
import { orderByFirstName } from '@/utils/order';
import { dayToString } from '@/utils/time';
import { Check, Loader } from 'lucide-react';
import React from 'react';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';
import { TechnicianForm } from '../TechnicianForm/TechnicianForm';
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

export type TechnicianDayOverviewProps = {
  day: number;
};

export const TechnicianDayOverview = ({ day }: TechnicianDayOverviewProps) => {
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [techniciansLoading, setTechniciansLoading] = React.useState(true);
  const [technicianForm, setTechnicianForm] = React.useState<{
    open: boolean;
    technician?: Technician;
  }>({
    open: false,
    technician: undefined,
  });

  const { user } = useAuth();
  const { blocks } = useBlocks();

  React.useEffect(() => {
    setTechniciansLoading(true);
    TechnicianModel.all({
      page_size: 1000,
      expand_appointments: true,
      expand_availabilities: true,
    })
      .then((technicians) => {
        setTechnicians(orderByFirstName<Technician>(technicians));
      })
      .finally(() => {
        setTechniciansLoading(false);
      });
  }, []);

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

  function renderBlock(technician: Technician, block: Block, blockIndex: number) {
    const blockAppointments = getBlockAppointments(technician.appointments || [], day, block) || [];
    const blockAvailabilities = getBlockAvailabilities(technician.availabilities || [], day, block) || [];

    const borderLeftWidth = blockIndex === 0 ? '6px' : '1px';
    const borderRightWidth = blockIndex === blocks.length - 1 ? '6px' : '1px';

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
          className="relative"
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
          className="text-center font-bold"
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
  if (techniciansLoading) {
    return (
      <div className="mt-12 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <table className="w-full border-collapse">
        <colgroup>
          <col width="24px" />
          <col width="24px" />
          <col />
          <col />
          <col />
          <col />
          <col />
          <col width="24px" />
          {blocks.map((block) => (
            <col key={block.id} width="28px" />
          ))}
        </colgroup>
        <thead>
          <tr>
            <TableHeader></TableHeader>
            <TableHeader title="Skill level"></TableHeader>
            <TableHeader title="Spanish speaker">Spa</TableHeader>
            <TableHeader title="Technician"></TableHeader>
            <TableHeader title="Day hours">{dayToString(day, 'medium')}</TableHeader>
            <TableHeader title="Week hours">Week</TableHeader>
            <TableHeader title="Hours requested">Req</TableHeader>
            <TableHeader title="Available"></TableHeader>
            {blocks.map((block, blockIndex) => (
              <TableHeader
                key={block.id}
                className={cn('border-x text-black', {
                  'border-l-6': blockIndex === 0,
                  'border-r-6': blockIndex === blocks.length - 1,
                })}
                style={{
                  background: block.color,
                }}
              ></TableHeader>
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
              <TableCell className="text-center">{hoursByDay(technician, day)}</TableCell>
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
              {blocks.map((block, blockIndex) => (
                <React.Fragment key={block.id}>{renderBlock(technician, block, blockIndex)}</React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
