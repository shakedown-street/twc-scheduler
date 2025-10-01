import { ClientModel } from '@/api';
import { AvailabilityForm } from '@/components/AvailabilityForm/AvailabilityForm';
import { ClientForm } from '@/components/ClientForm/ClientForm';
import { useBlocks } from '@/contexts/BlocksContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { isFullBlock } from '@/utils/appointments';
import { skillLevelColor } from '@/utils/color';
import { availableHours } from '@/utils/computedProperties';
import { orderByFirstName } from '@/utils/order';
import { checkTimeIntersection, formatTimeShort } from '@/utils/time';
import { AlertTriangle, Check, Loader, MapPin } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

const TableHeader = ({ children, className, ...props }: React.ComponentProps<'th'>) => {
  return (
    <th className={cn('border border-black p-1 text-left text-[10px]', className)} {...props}>
      {children}
    </th>
  );
};

const TableCell = ({ children, className, ...props }: React.ComponentProps<'td'>) => {
  return (
    <td className={cn('border border-black p-1 text-xs', className)} {...props}>
      {children}
    </td>
  );
};

export const ClientAvailability = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = React.useState(true);
  const [showInClinicOnly, setShowInClinicOnly] = React.useState(false);
  const [clientForm, setClientForm] = React.useState<{
    open: boolean;
    client?: Client;
  }>({
    open: false,
    client: undefined,
  });
  const [availabilityForm, setAvailabilityForm] = React.useState<{
    open: boolean;
    instance?: Availability;
    object?: Client;
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
    setClientsLoading(true);

    const fetchClients = () => {
      ClientModel.all({
        page_size: 1000,
        expand_availabilities: true,
      })
        .then((clients) => {
          setClients(orderByFirstName<Client>(clients));
        })
        .finally(() => {
          setClientsLoading(false);
        });
    };

    // Poll every minute
    const pollInterval = setInterval(() => {
      fetchClients();
    }, 60 * 1000);

    // Initial fetch
    fetchClients();

    return () => clearInterval(pollInterval);
  }, []);

  function totalPrescribedHours() {
    return clients.reduce((total, client) => total + (client.prescribed_hours || 0), 0);
  }

  function totalAvailableHours() {
    return clients.reduce((total, client) => total + (availableHours(client) || 0), 0);
  }

  function getBlockAvailability(client: Client, day: number, block: Block) {
    return client.availabilities?.find(
      (availability) =>
        availability.day === day &&
        checkTimeIntersection(availability.start_time, availability.end_time, block.start_time, block.end_time) &&
        (!showInClinicOnly || availability.in_clinic),
    );
  }

  function countClientsAvailableForBlock(day: number, block: Block) {
    return clients.filter((client) => !!getBlockAvailability(client, day, block)).length;
  }

  function openClientForm(client: Client | undefined = undefined) {
    setClientForm({
      ...clientForm,
      open: true,
      client,
    });
  }

  function closeClientForm() {
    setClientForm({
      ...clientForm,
      open: false,
      client: undefined,
    });
  }

  function onCreateClient(created: Client) {
    setClients((prev) => {
      return [...prev, created].sort((a, b) => a.first_name.localeCompare(b.first_name));
    });
    closeClientForm();
  }

  function onUpdateClient(updated: Client) {
    setClients(clients.map((c) => (c.id === updated.id ? Object.assign({}, c, updated) : c)));
    closeClientForm();
  }

  function onDeleteClient(deleted: Client) {
    setClients(clients.filter((c) => c.id !== deleted.id));
    closeClientForm();
  }

  function openAvailabilityForm(
    client: Client,
    day: number,
    block: Block,
    instance: Availability | undefined = undefined,
  ) {
    setAvailabilityForm({
      ...availabilityForm,
      open: true,
      instance,
      object: client,
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

  function refetchClient(client: Client) {
    return ClientModel.get(client.id, {
      expand_availabilities: true,
    }).then((clientUpdated) => {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === client.id) {
            c = clientUpdated.data;
            return c;
          }
          return c;
        }),
      );
      closeAvailabilityForm();
    });
  }

  function renderAvailabilities(client: Client) {
    return days.map((day) =>
      blocks.map((block, index) => {
        const blockAvailability = getBlockAvailability(client, day, block);

        return (
          <TableCell
            key={block.id}
            className={cn('w-18 cursor-pointer bg-gray-400 text-black', {
              'border-l-6': index === 0,
              'border-r-6': index === blocks.length - 1,
            })}
            style={{
              background: blockAvailability ? block.color : undefined,
            }}
            onClick={() => {
              if (!user?.is_superuser) {
                return;
              }
              if (blockAvailability) {
                openAvailabilityForm(client, day, block, blockAvailability);
              } else {
                openAvailabilityForm(client, day, block);
              }
            }}
          >
            {blockAvailability && (
              <div className="flex items-center gap-1">
                <div className="text-nowrap">
                  {formatTimeShort(blockAvailability.start_time)}-{formatTimeShort(blockAvailability.end_time)}
                </div>
                {blockAvailability.in_clinic && <MapPin size="14" />}
                {!isFullBlock(blockAvailability, block) && <AlertTriangle className="text-red-700" size="14" />}
              </div>
            )}
          </TableCell>
        );
      }),
    );
  }

  function renderBlockTotals() {
    return days.map((day) =>
      blocks.map((block) => (
        <TableCell
          key={block.id}
          className={cn('bg-green-100 text-right text-black', {
            'border-l-6': block.id === 1,
            'border-r-6': block.id === blocks.length,
          })}
        >
          {countClientsAvailableForBlock(day, block)}
        </TableCell>
      )),
    );
  }

  if (clientsLoading) {
    return (
      <div className="mt-12 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Clients</h2>
        {user?.is_superuser && (
          <Button onClick={() => setClientForm({ ...clientForm, open: true })}>Create Client</Button>
        )}
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Checkbox
          checked={showInClinicOnly}
          id="in_clinic_filter"
          onCheckedChange={() => setShowInClinicOnly(!showInClinicOnly)}
        />
        <Label htmlFor="in_clinic_filter">In clinic only</Label>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <TableHeader className="[writing-mode:vertical-rl]"></TableHeader>
            <TableHeader title="Client" className="[writing-mode:vertical-rl]"></TableHeader>
            <TableHeader title="Skill level requirement" className="[writing-mode:vertical-rl]">
              Rating
            </TableHeader>
            <TableHeader title="Spanish speaker" className="[writing-mode:vertical-rl]">
              Spa
            </TableHeader>
            <TableHeader title="Evaluation done" className="[writing-mode:vertical-rl]">
              Eval
            </TableHeader>
            <TableHeader title="Currently onboarding" className="[writing-mode:vertical-rl]">
              Onboard
            </TableHeader>
            <TableHeader title="Prescribed hours" className="[writing-mode:vertical-rl]">
              Rx
            </TableHeader>
            <TableHeader title="Total available hours" className="[writing-mode:vertical-rl]">
              Avail
            </TableHeader>
            {days.map((day) => (
              <TableHeader className="border-x-6" key={day} colSpan={blocks.length}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][day]}
              </TableHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={client.id} className="hover:bg-border">
              <TableCell>{index + 1}</TableCell>
              <TableCell className="text-nowrap">
                <a
                  className="text-primary cursor-pointer"
                  onClick={() => {
                    if (!user?.is_superuser) {
                      return;
                    }
                    openClientForm(client);
                  }}
                >
                  {client.first_name} {client.last_name}
                </a>
              </TableCell>
              <TableCell
                className="text-center text-black"
                style={{
                  background: skillLevelColor(client.req_skill_level),
                }}
              >
                {client.req_skill_level}
              </TableCell>
              <TableCell className="text-center">
                {client.req_spanish_speaking && <Check className="text-green-700" size="14" />}
              </TableCell>
              <TableCell className="text-center">
                {client.eval_done && <Check className="text-green-700" size="14" />}
              </TableCell>
              <TableCell className="text-center">
                {client.is_onboarding && <Check className="text-green-700" size="14" />}
              </TableCell>
              <TableCell>{client.prescribed_hours}</TableCell>
              <TableCell>{availableHours(client)}</TableCell>
              {renderAvailabilities(client)}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="hover:bg-border">
            <TableCell colSpan={6}></TableCell>
            <TableCell>{totalPrescribedHours()}</TableCell>
            <TableCell>{totalAvailableHours()}</TableCell>
            {renderBlockTotals()}
          </tr>
        </tfoot>
      </table>
      <Sheet open={clientForm.open} onOpenChange={(open) => setClientForm({ ...clientForm, open, client: undefined })}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{clientForm.client ? 'Update' : 'Create'} Client</SheetTitle>
          </SheetHeader>
          <ClientForm
            client={clientForm.client}
            onCancel={() => {
              setClientForm({ ...clientForm, open: false, client: undefined });
            }}
            onCreate={onCreateClient}
            onDelete={onDeleteClient}
            onUpdate={onUpdateClient}
          />
        </SheetContent>
      </Sheet>
      <Dialog
        open={availabilityForm.open}
        onOpenChange={(open) => {
          if (!open) {
            closeAvailabilityForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{availabilityForm.instance ? 'Update' : 'Create'} Availability</DialogTitle>
          </DialogHeader>
          {availabilityForm.object && (
            <AvailabilityForm
              contentType="client"
              onCreate={(client) => refetchClient(client as Client)}
              onUpdate={(client) => refetchClient(client as Client)}
              onDelete={(client) => refetchClient(client as Client)}
              instance={availabilityForm.instance}
              object={availabilityForm.object}
              day={availabilityForm.day}
              initialStartTime={availabilityForm.initialStartTime}
              initialEndTime={availabilityForm.initialEndTime}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
