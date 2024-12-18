import clsx from 'clsx';
import React from 'react';
import { AvailabilityModel, BlockModel, TechnicianModel } from '~/api';
import { Block } from '~/types/Block';
import { Technician } from '~/types/Technician';
import { Card, Container } from '~/ui';
import { formatTime } from '~/utils/format';
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

  function renderBlockHeaders() {
    return days.map(() =>
      blocks.map((block) => (
        <th key={block.id}>
          {formatTime(block.start_time)}-{formatTime(block.end_time)}
        </th>
      ))
    );
  }

  function renderAvailabilities(technician: Technician) {
    return days.map((day) =>
      blocks.map((block) => (
        <td
          key={block.id}
          className={clsx('TechAvailability__table__block', {
            'TechAvailability__table__block--available': isBlockAvailable(technician, day, block),
          })}
          onClick={() => toggleAvailability(technician, day, block)}
        ></td>
      ))
    );
  }

  function renderBlockTotals() {
    return days.map((day) =>
      blocks.map((block) => (
        <td key={block.id} className="TechAvailability__table__block__count">
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
                  <th key={day} colSpan={3}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][day]}
                  </th>
                ))}
                <th>Req Hrs</th>
              </tr>
              <tr>
                <th colSpan={3}></th>
                {renderBlockHeaders()}
                <th></th>
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
                  <td>{technician.skill_level}</td>
                  <td>{technician.spansih_speaking ? 'Yes' : 'No'}</td>
                  {renderAvailabilities(technician)}
                  <td>{technician.requested_hours}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}></td>
                {renderBlockTotals()}
                <td>{totalRequestedHours()}</td>
              </tr>
            </tfoot>
          </table>
        </Card>
      </Container>
    </>
  );
};
