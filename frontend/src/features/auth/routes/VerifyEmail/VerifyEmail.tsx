import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { http } from '@/lib/http';
import React from 'react';
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
      <title>Verify Email | Schedule Builder</title>
      <div className="container mx-auto px-4">
        <div className="centerPage">
          <Card>
            <CardHeader>
              <CardTitle>Verify Email</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="form-error text-center">{error}</div>
              ) : (
                <div className="text-center">
                  Your account email has been verified.{' '}
                  <Link className="text-primary font-medium" to="/login">
                    Click here
                  </Link>{' '}
                  to login.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
