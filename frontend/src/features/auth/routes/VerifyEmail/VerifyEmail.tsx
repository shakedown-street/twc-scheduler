import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { http } from '@/lib/http';
import { extractError } from '@/utils/errors';
import React from 'react';
import { Link, useParams } from 'react-router';

export const VerifyEmail = () => {
  const [error, setError] = React.useState('');

  const { uid, token } = useParams();

  React.useEffect(() => {
    async function verifyEmail() {
      setError('');

      try {
        await http.post('/api/verify-email/', { uid, token });
      } catch (err) {
        setError(extractError(err));
      }
    }

    verifyEmail();
  }, [uid, token]);

  return (
    <>
      <title>Verify Email | PROJECT_NAME</title>
      <div className="mx-auto my-12 w-full max-w-sm px-4">
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
                <Link className="text-primary font-medium hover:underline" to="/login">
                  Click here
                </Link>{' '}
                to login.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
