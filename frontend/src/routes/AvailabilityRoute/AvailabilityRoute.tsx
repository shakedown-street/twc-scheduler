import { ClientAvailability } from '@/components/ClientAvailability/ClientAvailability';
import { TechAvailability } from '@/components/TechAvailability/TechAvailability';
import { TabItem, Tabs } from '@/ui';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';

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
      <Helmet>
        <title>Availability | Schedule Builder</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="mt-4 mb-12">
          <h1>Availability</h1>
          <Tabs className="mb-4">
            <TabItem active={getTab() === 'clients'} onClick={() => setTab('clients')}>
              Clients
            </TabItem>
            <TabItem active={getTab() === 'technicians'} onClick={() => setTab('technicians')}>
              Technicians
            </TabItem>
          </Tabs>
          <div>
            {getTab() === 'clients' && <ClientAvailability />}
            {getTab() === 'technicians' && <TechAvailability />}
          </div>
        </div>
      </div>
    </>
  );
};
