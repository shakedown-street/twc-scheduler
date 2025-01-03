import { Helmet } from 'react-helmet';
import { ClientHours } from '~/components/ClientHours/ClientHours';
import { TechnicianHours } from '~/components/TechnicianHours/TechnicianHours';
import { Container } from '~/ui';

export const Sheet1 = () => {
  return (
    <>
      <Helmet>
        <title>Sheet1 | Schedule Builder</title>
      </Helmet>
      <Container className="my-12">
        <TechnicianHours />
        <ClientHours />
      </Container>
    </>
  );
};
