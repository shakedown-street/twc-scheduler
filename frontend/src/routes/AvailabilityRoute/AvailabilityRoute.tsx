import { ClientAvailability } from '@/components/ClientAvailability/ClientAvailability';
import { TechAvailability } from '@/components/TechAvailability/TechAvailability';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router';

export const AvailabilityRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  function getTab() {
    const tab = searchParams.get('tab');
    return tab || 'clients';
  }

  function setTab(tab: string) {
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  }

  return (
    <>
      <title>Availability | Schedule Builder</title>
      <div className="container mx-auto mt-4 mb-12 px-4">
        <h1 className="mb-4 text-2xl font-bold">Availability</h1>
        <Tabs onValueChange={setTab} value={getTab()}>
          <TabsList>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="technicians">Technicians</TabsTrigger>
          </TabsList>
          <TabsContent value="clients">
            <ClientAvailability />
          </TabsContent>
          <TabsContent value="technicians">
            <TechAvailability />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
