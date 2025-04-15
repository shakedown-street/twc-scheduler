import React from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { TechnicianModel } from '~/api';
import { useBlocks } from '~/contexts/BlocksContext';
import { Block } from '~/types/Block';
import { Technician } from '~/types/Technician';
import { Container, TabItem, Tabs } from '~/ui';
import { getBlockAvailabilities } from '~/utils/appointments';
import { dayColor, skillLevelColor } from '~/utils/color';
import './SubList.scss';

export const SubList = () => {
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const { blocks } = useBlocks();

  const days = [0, 1, 2, 3, 4];

  React.useEffect(() => {
    TechnicianModel.all({
      page_size: 1000,
      expand_availabilities: true,
    }).then((technicians) => {
      setTechnicians(technicians);
    });
  }, []);

  function getTab() {
    const tab = searchParams.get('tab');
    return tab || 'clients';
  }

  function setTab(tab: string) {
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  }

  function getBlockSubAvailabilities(technician: Technician, day: number, block: Block) {
    const blockAvailabilities = getBlockAvailabilities(technician.availabilities || [], day, block);

    return blockAvailabilities.filter((availability) => availability.is_sub);
  }

  function renderBlock(technician: Technician, day: number, block: Block, blockIndex: number) {
    const subAvailabilities = getBlockSubAvailabilities(technician, day, block);

    const borderLeftWidth = blockIndex === 0 ? '6px' : '1px';
    const borderRightWidth = blockIndex === blocks.length - 1 ? '6px' : '1px';

    if (subAvailabilities.length > 0) {
      return (
        <td
          key={block.id}
          style={{
            background: '#eab308',
            borderLeftWidth,
            borderRightWidth,
          }}
        ></td>
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

  return (
    <>
      <Helmet>
        <title>Sub List | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="mt-4 mb-12">
          <h1>Sub List</h1>
          {/* <Tabs className="mb-4">
            <TabItem active={getTab() === 'clients'} onClick={() => setTab('clients')}>
              Clients
            </TabItem>
            <TabItem active={getTab() === 'technicians'} onClick={() => setTab('technicians')}>
              Technicians
            </TabItem>
          </Tabs> */}
          <table className="SubList__table">
            <thead>
              <tr>
                <th>Rating</th>
                <th>Spa</th>
                <th></th>
                {['M', 'T', 'W', 'TH', 'F'].map((day, dayIndex) => (
                  <React.Fragment key={day}>
                    {blocks.map((block, blockIndex) => (
                      <th
                        key={block.id}
                        style={{
                          background: dayColor(dayIndex),
                          borderLeftWidth: blockIndex === 0 ? '6px' : '1px',
                          borderRightWidth: blockIndex === blocks.length - 1 ? '6px' : '1px',
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
              {technicians.map((technician) => (
                <tr key={technician.id}>
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
                      <span className="material-symbols-outlined text-color-green text-size-sm display-block">
                        check
                      </span>
                    )}
                  </td>
                  <td>
                    {technician.first_name} {technician.last_name}
                  </td>
                  {days.map((day) => (
                    <React.Fragment key={day}>
                      {blocks.map((block, blockIndex) => (
                        <React.Fragment key={block.id}>
                          {renderBlock(technician, day, block, blockIndex)}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </>
  );
};
