import React from 'react';
import { Helmet } from 'react-helmet';
import { AppointmentModel, ClientModel } from '~/api';
import { CreateAppointment, CreateAppointmentProps } from '~/components/CreateAppointment/CreateAppointment';
import { TimeSlotTable } from '~/components/TimeSlotTable/TimeSlotTable';
import { Client } from '~/types/Client';
import { Container, TabItem, Tabs } from '~/ui';
import './Home.scss';

export const Home = () => {
  const [day, setDay] = React.useState(0);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [createAppointmentDialog, setCreateAppointmentDialog] = React.useState<CreateAppointmentProps>({
    client: undefined,
    day: 0,
    block: undefined,
    open: false,
    onOpenChange: (open: boolean) => {
      setCreateAppointmentDialog((prev) => ({ ...prev, open }));
    },
    onSuccess: () => {
      ClientModel.all({
        expand_appointments: true,
        expand_availabilities: true,
      }).then((clients) => {
        setClients(clients);
      });
      setCreateAppointmentDialog((prev) => ({ ...prev, open: false }));
    },
    title: 'Create Appointment',
  });

  React.useEffect(() => {
    ClientModel.all({
      expand_appointments: true,
      expand_availabilities: true,
    }).then((clients) => {
      setClients(clients);
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Home | Schedule Builder</title>
      </Helmet>
      <Container>
        <Tabs className="my-4">
          <TabItem active={day === 0} onClick={() => setDay(0)}>
            Monday
          </TabItem>
          <TabItem active={day === 1} onClick={() => setDay(1)}>
            Tuesday
          </TabItem>
          <TabItem active={day === 2} onClick={() => setDay(2)}>
            Wednesday
          </TabItem>
          <TabItem active={day === 3} onClick={() => setDay(3)}>
            Thursday
          </TabItem>
          <TabItem active={day === 4} onClick={() => setDay(4)}>
            Friday
          </TabItem>
        </Tabs>

        <TimeSlotTable
          clients={clients}
          day={day}
          onClickBlockSlot={({ client, block }) =>
            setCreateAppointmentDialog({
              ...createAppointmentDialog,
              open: true,
              client,
              day,
              block,
            })
          }
          onDeleteAppointment={(appointment) => {
            AppointmentModel.delete(appointment.id).then(() => {
              ClientModel.all({
                expand_appointments: true,
                expand_availabilities: true,
              }).then((clients) => {
                setClients(clients);
              });
            });
          }}
        />
      </Container>
      <CreateAppointment {...createAppointmentDialog} />
    </>
  );
};
