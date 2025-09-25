import { Card, Container } from '@/ui';
import { Helmet } from 'react-helmet';
import { LoginForm } from '../../components/LoginForm/LoginForm';

export const Login = () => {
  return (
    <>
      <Helmet>
        <title>Login | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="centerPage">
          <Card fluid>
            <h1 className="mb-4 text-center">Login</h1>
            <LoginForm />
            {/* {import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID && (
              <div className="flex flex-col gap-2 mt-6">
                <GoogleSSOButton />
              </div>
            )}
            <Link className="block mt-6 text-center" to="/password-reset">
              Password Reset
            </Link>
            <p className="mt-6 text-center">
              Don't have an account? <Link to="/sign-up">Sign Up</Link>
            </p> */}
          </Card>
        </div>
      </Container>
    </>
  );
};
