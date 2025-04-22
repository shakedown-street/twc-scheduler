import clsx from 'clsx';
import React from 'react';
import { TechnicianModel } from '~/api';
import { AvailabilityForm } from '~/components/AvailabilityForm/AvailabilityForm';
import { TechnicianForm } from '~/components/TechnicianForm/TechnicianForm';
import { useBlocks } from '~/contexts/BlocksContext';
import { useAuth } from '~/features/auth/contexts/AuthContext';
import { Availability } from '~/types/Availability';
import { Block } from '~/types/Block';
import { Technician } from '~/types/Technician';
import { Button, Card, Checkbox, RadixDialog, Spinner } from '~/ui';
import { isFullBlock } from '~/utils/appointments';
import { skillLevelColor } from '~/utils/color';
import { formatTimeShort, isBetweenInclusiveEnd, isBetweenInclusiveStart } from '~/utils/time';
import './TechAvailability.scss';

export const TechAvailability = () => {
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [techniciansLoading, setTechniciansLoading] = React.useState(true);
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
  const { blocks } = useBlocks();

  const days = [0, 1, 2, 3, 4];

  React.useEffect(() => {
    setTechniciansLoading(true);
    TechnicianModel.all({
      page_size: 1000,
      expand_availabilities: true,
      expand_properties: true,
    })
      .then((technicians) => {
        setTechnicians(technicians);
      })
      .finally(() => {
        setTechniciansLoading(false);
      });
  }, []);

  function totalRequestedHours() {
    return technicians.reduce((total, technician) => total + (technician.requested_hours || 0), 0);
  }

  function totalAvailableHours() {
    return technicians.reduce(
      (total, technician) => total + (technician.computed_properties?.total_hours_available || 0),
      0
    );
  }

  function getBlockAvailability(technician: Technician, day: number, block: Block) {
    return technician.availabilities?.find(
      (availability) =>
        availability.day === day &&
        isBetweenInclusiveStart(availability.start_time, block.start_time, block.end_time) &&
        isBetweenInclusiveEnd(availability.end_time, block.start_time, block.end_time) &&
        (!showSubOnly || availability.is_sub)
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
    instance: Availability | undefined = undefined
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
        })
      );
      closeAvailabilityForm();
    });
  }

  function renderAvailabilities(technician: Technician) {
    return days.map((day) =>
      blocks.map((block, index) => {
        const blockAvailability = getBlockAvailability(technician, day, block);

        return (
          <td
            key={block.id}
            className={clsx('TechAvailability__table__block', {
              'TechAvailability__table__block--first': index === 0,
              'TechAvailability__table__block--last': index === blocks.length - 1,
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
              <div className="flex align-center gap-1">
                <div className="text-nowrap">
                  {formatTimeShort(blockAvailability.start_time)}-{formatTimeShort(blockAvailability.end_time)}
                </div>
                {blockAvailability.is_sub && (
                  <span className="material-symbols-outlined text-size-sm" title="Sub only">
                    swap_horiz
                  </span>
                )}
                {!isFullBlock(blockAvailability, block) && (
                  <span className="material-symbols-outlined text-color-red text-size-sm" title="Partially available">
                    warning
                  </span>
                )}
              </div>
            )}
          </td>
        );
      })
    );
  }

  function renderBlockTotals() {
    return days.map((day) =>
      blocks.map((block) => (
        <td
          key={block.id}
          className={clsx('TechAvailability__table__block__count', {
            'TechAvailability__table__block--first': block.id === 1,
            'TechAvailability__table__block--last': block.id === blocks.length,
          })}
          style={{ textAlign: 'right' }}
        >
          {countTechniciansAvailableForBlock(day, block)}
        </td>
      ))
    );
  }

  if (techniciansLoading) {
    return <Spinner className="mt-8" message="Loading technicians" />;
  }

  return (
    <>
      <Card fluid>
        <div className="flex align-center justify-between gap-4 mb-4">
          <h2>Technicians</h2>
          {user?.is_superuser && (
            <Button
              color="primary"
              onClick={() => setTechnicianForm({ ...technicianForm, open: true })}
              variant="raised"
            >
              Create Technician
            </Button>
          )}
        </div>
        <div className="flex align-center gap-4 mb-4">
          <Checkbox checked={showSubOnly} onChange={() => setShowSubOnly(!showSubOnly)} label="Sub only" />
        </div>
        <table className="TechAvailability__table">
          <thead>
            <tr>
              <th className="ClientAvailability__table--vertical"></th>
              <th className="ClientAvailability__table--vertical" title="Name"></th>
              <th className="ClientAvailability__table--vertical" title="Skill level">
                Rating
              </th>
              <th className="ClientAvailability__table--vertical" title="Spanish speaker">
                Spa
              </th>
              <th className="ClientAvailability__table--vertical" title="Requested hours">
                Req
              </th>
              <th className="ClientAvailability__table--vertical" title="Total available hours">
                Avail
              </th>
              {days.map((day) => (
                <th key={day} colSpan={blocks.length} className="TechAvailability__table__boldBorder">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {technicians.map((technician, index) => (
              <tr key={technician.id}>
                <td>{index + 1}</td>
                <td
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
                </td>
                <td
                  style={{
                    background: skillLevelColor(technician.skill_level),
                    textAlign: 'center',
                  }}
                >
                  {technician.skill_level}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {technician.spanish_speaking && (
                    <span className="material-symbols-outlined text-color-green text-size-sm">check</span>
                  )}
                </td>
                <td>{technician.requested_hours}</td>
                <td>{technician.computed_properties?.total_hours_available}</td>
                {renderAvailabilities(technician)}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}></td>
              <td>{totalRequestedHours()}</td>
              <td>{totalAvailableHours()}</td>
              {renderBlockTotals()}
            </tr>
          </tfoot>
        </table>
      </Card>
      <RadixDialog
        asDrawer
        title={`${technicianForm.technician ? 'Update' : 'Create'} Technician`}
        open={technicianForm.open}
        onOpenChange={(open) => setTechnicianForm({ ...technicianForm, open, technician: undefined })}
      >
        <div className="p-6">
          <h3 className="mb-4">{technicianForm.technician ? 'Update' : 'Create'} Technician</h3>
          <TechnicianForm
            technician={technicianForm.technician}
            onCancel={() => {
              setTechnicianForm({ ...technicianForm, open: false, technician: undefined });
            }}
            onCreate={onCreateTechnician}
            onUpdate={onUpdateTechnician}
            onDelete={onDeleteTechnician}
          />
        </div>
      </RadixDialog>
      <RadixDialog
        title={`${availabilityForm.instance ? 'Update' : 'Create'} Availability`}
        open={availabilityForm.open}
        onOpenChange={(open) => {
          if (!open) {
            closeAvailabilityForm();
          }
        }}
      >
        <div className="p-6">
          <h3 className="mb-4">{availabilityForm.instance ? 'Update' : 'Create'} Availability</h3>
          {availabilityForm.object && (
            <AvailabilityForm
              contentType="technician"
              onCreate={(technician, _) => refetchTechnician(technician as Technician)}
              onUpdate={(technician, _) => refetchTechnician(technician as Technician)}
              onDelete={(technician, _) => refetchTechnician(technician as Technician)}
              instance={availabilityForm.instance}
              object={availabilityForm.object}
              day={availabilityForm.day}
              initialStartTime={availabilityForm.initialStartTime}
              initialEndTime={availabilityForm.initialEndTime}
            />
          )}
        </div>
      </RadixDialog>
    </>
  );
};
