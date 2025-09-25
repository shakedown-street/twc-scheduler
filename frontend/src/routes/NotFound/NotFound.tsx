import { Button, Card, Container } from '@/ui';
import { Helmet } from 'react-helmet';

export const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="centerPage">
          <Card fluid>
            <h1 className="mb-4 text-center">Page Not Found</h1>
            <Button color="primary" fluid navigateTo="/">
              Go home
            </Button>
          </Card>
        </div>
      </Container>
    </>
  );
};
