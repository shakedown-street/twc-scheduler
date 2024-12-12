import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { Card, Container } from '~/ui';
import { PasswordResetConfirmForm } from '../../components/PasswordResetConfirmForm/PasswordResetConfirmForm';

export const PasswordResetConfirm = () => {
  const { uid, token } = useParams();

  return (
    <>
      <Helmet>
        <title>Password Reset | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="centerPage">
          <Card fluid>
            <h1 className="mb-4 text-center">Password Reset</h1>
            <h4 className="mb-4 text-center">Create a new password.</h4>
            <PasswordResetConfirmForm uid={uid} token={token} />
          </Card>
        </div>
      </Container>
    </>
  );
};
