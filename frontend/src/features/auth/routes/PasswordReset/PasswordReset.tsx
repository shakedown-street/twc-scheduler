import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router';
import { PasswordResetForm } from '../../components/PasswordResetForm/PasswordResetForm';

export const PasswordReset = () => {
  return (
    <>
      <title>Password Reset | PROJECT_NAME</title>
      <div className="mx-auto my-12 w-full max-w-sm px-4">
        <Card>
          <CardHeader>
            <CardTitle>Password Reset</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordResetForm />
            <Link className="text-primary mt-4 block text-center text-sm font-medium hover:underline" to="/login">
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
