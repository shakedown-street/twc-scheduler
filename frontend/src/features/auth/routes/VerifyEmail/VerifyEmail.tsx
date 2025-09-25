import { http } from '@/http';
import { Card, Container } from '@/ui';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';

export const VerifyEmail = () => {
  const [error, setError] = React.useState('');

  const { uid, token } = useParams();

  React.useEffect(() => {
    setError('');
    http
      .post('/api/verify-email/', { uid, token })
      .then(() => {})
      .catch((err) => {
        const { detail, non_field_errors } = err.response.data;

        if (detail) {
          setError(detail);
        } else if (non_field_errors) {
          setError(non_field_errors[0]);
        } else {
          setError('An error occurred. Please try again.');
        }
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Verify Email | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="centerPage">
          <Card fluid>
            <h1 className="mb-4 text-center">Verify Email</h1>
            {error ? (
              <p className="error text-center">{error}</p>
            ) : (
              <p className="text-center">
                Your account email has been verified. <Link to="/login">Click here</Link> to login.
              </p>
            )}
          </Card>
        </div>
      </Container>
    </>
  );
};
