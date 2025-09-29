import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router';
import { SignUpForm } from '../../components/SignUpForm/SignUpForm';

export const SignUp = () => {
  return (
    <>
      <title>Sign Up | PROJECT_NAME</title>
      <div className="mx-auto my-12 w-full max-w-sm px-4">
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <SignUpForm />
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link className="text-primary font-medium hover:underline" to="/login">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
