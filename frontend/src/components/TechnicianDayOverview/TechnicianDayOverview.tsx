import { TechnicianModel } from '@/api';
import { useBlocks } from '@/contexts/BlocksContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { RadixDialog, Spinner } from '@/ui';
import { RadixHoverCard } from '@/ui/RadixHoverCard/RadixHoverCard';
import { getBlockAppointments, getBlockAvailabilities } from '@/utils/appointments';
import { skillLevelColor, striped } from '@/utils/color';
import { orderByFirstName } from '@/utils/order';
import { dayToString } from '@/utils/time';
import React from 'react';
import { AppointmentHover } from '../AppointmentHover/AppointmentHover';
import { TechnicianForm } from '../TechnicianForm/TechnicianForm';
import './TechnicianDayOverview.scss';

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
      expand_properties: true,
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
        <td
          className="TechnicianDayOverview__slot"
          style={{
            background,
            borderLeftWidth,
            borderRightWidth,
          }}
        >
          {appointment.is_preschool_or_adaptive && <div className="TechnicianDayOverview__slot__corner">PA</div>}
        </td>
      );

      if (user?.hover_cards_enabled) {
        return (
          <RadixHoverCard key={block.id} portal trigger={hoverTrigger}>
            <AppointmentHover appointment={appointment} />
          </RadixHoverCard>
        );
      } else {
        return hoverTrigger;
      }
    }

    // Render availability blocks
    if (blockAvailabilities.length > 0) {
      let background = 'black'; // tw-slate-300
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
  if (techniciansLoading) {
    return <Spinner className="mt-8" message="Loading technicians..." />;
  }

  return (
    <>
      <div className="flex gap-4">
        <table className="TechnicianDayOverview">
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
              <th></th>
              <th title="Skill level"></th>
              <th title="Spanish speaker">Spa</th>
              <th title="Technician"></th>
              <th title="Day hours">{dayToString(day, 'medium')}</th>
              <th title="Week hours">Week</th>
              <th title="Hours requested">Req</th>
              <th title="Available"></th>
              {blocks.map((block, blockIndex) => (
                <th
                  key={block.id}
                  style={{
                    background: block.color,
                    borderLeftWidth: blockIndex === 0 ? '6px' : '1px',
                    borderRightWidth: blockIndex === blocks.length - 1 ? '6px' : '1px',
                  }}
                ></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {technicians.map((technician, index) => (
              <tr key={technician.id}>
                <td style={{ background: technician.bg_color, color: technician.text_color, textAlign: 'center' }}>
                  {index + 1}
                </td>
                <td style={{ background: skillLevelColor(technician.skill_level), textAlign: 'center' }}>
                  {technician.skill_level}
                </td>
                <td
                  style={{
                    textAlign: 'center',
                    verticalAlign: 'middle',
                  }}
                >
                  {technician.spanish_speaking && (
                    <span className="material-symbols-outlined text-color-green text-size-sm display-block">check</span>
                  )}
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
                <td style={{ textAlign: 'center' }}>{technician.computed_properties?.total_hours_by_day[day]}</td>
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
                {blocks.map((block, blockIndex) => (
                  <React.Fragment key={block.id}>{renderBlock(technician, block, blockIndex)}</React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {technicianForm.technician && (
        <RadixDialog
          asDrawer
          title={`Update Technician`}
          open={technicianForm.open}
          onOpenChange={(open) => setTechnicianForm({ ...technicianForm, open, technician: undefined })}
        >
          <div className="p-6">
            <h3 className="mb-4">Update Technician</h3>
            <TechnicianForm
              technician={technicianForm.technician}
              onCancel={() => {
                setTechnicianForm({ ...technicianForm, open: false, technician: undefined });
              }}
              onUpdate={onUpdateTechnician}
              onDelete={onDeleteTechnician}
            />
          </div>
        </RadixDialog>
      )}
    </>
  );
};
