import clsx from 'clsx';
import React from 'react';
import { BlockModel, TechnicianModel } from '~/api';
import { AvailabilityForm } from '~/components/AvailabilityForm/AvailabilityForm';
import { TechnicianForm } from '~/components/TechnicianForm/TechnicianForm';
import { Availability } from '~/types/Availability';
import { Block } from '~/types/Block';
import { Technician } from '~/types/Technician';
import { Button, Card, RadixDialog, Spinner } from '~/ui';
import { formatTimeShort, isBetweenInclusiveEnd, isBetweenInclusiveStart } from '~/utils/time';
import './TechAvailability.scss';

export const TechAvailability = () => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [blocksLoading, setBlocksLoading] = React.useState(true);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [techniciansLoading, setTechniciansLoading] = React.useState(true);
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

  const days = [0, 1, 2, 3, 4];

  React.useEffect(() => {
    BlockModel.all()
      .then((blocks) => {
        setBlocks(blocks);
      })
      .finally(() => {
        setBlocksLoading(false);
      });
    TechnicianModel.all({
      page_size: 1000,
      expand_availabilities: true,
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

  function getBlockAvailability(technician: Technician, day: number, block: Block) {
    return technician.availabilities?.find(
      (availability) =>
        availability.day === day &&
        isBetweenInclusiveStart(availability.start_time, block.start_time, block.end_time) &&
        isBetweenInclusiveEnd(availability.end_time, block.start_time, block.end_time)
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

  function onCreateAvailability(technician: Technician, created: Availability) {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id === technician.id) {
          t.availabilities = [...(t.availabilities || []), created];
          return t;
        }
        return t;
      })
    );
    closeAvailabilityForm();
  }

  function onUpdateAvailability(technician: Technician, updated: Availability) {
    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id === technician.id) {
          t.availabilities = t.availabilities?.map((a) => (a.id === updated.id ? updated : a));
          return t;
        }
        return t;
      })
    );
    closeAvailabilityForm();
  }

  function onDeleteAvailability(deleted: Availability) {
    setTechnicians((prev) =>
      prev.map((t) => {
        t.availabilities = t.availabilities?.filter((a) => a.id !== deleted.id);
        return t;
      })
    );
    closeAvailabilityForm();
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
              if (blockAvailability) {
                openAvailabilityForm(technician, day, block, blockAvailability);
              } else {
                openAvailabilityForm(technician, day, block);
              }
            }}
          >
            {blockAvailability && (
              <>
                {formatTimeShort(blockAvailability.start_time)}-{formatTimeShort(blockAvailability.end_time)}
              </>
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

  if (blocksLoading || techniciansLoading) {
    return <Spinner className="mt-8" message="Loading technicians" />;
  }

  return (
    <>
      <Card fluid>
        <div className="flex align-center justify-between gap-4 mb-4">
          <h2>Technicians</h2>
          <Button color="primary" onClick={() => setTechnicianForm({ ...technicianForm, open: true })} variant="raised">
            Create Technician
          </Button>
        </div>
        <table className="TechAvailability__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Rating</th>
              <th>Spanish</th>
              {days.map((day) => (
                <th key={day} colSpan={blocks.length}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][day]}
                </th>
              ))}
              <th>Req Hrs</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((technician) => (
              <tr key={technician.id}>
                <td
                  style={{
                    background: technician.bg_color,
                  }}
                >
                  <a href="#" onClick={() => openTechnicianForm(technician)} style={{ color: technician.text_color }}>
                    {technician.first_name} {technician.last_name}
                  </a>
                </td>
                <td
                  style={{
                    textAlign: 'right',
                  }}
                >
                  {technician.skill_level}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {technician.spanish_speaking && (
                    <span className="material-symbols-outlined text-color-green">check</span>
                  )}
                </td>
                {renderAvailabilities(technician)}
                <td style={{ textAlign: 'right' }}>{technician.requested_hours}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}></td>
              {renderBlockTotals()}
              <td style={{ textAlign: 'right' }}>{totalRequestedHours()}</td>
            </tr>
          </tfoot>
        </table>
      </Card>
      <RadixDialog
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
              onCreate={(technician, created) => onCreateAvailability(technician as Technician, created)}
              onUpdate={(technician, updated) => onUpdateAvailability(technician as Technician, updated)}
              onDelete={(deleted) => onDeleteAvailability(deleted)}
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
