import { Card, Container } from '@/ui';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { PasswordResetForm } from '../../components/PasswordResetForm/PasswordResetForm';

export const PasswordReset = () => {
  return (
    <>
      <Helmet>
        <title>Password Reset | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="centerPage">
          <Card fluid>
            <h1 className="mb-4 text-center">Password Reset</h1>
            <PasswordResetForm />
            <Link className="display-block mt-6 text-center" to="/login">
              Back to Login
            </Link>
          </Card>
        </div>
      </Container>
    </>
  );
};
