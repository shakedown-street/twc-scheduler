import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { GoogleSSOButton } from '../../components/GoogleSSOButton/GoogleSSOButton';
import { SignUpForm } from '../../components/SignUpForm/SignUpForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SignUp = () => {
  return (
    <>
      <Helmet>
        <title>Sign Up | Schedule Builder</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="centerPage">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
              <SignUpForm />
              {import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID && (
                <div className="mt-6 flex flex-col gap-2">
                  <GoogleSSOButton label="Sign up with Google" />
                </div>
              )}
              <p className="mt-6 text-center">
                Already have an account? <Link to="/login">Log In</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
