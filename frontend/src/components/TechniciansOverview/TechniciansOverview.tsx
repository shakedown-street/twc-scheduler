import { TechnicianModel } from '@/api';
import { useBlocks } from '@/contexts/BlocksContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { getBlockAppointments, getBlockAvailabilities } from '@/utils/appointments';
import { dayColor, skillLevelColor, striped } from '@/utils/color';
import { orderByFirstName } from '@/utils/order';
import { Check, Info, Loader } from 'lucide-react';
import React from 'react';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';
import { TechnicianForm } from '../TechnicianForm/TechnicianForm';
import { Button } from '../ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import './TechniciansOverview.scss';

export type TechniciansOverviewProps = {
  isSubList?: boolean;
  showLegend?: boolean;
};

export const TechniciansOverview = ({ isSubList = false, showLegend = true }: TechniciansOverviewProps) => {
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

  const days = [0, 1, 2, 3, 4];

  React.useEffect(() => {
    setTechniciansLoading(true);

    const fetchTechnicians = () => {
      TechnicianModel.all({
        page_size: 1000,
        expand_appointments: true,
        expand_availabilities: true,
        expand_properties: true,
      })
        .then((technicians) => {
          setTechnicians(orderByFirstName<Technician>(technicians));
        })
        .finally(() => {
          setTechniciansLoading(false);
        });
    };

    // Poll every minute
    const pollInterval = setInterval(() => {
      fetchTechnicians();
    }, 60 * 1000);

    // Initial fetch
    fetchTechnicians();

    return () => clearInterval(pollInterval);
  }, []);

  function totalHoursByDay(day: number) {
    return technicians.reduce(
      (acc, technician) =>
        acc + (technician.computed_properties ? technician.computed_properties.total_hours_by_day[day] : 0),
      0,
    );
  }

  function totalHours() {
    return technicians.reduce(
      (acc, technician) => acc + (technician.computed_properties ? technician.computed_properties.total_hours : 0),
      0,
    );
  }

  function displayTotalHoursByDay(technician: Technician, day: number) {
    return technician.computed_properties!.total_hours_by_day[day] > 0
      ? technician.computed_properties!.total_hours_by_day[day]
      : '-';
  }

  function totalRequestedHours() {
    return technicians.reduce((acc, technician) => acc + technician.requested_hours, 0);
  }

  function availableTechsCount(day: number, block: Block) {
    return technicians.reduce((acc, technician) => {
      const appointments = getBlockAppointments(technician.appointments || [], day, block) || [];
      const availabilities = getBlockAvailabilities(technician.availabilities || [], day, block) || [];
      return (
        acc +
        (appointments.length < 1 && availabilities.length > 0 && !technician.computed_properties?.is_maxed_on_sessions
          ? 1
          : 0)
      );
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
        const background = '#1d4ed8'; // tw-blue-700
        const color = 'white';
        return (
          <td
            key={block.id}
            style={{
              background,
              borderLeftWidth,
              borderRightWidth,
              color,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            S
          </td>
        );
      }

      return (
        <td
          key={block.id}
          style={{
            background: '#404040', // tw-neutral-700
            borderLeftWidth,
            borderRightWidth,
          }}
        ></td>
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
        <td
          className="TechniciansOverview__slot"
          style={{
            background,
            borderLeftWidth,
            borderRightWidth,
          }}
        >
          {appointment.is_preschool_or_adaptive && <div className="TechniciansOverview__slot__corner">PA</div>}
        </td>
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
      if (technician.computed_properties?.is_maxed_on_sessions) {
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
        <td
          key={block.id}
          style={{
            background,
            borderLeftWidth,
            borderRightWidth,
            color,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {letter}
        </td>
      );
    }

    // Render unavailable blocks
    return (
      <td
        key={block.id}
        style={{
          background: '#404040', // tw-neutral-700
          borderLeftWidth,
          borderRightWidth,
        }}
      ></td>
    );
  }

  function renderLegend() {
    if (isSubList) {
      return (
        <div className="TechniciansOverview__legend">
          <div className="TechniciansOverview__legend__example">
            <div className="TechniciansOverview__legend__example__color bg-neutral-700"></div>
            <span>Unavailable</span>
          </div>
          <div className="TechniciansOverview__legend__example">
            <div className="TechniciansOverview__legend__example__color bg-blue-700 text-white">S</div>
            <span>Available to sub</span>
          </div>
        </div>
      );
    }

    return (
      <div className="TechniciansOverview__legend">
        <div className="TechniciansOverview__legend__example">
          <div className="TechniciansOverview__legend__example__color bg-neutral-700"></div>
          <span>Unavailable</span>
        </div>
        <div className="TechniciansOverview__legend__example">
          <div className="TechniciansOverview__legend__example__color bg-black text-green-500">A</div>
          <span>Available</span>
        </div>
        <div className="TechniciansOverview__legend__example">
          <div className="TechniciansOverview__legend__example__color bg-blue-700 text-white">S</div>
          <span>Available to sub</span>
        </div>
        <div className="TechniciansOverview__legend__example">
          <div className="TechniciansOverview__legend__example__color bg-black text-red-500">M</div>
          <span>Maxed on sessions</span>
        </div>
        <div className="TechniciansOverview__legend__example">
          <div className="TechniciansOverview__legend__example__color bg-green-700"></div>
          <span>Has session</span>
        </div>
        <div className="TechniciansOverview__legend__example">
          <div className="TechniciansOverview__legend__example__color bg-yellow-500"></div>
          <span>Client onboarding</span>
        </div>
        <div className="TechniciansOverview__legend__example">
          <div
            className="TechniciansOverview__legend__example__color"
            style={{ background: striped('black', 'white') }}
          ></div>
          <span>In clinic</span>
        </div>
        <div className="TechniciansOverview__legend__example">
          <div className="TechniciansOverview__legend__example__color bg-background">
            <div className="TechniciansOverview__legend__example__color__corner">PA</div>
          </div>
          <span>Preschool/adaptive</span>
        </div>
      </div>
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
        <table className="TechniciansOverview">
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
              <th></th>
              <th title="Skill level"></th>
              <th title="Spanish speaker">Spa</th>
              <th title="Technician"></th>
              {!isSubList && (
                <>
                  <th>Mon</th>
                  <th>Tue</th>
                  <th>Wed</th>
                  <th>Thu</th>
                  <th>Fri</th>
                  <th title="Week hours">Week</th>
                  <th title="Hours requested">Req</th>
                  <th title="Available"></th>
                </>
              )}
              {['M', 'T', 'W', 'TH', 'F'].map((day, dayIndex) => (
                <React.Fragment key={day}>
                  {blocks.map((block, blockIndex) => (
                    <th
                      key={block.id}
                      style={{
                        background: dayColor(dayIndex),
                        borderLeftWidth: blockIndex === 0 ? '6px' : '1px',
                        borderRightWidth: blockIndex === blocks.length - 1 ? '6px' : '1px',
                        color: 'black',
                      }}
                    >
                      {day}
                      {blockIndex + 1}
                    </th>
                  ))}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {technicians.map((technician, index) => (
              <tr key={technician.id}>
                <td style={{ background: technician.bg_color, color: technician.text_color, textAlign: 'center' }}>
                  {index + 1}
                </td>
                <td
                  style={{ background: skillLevelColor(technician.skill_level), color: 'black', textAlign: 'center' }}
                >
                  {technician.skill_level}
                </td>
                <td
                  style={{
                    textAlign: 'center',
                    verticalAlign: 'middle',
                  }}
                >
                  {technician.spanish_speaking && <Check className="text-green-700" size="14" />}
                </td>
                <td className="text-nowrap" style={{ background: technician.bg_color, color: technician.text_color }}>
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
                </td>
                {!isSubList && (
                  <>
                    <td style={{ textAlign: 'center' }}>{displayTotalHoursByDay(technician, 0)}</td>
                    <td style={{ textAlign: 'center' }}>{displayTotalHoursByDay(technician, 1)}</td>
                    <td style={{ textAlign: 'center' }}>{displayTotalHoursByDay(technician, 2)}</td>
                    <td style={{ textAlign: 'center' }}>{displayTotalHoursByDay(technician, 3)}</td>
                    <td style={{ textAlign: 'center' }}>{displayTotalHoursByDay(technician, 4)}</td>
                    <td style={{ textAlign: 'center' }}>{technician.computed_properties?.total_hours}</td>
                    <td style={{ textAlign: 'center' }}>{technician.requested_hours}</td>
                    <td
                      style={{
                        background: 'black',
                        color: technician.computed_properties?.is_maxed_on_sessions ? '#ef4444' : '#22c55e', // tw-red-500 : tw-green-500
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {technician.computed_properties?.is_maxed_on_sessions ? 'M' : 'A'}
                    </td>
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
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  Total
                </td>
                <td style={{ textAlign: 'center' }}>{totalHoursByDay(0)}</td>
                <td style={{ textAlign: 'center' }}>{totalHoursByDay(1)}</td>
                <td style={{ textAlign: 'center' }}>{totalHoursByDay(2)}</td>
                <td style={{ textAlign: 'center' }}>{totalHoursByDay(3)}</td>
                <td style={{ textAlign: 'center' }}>{totalHoursByDay(4)}</td>
                <td style={{ textAlign: 'center' }}>{totalHours()}</td>
                <td style={{ textAlign: 'center' }}>{totalRequestedHours()}</td>
                <td></td>
                {['M', 'T', 'W', 'TH', 'F'].map((day, dayIndex) => (
                  <React.Fragment key={day}>
                    {blocks.map((block, blockIndex) => (
                      <td
                        key={block.id}
                        style={{
                          borderLeftWidth: blockIndex === 0 ? '6px' : '1px',
                          borderRightWidth: blockIndex === blocks.length - 1 ? '6px' : '1px',
                          textAlign: 'center',
                        }}
                      >
                        {availableTechsCount(dayIndex, block)}
                      </td>
                    ))}
                  </React.Fragment>
                ))}
              </tr>
              <tr>
                <td colSpan={12}></td>
                <td
                  colSpan={15}
                  style={{
                    borderLeftWidth: '6px',
                    borderRightWidth: '6px',
                  }}
                >
                  Total Available
                </td>
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
