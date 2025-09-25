import { ClientsOverview } from '@/components/ClientsOverview/ClientsOverview';
import { ClientTechnicianMatrix } from '@/components/ClientTechnicianMatrix/ClientTechnicianMatrix';
import { TechniciansOverview } from '@/components/TechniciansOverview/TechniciansOverview';
import { Container, TabItem, Tabs } from '@/ui';
import { Helmet } from 'react-helmet';
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
      <Helmet>
        <title>Overview | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="mt-4 mb-12">
          <h1>Overview</h1>
          <Tabs className="mb-4">
            <TabItem active={getTab() === 'appointments'} onClick={() => setTab('appointments')}>
              Appointments
            </TabItem>
            <TabItem active={getTab() === 'matrix'} onClick={() => setTab('matrix')}>
              Matrix
            </TabItem>
          </Tabs>
          <div>
            {getTab() === 'appointments' && (
              <div className="flex gap-2">
                <ClientsOverview />
                <TechniciansOverview />
              </div>
            )}
            {getTab() === 'matrix' && <ClientTechnicianMatrix />}
          </div>
        </div>
      </Container>
    </>
  );
};
