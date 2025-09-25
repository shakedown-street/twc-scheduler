import { ClientTechnicianHistory } from '@/components/ClientTechnicianHistory/ClientTechnicianHistory';
import { TechniciansOverview } from '@/components/TechniciansOverview/TechniciansOverview';
import { Container } from '@/ui';
import { Helmet } from 'react-helmet';
import './SubList.scss';

export const SubList = () => {
  return (
    <>
      <Helmet>
        <title>Sub List | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="mt-4 mb-12">
          <h1>Sub List</h1>
          <div className="flex items-start gap-4">
            <TechniciansOverview isSubList showLegend={false} />
            <ClientTechnicianHistory />
          </div>
        </div>
      </Container>
    </>
  );
};
