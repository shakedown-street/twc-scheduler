import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, Container } from '~/ui';
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
              <div className="flex flex-column gap-2 mt-6">
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
