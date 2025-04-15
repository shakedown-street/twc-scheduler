import { Helmet } from 'react-helmet';
import { TechnicianHours } from '~/components/TechnicianHours/TechnicianHours';
import { Container } from '~/ui';
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
          <TechnicianHours subList />
        </div>
      </Container>
    </>
  );
};
