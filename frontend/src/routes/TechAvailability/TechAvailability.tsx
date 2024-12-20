import clsx from 'clsx';
import React from 'react';
import { AvailabilityModel, BlockModel, TechnicianModel } from '~/api';
import { Block } from '~/types/Block';
import { Technician } from '~/types/Technician';
import { Card, Container } from '~/ui';
import { formatTimeShort } from '~/utils/time';
import './TechAvailability.scss';

export const TechAvailability = () => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);

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

  function totalRequestedHours() {
    return technicians.reduce((total, technician) => total + (technician.requested_hours || 0), 0);
  }

  function isBlockAvailable(technician: Technician, day: number, block: Block) {
    return technician.availabilities?.some(
      (availability) => availability.day === day && availability.block === block.id
    );
  }

  function toggleAvailability(technician: Technician, day: number, block: Block) {
    if (isBlockAvailable(technician, day, block)) {
      const availability = technician.availabilities?.find(
        (availability) => availability.day === day && availability.block === block.id
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
        block: block.id,
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
        <h1 className="my-8">Technician Availability</h1>
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
                    {technician.first_name} {technician.last_name}
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
    </>
  );
};
