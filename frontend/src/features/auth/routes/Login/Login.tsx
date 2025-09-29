import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '../../components/LoginForm/LoginForm';

export const Login = () => {
  return (
    <>
      <title>Login | PROJECT_NAME</title>
      <div className="mx-auto my-12 w-full max-w-sm px-4">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
            {/* <div className="mt-4 text-center text-sm">
              Don't have an account?{' '}
              <Link className="text-primary font-medium hover:underline" to="/sign-up">
                Sign Up
              </Link>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
