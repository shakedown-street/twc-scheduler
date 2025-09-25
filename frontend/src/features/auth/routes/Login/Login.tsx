import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet';
import { LoginForm } from '../../components/LoginForm/LoginForm';

export const Login = () => {
  return (
    <>
      <Helmet>
        <title>Login | Schedule Builder</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="centerPage">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent>
              <LoginForm />
              {/* {import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID && (
                <div className="mt-6 flex flex-col gap-2">
                  <GoogleSSOButton />
                </div>
              )}
              <Link className="mt-6 block text-center" to="/password-reset">
                Password Reset
              </Link>
              <p className="mt-6 text-center">
                Don't have an account? <Link to="/sign-up">Sign Up</Link>
              </p> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
