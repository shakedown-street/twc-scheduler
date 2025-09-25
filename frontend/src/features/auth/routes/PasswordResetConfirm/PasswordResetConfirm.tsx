import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { PasswordResetConfirmForm } from '../../components/PasswordResetConfirmForm/PasswordResetConfirmForm';

export const PasswordResetConfirm = () => {
  const { uid, token } = useParams();

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
              <PasswordResetConfirmForm uid={uid} token={token} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
