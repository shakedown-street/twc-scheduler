import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { PasswordResetForm } from '../../components/PasswordResetForm/PasswordResetForm';

export const PasswordReset = () => {
  return (
    <>
      <Helmet>
        <title>Password Reset | Schedule Builder</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="centerPage">
          <Card>
            <CardHeader>
              <CardTitle>Password Reset</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordResetForm />
              <Link className="mt-6 block text-center" to="/login">
                Back to Login
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
