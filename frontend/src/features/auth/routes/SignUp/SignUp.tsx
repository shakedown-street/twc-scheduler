import { Card, Container } from '@/ui';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { GoogleSSOButton } from '../../components/GoogleSSOButton/GoogleSSOButton';
import { SignUpForm } from '../../components/SignUpForm/SignUpForm';

export const SignUp = () => {
  return (
    <>
      <Helmet>
        <title>Sign Up | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="centerPage">
          <Card fluid>
            <h1 className="mb-4 text-center">Sign Up</h1>
            <SignUpForm />
            {import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID && (
              <div className="mt-6 flex flex-col gap-2">
                <GoogleSSOButton label="Sign up with Google" />
              </div>
            )}
            <p className="mt-6 text-center">
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </Card>
        </div>
      </Container>
    </>
  );
};
