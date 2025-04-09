import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { ClientHours } from '~/components/ClientHours/ClientHours';
import { ClientTechnicianMatrix } from '~/components/ClientTechnicianMatrix/ClientTechnicianMatrix';
import { TechnicianHours } from '~/components/TechnicianHours/TechnicianHours';
import { Container, TabItem, Tabs } from '~/ui';

export const Overview = () => {
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
        <title>Overview | Schedule Builder</title>
      </Helmet>
      <Container className="my-4">
        <Tabs>
          <TabItem active={getTab() === 'clients'} onClick={() => setTab('clients')}>
            Clients
          </TabItem>
          <TabItem active={getTab() === 'technicians'} onClick={() => setTab('technicians')}>
            Technicians
          </TabItem>
          <TabItem active={getTab() === 'matrix'} onClick={() => setTab('matrix')}>
            Matrix
          </TabItem>
        </Tabs>
        <div className="py-4">
          {getTab() === 'clients' && <ClientHours />}
          {getTab() === 'technicians' && <TechnicianHours />}
          {getTab() === 'matrix' && <ClientTechnicianMatrix />}
        </div>
      </Container>
    </>
  );
};
