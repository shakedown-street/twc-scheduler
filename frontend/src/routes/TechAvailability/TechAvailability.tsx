import clsx from 'clsx';
import React from 'react';
import { AvailabilityModel, BlockModel, TechnicianModel } from '~/api';
import { TechnicianForm } from '~/components/TechnicianForm/TechnicianForm';
import { Block } from '~/types/Block';
import { Technician } from '~/types/Technician';
import { Button, Card, Container, RadixDialog } from '~/ui';
import { formatTimeShort } from '~/utils/time';
import './TechAvailability.scss';

export const TechAvailability = () => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [technicianForm, setTechnicianForm] = React.useState<{
    open: boolean;
    technician: Technician | undefined;
  }>({
    open: false,
    technician: undefined,
  });

  const days = [0, 1, 2, 3, 4];

  React.useEffect(() => {
    BlockModel.all().then((blocks) => {
      setBlocks(blocks);
    });
    TechnicianModel.all({
      expand_availabilities: true,
    }).then((technicians) => {
      setTechnicians(technicians);
    });
  }, []);

  function openTechnicianForm(technician: Technician | undefined = undefined) {
    setTechnicianForm({
      ...technicianForm,
      open: true,
      technician,
    });
  }

  function onCreate(technician: Technician) {
    const copySorted = [...technicians, technician].sort((a, b) => a.first_name.localeCompare(b.first_name));

    setTechnicians(copySorted);
    setTechnicianForm({ ...technicianForm, open: false, technician: undefined });
  }

  function onUpdate(updated: Technician) {
    setTechnicians(technicians.map((c) => (c.id === updated.id ? Object.assign({}, c, updated) : c)));
    setTechnicianForm({ ...technicianForm, open: false, technician: undefined });
  }

  function onDelete(deleted: Technician) {
    setTechnicians(technicians.filter((c) => c.id !== deleted.id));
    setTechnicianForm({ ...technicianForm, open: false, technician: undefined });
  }

  function totalRequestedHours() {
    return technicians.reduce((total, technician) => total + (technician.requested_hours || 0), 0);
  }

  function isBlockAvailable(technician: Technician, day: number, block: Block) {
    return technician.availabilities?.some(
      (availability) =>
        availability.day === day &&
        availability.start_time === block.start_time &&
        availability.end_time === block.end_time
    );
  }

  function toggleAvailability(technician: Technician, day: number, block: Block) {
    if (isBlockAvailable(technician, day, block)) {
      const availability = technician.availabilities?.find(
        (availability) =>
          availability.day === day &&
          availability.start_time === block.start_time &&
          availability.end_time === block.end_time
      );

      if (!availability) {
        return;
      }

      AvailabilityModel.delete(availability.id).then(() => {
        technician.availabilities = technician.availabilities?.filter((a) => a.id !== availability.id);
        setTechnicians([...technicians]);
      });
    } else {
      AvailabilityModel.create({
        content_type: 14, // TODO: don't hardcode this!!!
        object_id: technician.id,
        day: day,
        start_time: block.start_time,
        end_time: block.end_time,
      }).then((availability) => {
        technician.availabilities = [...(technician.availabilities || []), availability.data];
        setTechnicians([...technicians]);
      });
    }
  }

  function countTechniciansAvailableForBlock(day: number, block: Block) {
    return technicians.filter((technician) => isBlockAvailable(technician, day, block)).length;
  }

  function renderAvailabilities(technician: Technician) {
    return days.map((day) =>
      blocks.map((block, index) => (
        <td
          key={block.id}
          className={clsx('TechAvailability__table__block', {
            'TechAvailability__table__block--first': index === 0,
            'TechAvailability__table__block--last': index === blocks.length - 1,
          })}
          style={{
            backgroundColor: isBlockAvailable(technician, day, block) ? block.color : undefined,
          }}
          onClick={() => toggleAvailability(technician, day, block)}
        >
          {isBlockAvailable(technician, day, block) && (
            <>
              {formatTimeShort(block.start_time)}-{formatTimeShort(block.end_time)}
            </>
          )}
        </td>
      ))
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

  return (
    <>
      <Container>
        <div className="flex align-center justify-between gap-4 my-8">
          <h1>Technician Availability</h1>
          <Button color="primary" onClick={() => setTechnicianForm({ ...technicianForm, open: true })} variant="raised">
            Create Technician
          </Button>
        </div>
        <Card fluid>
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
                      backgroundColor: technician.color,
                    }}
                  >
                    <a href="#" onClick={() => openTechnicianForm(technician)} style={{ color: 'black' }}>
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
      </Container>
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
            onCreate={onCreate}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </div>
      </RadixDialog>
    </>
  );
};
