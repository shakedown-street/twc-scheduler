import { ClientsOverview } from '@/components/ClientsOverview/ClientsOverview';
import { ClientTechnicianMatrix } from '@/components/ClientTechnicianMatrix/ClientTechnicianMatrix';
import { TechniciansOverview } from '@/components/TechniciansOverview/TechniciansOverview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';

export const Overview = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  function getTab() {
    const tab = searchParams.get('tab');
    return tab || 'appointments';
  }

  function setTab(tab: string) {
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  }

  return (
    <>
      <title>Overview | Schedule Builder</title>
      <div className="container mx-auto px-4">
        <div className="mt-4 mb-12">
          <h1 className="mb-4 text-2xl font-bold">Overview</h1>
          <Tabs onValueChange={setTab} value={getTab()}>
            <TabsList>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="matrix">Matrix</TabsTrigger>
            </TabsList>
            <TabsContent value="appointments">
              <div className="flex gap-2">
                <ClientsOverview />
                <TechniciansOverview />
              </div>
            </TabsContent>
            <TabsContent value="matrix">
              <ClientTechnicianMatrix />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};
