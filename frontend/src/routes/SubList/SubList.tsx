import { ClientTechnicianHistory } from '@/components/ClientTechnicianHistory/ClientTechnicianHistory';
import { TechniciansOverview } from '@/components/TechniciansOverview/TechniciansOverview';

export const SubList = () => {
  return (
    <>
      <title>Sub List | Schedule Builder</title>
      <div className="container mx-auto mt-4 mb-12 px-4">
        <h1 className="mb-4 text-2xl font-bold">Sub List</h1>
        <div className="flex items-start gap-4">
          <TechniciansOverview isSubList showLegend={false} />
          <ClientTechnicianHistory />
        </div>
      </div>
    </>
  );
};
